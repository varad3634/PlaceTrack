import InterviewRound from '../models/InterviewRound.js';
import Application from '../models/Application.js';
import StudentProfile from '../models/StudentProfile.js';
import { logAudit } from '../services/auditService.js';
import { sendNotification } from '../services/notificationService.js';

// @desc    Get interview rounds
// @route   GET /api/v1/interviews
// @access  Private
export const getInterviews = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({ user: req.user._id });
      if (!studentProfile) {
        return res.status(200).json({ success: true, count: 0, interviews: [] });
      }
      query.student = studentProfile._id;
    }

    if (req.query.application) {
      query.application = req.query.application;
    }

    if (req.query.drive) {
      query.drive = req.query.drive;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter upcoming (scheduledDate >= now)
    if (req.query.upcoming === 'true') {
      query.scheduledDate = { $gte: new Date() };
    }

    const interviews = await InterviewRound.find(query)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email avatar' },
      })
      .populate({
        path: 'drive',
        select: 'jobTitle company salaryPackage',
        populate: { path: 'company', select: 'name logoUrl' },
      })
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule interview round for an application
// @route   POST /api/v1/applications/:id/interviews
// @access  Private (Admin, TPO)
export const scheduleInterview = async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;
    const {
      roundNumber,
      roundName,
      scheduledDate,
      venueOrLink = 'Seminar Hall 1 / Online',
      interviewerName = '',
    } = req.body;

    const application = await Application.findById(applicationId)
      .populate('student')
      .populate('user')
      .populate('drive')
      .populate('company');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    if (['Rejected', 'Withdrawn'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot schedule interview for an application in '${application.status}' status.`,
      });
    }

    const interviewRound = await InterviewRound.create({
      application: application._id,
      drive: application.drive._id,
      student: application.student._id,
      roundNumber: Number(roundNumber),
      roundName,
      scheduledDate: new Date(scheduledDate),
      venueOrLink,
      interviewerName,
      status: 'Scheduled',
    });

    // Automatically transition application to 'In Process' if it was 'Applied' or 'Shortlisted'
    if (['Applied', 'Shortlisted'].includes(application.status)) {
      application.status = 'In Process';
      application.currentRound = Number(roundNumber);
      application.statusHistory.push({
        status: 'In Process',
        changedAt: new Date(),
        changedBy: req.user._id,
        comment: `Interview scheduled: Round ${roundNumber} (${roundName})`,
      });
      await application.save();
    }

    await logAudit({
      action: 'INTERVIEW_SCHEDULED',
      performedBy: req.user._id,
      role: req.user.role,
      targetModel: 'InterviewRound',
      targetId: interviewRound._id,
      details: { roundNumber, roundName, date: scheduledDate },
    });

    // Notify student about scheduled interview
    await sendNotification({
      recipientId: application.user._id,
      title: `Interview Scheduled: ${roundName}`,
      message: `Round ${roundNumber} (${roundName}) for ${application.drive.jobTitle} at ${application.company.name} is scheduled on ${new Date(
        scheduledDate
      ).toLocaleString()}. Venue/Link: ${venueOrLink}`,
      type: 'interview',
      link: `/applications/${application._id}`,
    });

    res.status(201).json({
      success: true,
      message: 'Interview round scheduled successfully.',
      interview: interviewRound,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update interview round outcome and feedback
// @route   PATCH /api/v1/interviews/:id
// @access  Private (Admin, TPO)
export const updateInterviewRound = async (req, res, next) => {
  try {
    const { status, feedback = '', interviewerName } = req.body;

    const interview = await InterviewRound.findById(req.params.id)
      .populate('application')
      .populate({ path: 'student', populate: { path: 'user' } })
      .populate('drive');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview round not found.',
      });
    }

    if (status) interview.status = status;
    if (feedback !== undefined) interview.feedback = feedback;
    if (interviewerName) interview.interviewerName = interviewerName;

    await interview.save();

    // If marked Cleared, update application's current round
    if (status === 'Cleared' && interview.application) {
      const application = await Application.findById(interview.application._id);
      if (application) {
        application.currentRound = interview.roundNumber + 1;
        application.statusHistory.push({
          status: application.status,
          changedAt: new Date(),
          changedBy: req.user._id,
          comment: `Cleared Round ${interview.roundNumber} (${interview.roundName})`,
        });
        await application.save();
      }
    }

    await logAudit({
      action: 'INTERVIEW_OUTCOME_UPDATED',
      performedBy: req.user._id,
      role: req.user.role,
      targetModel: 'InterviewRound',
      targetId: interview._id,
      details: { status, roundNumber: interview.roundNumber },
    });

    // Notify student regarding result
    if (interview.student?.user) {
      await sendNotification({
        recipientId: interview.student.user._id,
        title: `Interview Result: Round ${interview.roundNumber} (${interview.roundName})`,
        message: `Your interview status is now: ${status}. ${
          feedback ? `Feedback: "${feedback}"` : ''
        }`,
        type: 'interview',
        link: `/applications/${interview.application._id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Interview round updated successfully.',
      interview,
    });
  } catch (error) {
    next(error);
  }
};
