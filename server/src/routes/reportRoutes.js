import express from 'express';
import { getPlacementReports } from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/placements', authorize('admin', 'tpo'), getPlacementReports);

export default router;
