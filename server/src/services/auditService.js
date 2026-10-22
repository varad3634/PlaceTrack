import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({
  action,
  performedBy,
  role,
  targetModel = '',
  targetId = null,
  details = {},
  ipAddress = '',
}) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      role,
      targetModel,
      targetId,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error('Failed to create audit log entry:', error.message);
  }
};
