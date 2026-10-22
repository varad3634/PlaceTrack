import Application from '../models/Application.js';
import PlacementDrive from '../models/PlacementDrive.js';
import StudentProfile from '../models/StudentProfile.js';
import InterviewRound from '../models/InterviewRound.js';
import Offer from '../models/Offer.js';
import { checkStudentEligibility } from '../services/eligibilityService.js';
import { logAudit } from '../services/auditService.js';
import { sendNotification } from '../services/notificationService.js';

// Valid status transitions map
const VALID_TRANSITIONS = {
  Applied: ['Shortlisted', 'Rejected', 'Withdrawn'],
  Shortlisted: ['In Process', 'Rejected', 'Withdrawn'],
  'In Process': ['Selected', 'Rejected', 'Withdrawn'],
  Selected: ['Withdrawn'], // Can withdraw even if selected
  Rejected: ['Applied', 'Shortlisted'], // Can reopen only by admin in case of appeal/correction
  Withdrawn: [],
};

// @desc    Get applications with filters and pagination
// @route   GET /api/v1/applications
// @access  Private
export const getApplications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // If student, can only view own applications
    if (req.user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({ user: req.user._id });
      if (!studentProfile) {
        return res.status(200).json({ success: true, count: 0, total: 0, applications: [] });
      }
      query.student = studentProfile._id;
    }

    if (req.query.drive) {
      query.drive = req.query.drive;
    }

    if (req.query.company) {
      query.company = req.query.company;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by student department
    if (req.query.department) {
      const matchingStudents = await StudentProfile.find({
        department: req.query.department,
      }).select('_id');
      query.student = { $in: matchingStudents.map((s) => s._id) };
    }

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email avatar' },
      })
      .populate({
        path: 'drive',
        select: 'jobTitle salaryPackage status applicationDeadline jobLocation',
      })
      .populate('company', 'name industry logoUrl')
      .populate('statusHistory.changedBy', 'name role')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application with full interview & offer details
// @route   GET /api/v1/applications/:id
// @access  Private
export const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email avatar' },
      })
      .populate({
        path: 'drive',
        populate: { path: 'company' },
      })
      .populate('company')
      .populate('statusHistory.changedBy', 'name role');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Student access check
    if (
      req.user.role === 'student' &&
      application.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own application.',
      });
    }

    // Fetch interview rounds
    const interviewRounds = await InterviewRound.find({
      application: application._id,
    }).sort({ roundNumber: 1 });

    // Fetch offer if exists
    const offer = await Offer.findOne({ application: application._id });

    res.status(200).json({
      success: true,
      application,
      interviewRounds,
      offer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply to placement drive (Enforces eligibility + deadline + duplicate check)
// @route   POST /api/v1/applications
// @access  Private (Student only)
export const applyToDrive = async (req, res, next) => {
  try {
    const { driveId } = req.body;

    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (!studentProfile) {
      return res.status(400).json({
        success: false,
        message: 'Student profile not found. Please complete your academic profile before applying.',
      });
    }

    const drive = await PlacementDrive.findById(driveId).populate('company');
    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found.',
      });
    }

    // 1. Run deterministic eligibility check
    const eligibilityResult = checkStudentEligibility(studentProfile, drive);
    if (!eligibilityResult.isEligible) {
      return res.status(400).json({
        success: false,
        message: 'You are not eligible to apply for this placement drive.',
        reasons: eligibilityResult.reasons,
      });
    }

    // 2. Check for duplicate application
    const existingApplication = await Application.findOne({
      student: studentProfile._id,
      drive: drive._id,
    });
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: `You have already applied for this drive on ${new Date(
          existingApplication.appliedAt
        ).toLocaleDateString()}. Status: ${existingApplication.status}`,
      });
    }

    // 3. Create application
    const application = await Application.create({
      student: studentProfile._id,
      user: req.user._id,
      drive: drive._id,
      company: drive.company._id,
      status: 'Applied',
      statusHistory: [
        {
          status: 'Applied',
          changedAt: new Date(),
          changedBy: req.user._id,
          comment: 'Application submitted successfully by student.',
        },
      ],
    });

    await logAudit({
      action: 'APPLICATION_SUBMITTED',
      performedBy: req.user._id,
      role: req.user.role,
      targetModel: 'Application',
      targetId: application._id,
      details: { driveTitle: drive.jobTitle, company: drive.company.name },
    });

    // In-app confirmation notification to student
    await sendNotification({
      recipientId: req.user._id,
      title: 'Application Submitted',
      message: `Your application for ${drive.jobTitle} at ${drive.company.name} has been received. Track updates in your applications dashboard.`,
      type: 'application',
      link: `/applications/${application._id}`,
    });

    const populatedApp = await Application.findById(application._id)
      .populate('drive', 'jobTitle salaryPackage')
      .populate('company', 'name industry logoUrl');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      application: populatedApp,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (TPO, Admin or Student withdrawal)
// @route   PATCH /api/v1/applications/:id/status
// @access  Private
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, comment = '' } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('user', 'name email')
      .populate('company', 'name')
      .populate('drive', 'jobTitle');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    const currentStatus = application.status;

    // Student can only withdraw
    if (req.user.role === 'student') {
      if (application.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only modify your own application.',
        });
      }

      if (status !== 'Withdrawn') {
        return res.status(403).json({
          success: false,
          message: 'Students can only withdraw their applications.',
        });
      }

      if (!['Applied', 'Shortlisted', 'In Process', 'Selected'].includes(currentStatus)) {
        return res.status(400).json({
          success: false,
          message: `Cannot withdraw application in status '${currentStatus}'.`,
        });
      }
    } else {
      // TPO & Admin: Validate status transition
      const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
      if (!allowedNext.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition: Cannot change from '${currentStatus}' to '${status}'. Allowed transitions: [${allowedNext.join(
            ', '
          )}]`,
        });
      }
    }

    // Apply status change
    application.status = status;
    application.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id,
      comment: comment || `Status updated to ${status} by ${req.user.role.toUpperCase()}`,
    });

    await application.save();

    await logAudit({
      action: 'APPLICATION_STATUS_UPDATED',
      performedBy: req.user._id,
      role: req.user.role,
      targetModel: 'Application',
      targetId: application._id,
      details: { from: currentStatus, to: status, comment },
    });

    // Notify student regarding status progression
    await sendNotification({
      recipientId: application.user._id,
      title: `Application Status Updated: ${status}`,
      message: `Your application for ${application.drive?.jobTitle} at ${application.company?.name} is now: ${status}. ${comment}`,
      type: 'application',
      link: `/applications/${application._id}`,
    });

    res.status(200).json({
      success: true,
      message: `Application status updated to '${status}'.`,
      application,
    });
  } catch (error) {
    next(error);
  }
};
