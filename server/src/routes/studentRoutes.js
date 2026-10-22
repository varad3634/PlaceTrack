import express from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentEligibilityMatrix,
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  createStudentValidator,
  updateStudentValidator,
} from '../validators/studentValidator.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(authorize('admin', 'tpo'), getStudents)
  .post(authorize('admin', 'tpo'), createStudentValidator, createStudent);

router
  .route('/:id')
  .get(getStudentById)
  .patch(updateStudentValidator, updateStudent)
  .delete(authorize('admin', 'tpo'), deleteStudent);

router.get('/:id/eligibility', getStudentEligibilityMatrix);

export default router;
