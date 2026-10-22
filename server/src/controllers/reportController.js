import StudentProfile from '../models/StudentProfile.js';
import PlacementDrive from '../models/PlacementDrive.js';
import Application from '../models/Application.js';
import Offer from '../models/Offer.js';
import InterviewRound from '../models/InterviewRound.js';

// @desc    Get detailed placement analytics & exportable reports
// @route   GET /api/v1/reports/placements
// @access  Private (Admin, TPO)
export const getPlacementReports = async (req, res, next) => {
  try {
    const { department, graduationYear } = req.query;

    const studentMatch = {};
    if (department) studentMatch.department = department;
    if (graduationYear) studentMatch.graduationYear = Number(graduationYear);

    // 1. Department Breakdown
    const deptStats = await StudentProfile.aggregate([
      { $match: studentMatch },
      {
        $group: {
          _id: '$department',
          totalStudents: { $sum: 1 },
          placedCount: {
            $sum: { $cond: [{ $eq: ['$isPlaced', true] }, 1, 0] },
          },
          avgCgpa: { $avg: '$cgpa' },
          avgPackage: {
            $avg: {
              $cond: [{ $gt: ['$placedPackage', 0] }, '$placedPackage', null],
            },
          },
          maxPackage: { $max: '$placedPackage' },
        },
      },
      {
        $project: {
          department: '$_id',
          totalStudents: 1,
          placedCount: 1,
          unplacedCount: { $subtract: ['$totalStudents', '$placedCount'] },
          avgCgpa: { $round: ['$avgCgpa', 2] },
          avgPackage: { $round: ['$avgPackage', 2] },
          maxPackage: { $ifNull: ['$maxPackage', 0] },
          placementRate: {
            $round: [
              {
                $multiply: [
                  {
                    $cond: [
                      { $eq: ['$totalStudents', 0] },
                      0,
                      { $divide: ['$placedCount', '$totalStudents'] },
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

    // 2. Drive-wise Application & Conversion Metrics
    const drives = await PlacementDrive.find().populate('company', 'name industry');
    const driveStats = await Promise.all(
      drives.map(async (drive) => {
        const [totalApps, shortlisted, inProcess, selected, rejected] =
          await Promise.all([
            Application.countDocuments({ drive: drive._id }),
            Application.countDocuments({
              drive: drive._id,
              status: 'Shortlisted',
            }),
            Application.countDocuments({
              drive: drive._id,
              status: 'In Process',
            }),
            Application.countDocuments({
              drive: drive._id,
              status: 'Selected',
            }),
            Application.countDocuments({
              drive: drive._id,
              status: 'Rejected',
            }),
          ]);

        const conversionRate =
          totalApps > 0 ? Number(((selected / totalApps) * 100).toFixed(1)) : 0;

        return {
          driveId: drive._id,
          jobTitle: drive.jobTitle,
          company: drive.company?.name || 'Unknown',
          salaryPackage: drive.salaryPackage,
          status: drive.status,
          totalApps,
          shortlisted,
          inProcess,
          selected,
          rejected,
          conversionRate,
        };
      })
    );

    // 3. Interview Conversion Funnel
    const interviewFunnel = await InterviewRound.aggregate([
      {
        $group: {
          _id: '$roundName',
          totalScheduled: { $sum: 1 },
          cleared: {
            $sum: { $cond: [{ $eq: ['$status', 'Cleared'] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          stage: '$_id',
          totalScheduled: 1,
          cleared: 1,
          failed: 1,
          absent: 1,
          passRate: {
            $round: [
              {
                $multiply: [
                  {
                    $cond: [
                      { $eq: ['$totalScheduled', 0] },
                      0,
                      { $divide: ['$cleared', '$totalScheduled'] },
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
    ]);

    // 4. Offer Status Breakdown
    const offerStats = await Offer.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgPackage: { $avg: '$packageLpa' },
        },
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          avgPackage: { $round: ['$avgPackage', 2] },
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      deptStats,
      driveStats,
      interviewFunnel,
      offerStats,
    });
  } catch (error) {
    next(error);
  }
};
