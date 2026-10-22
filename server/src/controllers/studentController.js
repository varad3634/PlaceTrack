import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import PlacementDrive from '../models/PlacementDrive.js';
import Application from '../models/Application.js';
import { checkStudentEligibility } from '../services/eligibilityService.js';
import { logAudit } from '../services/auditService.js';

// @desc    Get all students with filters, search, and pagination
// @route   GET /api/v1/students
// @access  Private (Admin, TPO)
export const getStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.department) {
      query.department = req.query.department;
    }

    if (req.query.isPlaced !== undefined) {
      query.isPlaced = req.query.isPlaced === 'true';
    }

    if (req.query.graduationYear) {
      query.graduationYear = Number(req.query.graduationYear);
    }

    if (req.query.minCgpa) {
      query.cgpa = { $gte: Number(req.query.minCgpa) };
    }

    if (req.query.maxBacklogs !== undefined) {
      query.activeBacklogs = { $lte: Number(req.query.maxBacklogs) };
    }

    let searchConditions = [];
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      searchConditions = [{ prn: searchRegex }, { skills: searchRegex }];

      // Also search User names/emails matching search query
      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      }).select('_id');

      if (matchingUsers.length > 0) {
        searchConditions.push({ user: { $in: matchingUsers.map((u) => u._id) } });
      }

      query.$or = searchConditions;
    }

    const total = await StudentProfile.countDocuments(query);
    const students = await StudentProfile.find(query)
      .populate('user', 'name email role department avatar isActive')
      .populate('placedCompany', 'name industry')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student by ID (profile ID or user ID)
