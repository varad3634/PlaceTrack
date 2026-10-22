import express from 'express';
import {
  getDrives,
  getDriveById,
  createDrive,
  updateDrive,
  updateDriveStatus,
  getDriveEligibilitySummary,
  deleteDrive,
} from '../controllers/driveController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  createDriveValidator,
  updateDriveStatusValidator,
} from '../validators/driveValidator.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getDrives)
  .post(authorize('admin', 'tpo'), createDriveValidator, createDrive);

router
  .route('/:id')
  .get(getDriveById)
  .patch(authorize('admin', 'tpo'), updateDrive)
  .delete(authorize('admin', 'tpo'), deleteDrive);

router.patch(
  '/:id/status',
  authorize('admin', 'tpo'),
  updateDriveStatusValidator,
  updateDriveStatus
);

router.get(
  '/:id/eligibility',
  authorize('admin', 'tpo'),
  getDriveEligibilitySummary
);

export default router;
