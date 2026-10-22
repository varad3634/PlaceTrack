import express from 'express';
import {
  getInterviews,
  updateInterviewRound,
} from '../controllers/interviewController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { updateInterviewValidator } from '../validators/applicationValidator.js';

const router = express.Router();

router.use(protect);

router.get('/', getInterviews);
router.patch(
  '/:id',
  authorize('admin', 'tpo'),
  updateInterviewValidator,
  updateInterviewRound
);

export default router;
