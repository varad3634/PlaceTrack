import PlacementDrive from '../models/PlacementDrive.js';
import Company from '../models/Company.js';
import Application from '../models/Application.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import {
  checkStudentEligibility,
  evaluateStudentsForDrive,
} from '../services/eligibilityService.js';
import { logAudit } from '../services/auditService.js';
import { sendBulkNotifications } from '../services/notificationService.js';

// @desc    Get all placement drives
// @route   GET /api/v1/drives
// @access  Private
export const getDrives = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Students only see published drives by default unless specified
    if (req.user.role === 'student') {
      query.status = 'Published';
    } else if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.company) {
      query.company = req.query.company;
    }

    if (req.query.department) {
      query.eligibleDepartments = req.query.department;
    }

    if (req.query.minSalary) {
      query.salaryPackage = { $gte: Number(req.query.minSalary) };
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      const matchingCompanies = await Company.find({
        name: searchRegex,
      }).select('_id');

      query.$or = [
        { jobTitle: searchRegex },
        { jobLocation: searchRegex },
        { requiredSkills: searchRegex },
        { company: { $in: matchingCompanies.map((c) => c._id) } },
      ];
    }

    const total = await PlacementDrive.countDocuments(query);
    const drives = await PlacementDrive.find(query)
      .populate('company', 'name industry logoUrl website location')
      .populate('createdBy', 'name email role')
      .sort({ applicationDeadline: 1 })
      .skip(skip)
      .limit(limit);

    // Attach application counts and student application status if student
    const driveIds = drives.map((d) => d._id);
    const appCounts = await Application.aggregate([
      { $match: { drive: { $in: driveIds } } },
      { $group: { _id: '$drive', count: { $sum: 1 } } },
    ]);
    const appCountMap = new Map();
    appCounts.forEach((a) => appCountMap.set(a._id.toString(), a.count));

    let studentProfile = null;
    let studentApplicationsMap = new Map();
    if (req.user.role === 'student') {
      studentProfile = await StudentProfile.findOne({ user: req.user._id });
      if (studentProfile) {
        const studentApps = await Application.find({
          student: studentProfile._id,
          drive: { $in: driveIds },
        });
        studentApps.forEach((a) =>
          studentApplicationsMap.set(a.drive.toString(), a.status)
        );
      }
    }

    const enrichedDrives = drives.map((drive) => {
      const driveObj = drive.toObject();
      driveObj.applicationsCount = appCountMap.get(drive._id.toString()) || 0;

      if (req.user.role === 'student' && studentProfile) {
        const evaluation = checkStudentEligibility(studentProfile, drive);
        driveObj.eligibility = evaluation;
        driveObj.hasApplied = studentApplicationsMap.has(drive._id.toString());
        driveObj.applicationStatus =
          studentApplicationsMap.get(drive._id.toString()) || null;
      }

      return driveObj;
    });

    res.status(200).json({
      success: true,
      count: drives.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      drives: enrichedDrives,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single drive by ID
// @route   GET /api/v1/drives/:id
// @access  Private
export const getDriveById = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id)
      .populate('company')
      .populate('createdBy', 'name email');

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found.',
      });
    }

    const applicationsCount = await Application.countDocuments({ drive: drive._id });
    const driveObj = drive.toObject();
    driveObj.applicationsCount = applicationsCount;

    // If student, compute eligibility and application status
    if (req.user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({ user: req.user._id });
      if (studentProfile) {
        driveObj.eligibility = checkStudentEligibility(studentProfile, drive);
        const application = await Application.findOne({
          drive: drive._id,
          student: studentProfile._id,
        });
        driveObj.hasApplied = !!application;
        driveObj.application = application;
      }
    }

    res.status(200).json({
      success: true,
      drive: driveObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new placement drive
// @route   POST /api/v1/drives
// @access  Private (Admin, TPO)
export const createDrive = async (req, res, next) => {
  try {
    const {
      company,
      jobTitle,
      jobDescription,
      jobType = 'Full-Time',
      jobLocation = 'Pan India',
      salaryPackage,
      requiredSkills = [],
      minCgpa = 6.0,
      maxBacklogs = 0,
      eligibleDepartments,
      graduationYears,
      applicationOpenDate = Date.now(),
      applicationDeadline,
      driveDate = null,
      status = 'Draft',
    } = req.body;

    const companyDoc = await Company.findById(company);
    if (!companyDoc) {
      return res.status(404).json({
        success: false,
        message: 'Selected company does not exist.',
      });
    }

    const drive = await PlacementDrive.create({
      company,
      jobTitle,
      jobDescription,
      jobType,
      jobLocation,
      salaryPackage: Number(salaryPackage),
      requiredSkills: Array.isArray(requiredSkills)
        ? requiredSkills
        : requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      minCgpa: Number(minCgpa),
      maxBacklogs: Number(maxBacklogs),
      eligibleDepartments: Array.isArray(eligibleDepartments)
        ? eligibleDepartments
        : eligibleDepartments.split(',').map((d) => d.trim()).filter(Boolean),
      graduationYears: Array.isArray(graduationYears)
        ? graduationYears.map(Number)
        : graduationYears.split(',').map((y) => Number(y.trim())),
      applicationOpenDate,
      applicationDeadline,
      driveDate,
      status,
      createdBy: req.user._id,
    });

    await logAudit({
      action: 'DRIVE_CREATED',
      performedBy: req.user._id,
      role: req.user.role,
      targetModel: 'PlacementDrive',
      targetId: drive._id,
      details: { jobTitle, companyName: companyDoc.name, status },
    });

    // If directly created as Published, notify eligible students
    if (status === 'Published') {
      notifyEligibleStudents(drive, companyDoc);
    }

    const populatedDrive = await PlacementDrive.findById(drive._id).populate('company');

    res.status(201).json({
      success: true,
      message: 'Placement drive created successfully.',
      drive: populatedDrive,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update placement drive
// @route   PATCH /api/v1/drives/:id
// @access  Private (Admin, TPO)
export const updateDrive = async (req, res, next) => {
  try {
    let drive = await PlacementDrive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found.',
      });
    }

    const updatedDrive = await PlacementDrive.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('company');

    await logAudit({
      action: 'DRIVE_UPDATED',
      performedBy: req.user._id,
      role: req.user.role,
      targetModel: 'PlacementDrive',
      targetId: drive._id,
    });

    res.status(200).json({
      success: true,
      message: 'Placement drive updated successfully.',
      drive: updatedDrive,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change placement drive status (Draft -> Published -> Closed -> Cancelled)
// @route   PATCH /api/v1/drives/:id/status
// @access  Private (Admin, TPO)
export const updateDriveStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const drive = await PlacementDrive.findById(req.params.id).populate('company');

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found.',
      });
    }

    const oldStatus = drive.status;
    drive.status = status;
    await drive.save();

    await logAudit({
      action: 'DRIVE_STATUS_CHANGED',
      performedBy: req.user._id,
      role: req.user.role,
      targetModel: 'PlacementDrive',
      targetId: drive._id,
      details: { from: oldStatus, to: status },
    });

    // If transitioned to Published, notify eligible students
    if (status === 'Published' && oldStatus !== 'Published') {
      notifyEligibleStudents(drive, drive.company);
    }

    res.status(200).json({
      success: true,
      message: `Placement drive status updated to '${status}'.`,
      drive,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get eligibility summary for a specific drive (eligible vs ineligible students)
// @route   GET /api/v1/drives/:id/eligibility
// @access  Private (Admin, TPO)
export const getDriveEligibilitySummary = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id).populate('company');

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found.',
      });
    }

    const students = await StudentProfile.find()
      .populate('user', 'name email department isActive')
      .sort({ cgpa: -1 });

    const evaluation = evaluateStudentsForDrive(students, drive);

    res.status(200).json({
      success: true,
      drive: {
        _id: drive._id,
        jobTitle: drive.jobTitle,
        company: drive.company?.name,
        minCgpa: drive.minCgpa,
        maxBacklogs: drive.maxBacklogs,
        eligibleDepartments: drive.eligibleDepartments,
        graduationYears: drive.graduationYears,
        status: drive.status,
        applicationDeadline: drive.applicationDeadline,
      },
      ...evaluation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete drive
// @route   DELETE /api/v1/drives/:id
// @access  Private (Admin, TPO)
export const deleteDrive = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found.',
      });
    }

    const appCount = await Application.countDocuments({ drive: drive._id });
    if (appCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete drive with ${appCount} submitted application(s). Cancel or close the drive instead.`,
      });
    }

    await drive.deleteOne();

    await logAudit({
      action: 'DRIVE_DELETED',
      performedBy: req.user._id,
      role: req.user.role,
      targetModel: 'PlacementDrive',
      targetId: req.params.id,
      details: { jobTitle: drive.jobTitle },
    });

    res.status(200).json({
      success: true,
      message: 'Placement drive deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to dispatch notifications to students eligible for newly published drive
async function notifyEligibleStudents(drive, company) {
  try {
    const students = await StudentProfile.find({
      department: { $in: drive.eligibleDepartments },
      graduationYear: { $in: drive.graduationYears },
      cgpa: { $gte: drive.minCgpa },
      activeBacklogs: { $lte: drive.maxBacklogs },
    }).populate('user');

    const notifications = students
      .filter((s) => s.user && s.user.isActive)
      .map((student) => ({
        recipient: student.user._id,
        title: `New Placement Drive: ${company?.name || 'Company'} - ${drive.jobTitle}`,
        message: `You meet the eligibility criteria for ${drive.jobTitle} at ${company?.name || 'Company'}. Package: ${drive.salaryPackage} LPA. Apply before ${new Date(drive.applicationDeadline).toLocaleDateString()}.`,
        type: 'drive',
        link: `/drives/${drive._id}`,
      }));

    if (notifications.length > 0) {
      await sendBulkNotifications(notifications);
    }
  } catch (err) {
    console.error('Error notifying students about published drive:', err.message);
  }
}
