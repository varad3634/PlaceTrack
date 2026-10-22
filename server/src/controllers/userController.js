import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { logAudit } from '../services/auditService.js';

// @desc    Get all users (Admin only)
// @route   GET /api/v1/users
// @access  Private (Admin)
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.department) query.department = req.query.department;
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role or status (Admin only)
// @route   PATCH /api/v1/users/:id
// @access  Private (Admin)
export const updateUserByAdmin = async (req, res, next) => {
  try {
    const { role, isActive, department } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = Boolean(isActive);
    if (department) user.department = department;

    await user.save();

    await logAudit({
      action: 'USER_ACCOUNT_UPDATED',
      performedBy: req.user._id,
      role: req.user.role,
      targetModel: 'User',
      targetId: user._id,
      details: { role, isActive, department },
    });

    res.status(200).json({
      success: true,
      message: 'User account updated successfully.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system audit logs (Admin only)
// @route   GET /api/v1/audit-logs
// @access  Private (Admin)
export const getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      logs,
    });
  } catch (error) {
    next(error);
  }
};
