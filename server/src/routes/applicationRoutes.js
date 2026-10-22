import express from 'express';
import {
  getApplications,
  getApplicationById,
  applyToDrive,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import {
  scheduleInterview,
} from '../controllers/interviewController.js';
import {
  createOffer,
} from '../controllers/offerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  applyDriveValidator,
  updateApplicationStatusValidator,
  scheduleInterviewValidator,
} from '../validators/applicationValidator.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getApplications)
  .post(authorize('student'), applyDriveValidator, applyToDrive);

router.route('/:id').get(getApplicationById);

router.patch(
  '/:id/status',
  updateApplicationStatusValidator,
  updateApplicationStatus
);

// Nested routes for interview scheduling and offers
router.post(
  '/:id/interviews',
  authorize('admin', 'tpo'),
  scheduleInterviewValidator,
  scheduleInterview
);

router.post(
  '/:id/offer',
  authorize('admin', 'tpo'),
  createOffer
);

export default router;