// @route   GET /api/v1/students/:id
// @access  Private
export const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find by StudentProfile _id or user _id
    let student = await StudentProfile.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { user: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    })
      .populate('user', 'name email role department avatar isActive')
      .populate('placedCompany', 'name industry website');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.',
      });
    }

    // Role check: Students can only view their own profile
    if (
      req.user.role === 'student' &&
      student.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own student profile.',
      });
    }

    // Fetch student applications
    const applications = await Application.find({ student: student._id })
      .populate({
        path: 'drive',
        select: 'jobTitle salaryPackage status company applicationDeadline',
        populate: { path: 'company', select: 'name logoUrl' },
      })
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      student,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new student (User + StudentProfile)
// @route   POST /api/v1/students
// @access  Private (Admin, TPO)
export const createStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password = 'Password@123',
      prn,
      department,
      academicYear = 'Final Year',
      graduationYear,
      cgpa,
      activeBacklogs = 0,
      totalBacklogs = 0,
      skills = [],
      phone = '',
      resumeUrl = '',
      linkedinUrl = '',
      githubUrl = '',
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `An account with email '${email}' already exists.`,
      });
    }

    // Check if PRN already exists
    const existingPrn = await StudentProfile.findOne({ prn: prn.toUpperCase() });
    if (existingPrn) {
      return res.status(400).json({
        success: false,
        message: `Student with PRN '${prn.toUpperCase()}' already exists.`,
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'student',
      department,
    });

    // Create profile
    const studentProfile = await StudentProfile.create({
      user: user._id,
      prn: prn.toUpperCase(),
      department,
      academicYear,
      graduationYear: Number(graduationYear),
      cgpa: Number(cgpa),
      activeBacklogs: Number(activeBacklogs),
      totalBacklogs: Number(totalBacklogs),
      skills: Array.isArray(skills)
        ? skills
        : skills.split(',').map((s) => s.trim()).filter(Boolean),
      phone,
      resumeUrl,
      linkedinUrl,
      githubUrl,
    });

    await logAudit({
      action: 'STUDENT_REGISTERED',
      performedBy: req.user._id,
      role: req.user.role,
      targetModel: 'StudentProfile',
      targetId: studentProfile._id,
      details: { email, prn },
    });

    const populatedStudent = await StudentProfile.findById(studentProfile._id).populate(
      'user',
      'name email role department avatar'
    );

    res.status(201).json({
      success: true,
      message: 'Student registered successfully.',
      student: populatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student profile
// @route   PATCH /api/v1/students/:id
// @access  Private
export const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    let student = await StudentProfile.findById(id).populate('user');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.',
      });
    }

    const isStudentUser = req.user.role === 'student';
    if (isStudentUser && student.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only update your own profile.',
      });
    }

    // Protected administrative fields that students cannot modify
    if (isStudentUser) {
      const forbiddenFields = [
        'cgpa',
        'activeBacklogs',
        'totalBacklogs',
        'department',
        'prn',
        'isPlaced',
        'placedCompany',
        'placedPackage',
        'academicYear',
        'graduationYear',
      ];
      for (const field of forbiddenFields) {
        if (req.body[field] !== undefined) {
          return res.status(403).json({
            success: false,
            message: `Students are not permitted to modify administrative field '${field}'. Contact TPO office.`,
          });
        }
      }
    }

    // Permitted updates for student: skills, phone, resumeUrl, linkedinUrl, githubUrl
    if (req.body.skills !== undefined) {
      student.skills = Array.isArray(req.body.skills)
        ? req.body.skills
        : req.body.skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (req.body.phone !== undefined) student.phone = req.body.phone;
    if (req.body.resumeUrl !== undefined) student.resumeUrl = req.body.resumeUrl;
    if (req.body.linkedinUrl !== undefined) student.linkedinUrl = req.body.linkedinUrl;
    if (req.body.githubUrl !== undefined) student.githubUrl = req.body.githubUrl;

    // Admin & TPO permitted updates
    if (!isStudentUser) {
      if (req.body.cgpa !== undefined) student.cgpa = Number(req.body.cgpa);
      if (req.body.activeBacklogs !== undefined)
        student.activeBacklogs = Number(req.body.activeBacklogs);
      if (req.body.totalBacklogs !== undefined)
        student.totalBacklogs = Number(req.body.totalBacklogs);
      if (req.body.department !== undefined) student.department = req.body.department;
      if (req.body.academicYear !== undefined) student.academicYear = req.body.academicYear;
      if (req.body.graduationYear !== undefined)
        student.graduationYear = Number(req.body.graduationYear);
      if (req.body.isPlaced !== undefined) student.isPlaced = Boolean(req.body.isPlaced);
      if (req.body.placedCompany !== undefined) student.placedCompany = req.body.placedCompany;
      if (req.body.placedPackage !== undefined)
        student.placedPackage = req.body.placedPackage;

      // Also allow updating user's name if provided
      if (req.body.name && student.user) {
        await User.findByIdAndUpdate(student.user._id, { name: req.body.name });
      }
    }

    await student.save();

    await logAudit({
      action: 'STUDENT_PROFILE_UPDATED',
      performedBy: req.user._id,
      role: req.user.role,
      targetModel: 'StudentProfile',
      targetId: student._id,
    });

    const updatedStudent = await StudentProfile.findById(student._id)
      .populate('user', 'name email role department avatar')
      .populate('placedCompany', 'name industry');

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully.',
      student: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student record
// @route   DELETE /api/v1/students/:id
// @access  Private (Admin, TPO)
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await StudentProfile.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.',
      });
    }

    // Delete associated User account and applications
    await User.findByIdAndDelete(student.user);
    await Application.deleteMany({ student: student._id });
    await student.deleteOne();

    await logAudit({
      action: 'STUDENT_DELETED',
      performedBy: req.user._id,
      role: req.user.role,
      targetModel: 'StudentProfile',
      targetId: req.params.id,
      details: { prn: student.prn },
    });

    res.status(200).json({
      success: true,
      message: 'Student and associated account removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check student eligibility across all active placement drives
// @route   GET /api/v1/students/:id/eligibility
// @access  Private
export const getStudentEligibilityMatrix = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await StudentProfile.findById(id).populate('user');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.',
      });
    }

    const drives = await PlacementDrive.find({ status: 'Published' })
      .populate('company', 'name industry logoUrl')
      .sort({ applicationDeadline: 1 });

    // Check student's current applications
    const applications = await Application.find({ student: student._id }).select('drive status');
    const appliedDriveMap = new Map();
    applications.forEach((app) => appliedDriveMap.set(app.drive.toString(), app.status));

    const eligibilityResults = drives.map((drive) => {
      const evaluation = checkStudentEligibility(student, drive);
      return {
        drive: {
          _id: drive._id,
          jobTitle: drive.jobTitle,
          salaryPackage: drive.salaryPackage,
          company: drive.company,
          applicationDeadline: drive.applicationDeadline,
          minCgpa: drive.minCgpa,
          maxBacklogs: drive.maxBacklogs,
          eligibleDepartments: drive.eligibleDepartments,
          graduationYears: drive.graduationYears,
          jobLocation: drive.jobLocation,
        },
        isEligible: evaluation.isEligible,
        reasons: evaluation.reasons,
        hasApplied: appliedDriveMap.has(drive._id.toString()),
        applicationStatus: appliedDriveMap.get(drive._id.toString()) || null,
      };
    });

    res.status(200).json({
      success: true,
      student: {
        _id: student._id,
        name: student.user?.name,
        prn: student.prn,
        department: student.department,
        cgpa: student.cgpa,
        activeBacklogs: student.activeBacklogs,
        graduationYear: student.graduationYear,
      },
      results: eligibilityResults,
    });
  } catch (error) {
    next(error);
  }
};
