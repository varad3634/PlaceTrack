import express from 'express';
import {
  getUsers,
  updateUserByAdmin,
  getAuditLogs,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.patch('/users/:id', updateUserByAdmin);
router.get('/audit-logs', getAuditLogs);

export default router;
