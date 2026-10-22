import express from 'express';
import {
  getOffers,
  updateOfferStatus,
} from '../controllers/offerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getOffers);
router.patch('/:id', updateOfferStatus);

export default router;
