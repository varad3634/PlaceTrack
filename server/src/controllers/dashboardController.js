import StudentProfile from '../models/StudentProfile.js';
import Company from '../models/Company.js';
import PlacementDrive from '../models/PlacementDrive.js';
import Application from '../models/Application.js';
import InterviewRound from '../models/InterviewRound.js';
import Offer from '../models/Offer.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Get comprehensive dashboard metrics
// @route   GET /api/v1/dashboard/summary
// @access  Private
export const getDashboardSummary = async (req, res, next) => {
  try {
    const isStudent = req.user.role === 'student';

    if (isStudent) {
      // Student specific dashboard summary
      const student = await StudentProfile.findOne({ user: req.user._id });
      if (!student) {
        return res.status(200).json({
          success: true,
          role: 'student',
          summary: {
            totalApplications: 0,
            activeInterviews: 0,
            offersCount: 0,
            isPlaced: false,
          },
        });
      }

      const [totalApplications, activeInterviews, offers, recentApplications] =
        await Promise.all([
          Application.countDocuments({ student: student._id }),
          InterviewRound.countDocuments({
            student: student._id,
            status: 'Scheduled',
          }),
          Offer.find({ student: student._id }).populate('company drive'),
          Application.find({ student: student._id })
            .populate({
              path: 'drive',
              select: 'jobTitle salaryPackage status',
              populate: { path: 'company', select: 'name logoUrl' },
            })
            .sort({ appliedAt: -1 })
            .limit(5),
        ]);

      const upcomingInterviews = await InterviewRound.find({
        student: student._id,
        scheduledDate: { $gte: new Date() },
      })
        .populate({
          path: 'drive',
          select: 'jobTitle',
          populate: { path: 'company', select: 'name' },
        })
        .sort({ scheduledDate: 1 })
        .limit(5);

      return res.status(200).json({
        success: true,
        role: 'student',
        summary: {
          totalApplications,
          activeInterviews,
          offersCount: offers.length,
          isPlaced: student.isPlaced,
          placedCompany: student.placedCompany,
          placedPackage: student.placedPackage,
          cgpa: student.cgpa,
          activeBacklogs: student.activeBacklogs,
          department: student.department,
        },
        recentApplications,
        upcomingInterviews,
        offers,
      });
    }

    // TPO and Admin comprehensive analytics
    const [
      totalStudents,
      placedStudentsCount,
      totalCompanies,
      activeDrivesCount,
      totalApplications,
      totalOffers,
      upcomingInterviews,
      recentActivities,
    ] = await Promise.all([
      StudentProfile.countDocuments(),
      StudentProfile.countDocuments({ isPlaced: true }),
      Company.countDocuments({ isActive: true }),
      PlacementDrive.countDocuments({ status: 'Published' }),
      Application.countDocuments(),
      Offer.countDocuments(),
      InterviewRound.find({ scheduledDate: { $gte: new Date() } })
        .populate({
          path: 'student',
          populate: { path: 'user', select: 'name email' },
        })
        .populate({
          path: 'drive',
          select: 'jobTitle',
          populate: { path: 'company', select: 'name' },
        })
        .sort({ scheduledDate: 1 })
        .limit(5),
      AuditLog.find()
        .populate('performedBy', 'name role email')
        .sort({ createdAt: -1 })
        .limit(8),
    ]);

    const placementPercentage =
      totalStudents > 0
        ? Number(((placedStudentsCount / totalStudents) * 100).toFixed(1))
        : 0;

    // Department-wise breakdown
    const departmentStats = await StudentProfile.aggregate([
      {
        $group: {
          _id: '$department',
          totalStudents: { $sum: 1 },
          placedStudents: {
            $sum: { $cond: [{ $eq: ['$isPlaced', true] }, 1, 0] },
          },
          avgCgpa: { $avg: '$cgpa' },
        },
      },
      {
        $project: {
          department: '$_id',
          totalStudents: 1,
          placedStudents: 1,
          avgCgpa: { $round: ['$avgCgpa', 2] },
          placementRate: {
            $round: [
              {
                $multiply: [
                  {
                    $cond: [
                      { $eq: ['$totalStudents', 0] },
                      0,
                      { $divide: ['$placedStudents', '$totalStudents'] },
                    ],
                  },
                  100,
                ],
              },
              1,
            ],
          },
        },
      },
      { $sort: { totalStudents: -1 } },
    ]);

    // Company-wise selections
    const companyStats = await Offer.aggregate([
      {
        $group: {
          _id: '$company',
          selectionsCount: { $sum: 1 },
          avgPackage: { $avg: '$packageLpa' },
          maxPackage: { $max: '$packageLpa' },
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: '_id',
          as: 'companyInfo',
        },
      },
      { $unwind: '$companyInfo' },
      {
        $project: {
          companyName: '$companyInfo.name',
          industry: '$companyInfo.industry',
          selectionsCount: 1,
          avgPackage: { $round: ['$avgPackage', 1] },
          maxPackage: 1,
        },
      },
      { $sort: { selectionsCount: -1 } },
      { $limit: 8 },
    ]);

    // Application status distribution
    const applicationStatusDistribution = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]);

    res.status(200).json({
      success: true,
      role: req.user.role,
      metrics: {
        totalStudents,
        placedStudentsCount,
        unplacedStudentsCount: Math.max(0, totalStudents - placedStudentsCount),
        placementPercentage,
        totalCompanies,
        activeDrivesCount,
        totalApplications,
        totalOffers,
      },
      departmentStats,
      companyStats,
      applicationStatusDistribution,
      upcomingInterviews,
      recentActivities,
    });
  } catch (error) {
    next(error);
  }
};
