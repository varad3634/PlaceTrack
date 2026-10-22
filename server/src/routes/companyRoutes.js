import express from 'express';
import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../controllers/companyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  createCompanyValidator,
  updateCompanyValidator,
} from '../validators/companyValidator.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getCompanies)
  .post(authorize('admin', 'tpo'), createCompanyValidator, createCompany);

router
  .route('/:id')
  .get(getCompanyById)
  .patch(authorize('admin', 'tpo'), updateCompanyValidator, updateCompany)
  .delete(authorize('admin', 'tpo'), deleteCompany);

export default router;
