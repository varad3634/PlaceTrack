import express from 'express';
import {
  login,
  getMe,
  updatePassword,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  loginValidator,
  updatePasswordValidator,
} from '../validators/authValidator.js';

const router = express.Router();

router.post('/login', loginValidator, login);
router.get('/me', protect, getMe);
router.put('/password', protect, updatePasswordValidator, updatePassword);
router.post('/logout', protect, logout);

export default router;
