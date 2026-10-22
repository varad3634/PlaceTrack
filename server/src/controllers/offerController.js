import Offer from '../models/Offer.js';
import Application from '../models/Application.js';
import StudentProfile from '../models/StudentProfile.js';
import { logAudit } from '../services/auditService.js';
import { sendNotification } from '../services/notificationService.js';

// @desc    Get offers
// @route   GET /api/v1/offers
// @access  Private
export const getOffers = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({ user: req.user._id });
      if (!studentProfile) {
        return res.status(200).json({ success: true, count: 0, offers: [] });
      }
      query.student = studentProfile._id;
    }

    if (req.query.company) {
      query.company = req.query.company;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const offers = await Offer.find(query)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email avatar' },
      })
      .populate('company', 'name industry logoUrl')
      .populate('drive', 'jobTitle salaryPackage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: offers.length,
      offers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate / Extend offer to student application
// @route   POST /api/v1/applications/:id/offer
// @access  Private (Admin, TPO)
export const createOffer = async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;
    const {
      jobRole,
      packageLpa,
      offerLetterUrl = '',
      responseDeadline = null,
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

    // Check if offer already created
    const existingOffer = await Offer.findOne({ application: application._id });
    if (existingOffer) {
      return res.status(400).json({
        success: false,
        message: 'An offer has already been issued for this application.',
      });
    }

    const offer = await Offer.create({
      application: application._id,
      student: application.student._id,
      drive: application.drive._id,
      company: application.company._id,
      jobRole: jobRole || application.drive.jobTitle,
      packageLpa: Number(packageLpa || application.drive.salaryPackage),
      offerLetterUrl,
      responseDeadline: responseDeadline ? new Date(responseDeadline) : null,
      status: 'Pending',
    });

    // Mark application as Selected
    application.status = 'Selected';
    application.statusHistory.push({
      status: 'Selected',
      changedAt: new Date(),
      changedBy: req.user._id,
      comment: `Placement Offer extended: ${offer.jobRole} (${offer.packageLpa} LPA)`,
    });
    await application.save();

    await logAudit({
      action: 'OFFER_EXTENDED',
      performedBy: req.user._id,
      role: req.user.role,
      targetModel: 'Offer',
      targetId: offer._id,
      details: { jobRole: offer.jobRole, packageLpa: offer.packageLpa },
    });

    // Notify student about official job offer!
    await sendNotification({
      recipientId: application.user._id,
      title: `Congratulations! Job Offer from ${application.company.name}`,
      message: `You have received a placement offer for the role of ${offer.jobRole} with a package of ${offer.packageLpa} LPA! Please review and respond in your portal.`,
      type: 'offer',
      link: `/applications/${application._id}`,
    });

    const populatedOffer = await Offer.findById(offer._id)
      .populate('company')
      .populate('drive');

    res.status(201).json({
      success: true,
      message: 'Placement offer generated successfully.',
      offer: populatedOffer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update offer status (Student accepts/declines or TPO modifies)
// @route   PATCH /api/v1/offers/:id
// @access  Private
export const updateOfferStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'Accepted' | 'Declined'
    const offer = await Offer.findById(req.params.id)
      .populate('student')
      .populate('company')
      .populate('drive');

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer record not found.',
      });
    }

    // Role check: If student, verify ownership
    if (req.user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({ user: req.user._id });
      if (!studentProfile || offer.student._id.toString() !== studentProfile._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only respond to your own offer.',
        });
      }

      if (!['Accepted', 'Declined'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Students can only respond with 'Accepted' or 'Declined'.",
        });
      }
    }

    offer.status = status;
    offer.respondedAt = new Date();
    await offer.save();

    // If student accepted offer, mark student profile as placed!
    if (status === 'Accepted') {
      await StudentProfile.findByIdAndUpdate(offer.student._id, {
        isPlaced: true,
        placedCompany: offer.company._id,
        placedPackage: offer.packageLpa,
      });
    } else if (status === 'Declined') {
      // If student previously accepted another offer, do not overwrite unless this was the one
      const studentProfile = await StudentProfile.findById(offer.student._id);
      if (
        studentProfile?.placedCompany?.toString() === offer.company._id.toString()
      ) {
        studentProfile.isPlaced = false;
        studentProfile.placedCompany = null;
        studentProfile.placedPackage = null;
        await studentProfile.save();
      }
    }

    await logAudit({
      action: 'OFFER_STATUS_UPDATED',
      performedBy: req.user._id,
      role: req.user.role,
      targetModel: 'Offer',
      targetId: offer._id,
      details: { status },
    });

    res.status(200).json({
      success: true,
      message: `Offer status updated to '${status}'.`,
      offer,
    });
  } catch (error) {
    next(error);
  }
};
