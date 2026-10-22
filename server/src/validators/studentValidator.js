import { body } from 'express-validator';
import { validateRequest } from './authValidator.js';

export const createStudentValidator = [
  body('name').trim().notEmpty().withMessage('Student name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('prn').trim().notEmpty().withMessage('PRN / Student ID is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('graduationYear')
    .isInt({ min: 2020, max: 2035 })
    .withMessage('Valid graduation year between 2020 and 2035 is required'),
  body('cgpa')
    .isFloat({ min: 0, max: 10 })
    .withMessage('CGPA must be a number between 0.0 and 10.0'),
  body('activeBacklogs')
    .isInt({ min: 0 })
    .withMessage('Active backlogs must be 0 or a positive integer'),
  validateRequest,
];

export const updateStudentValidator = [
  body('cgpa')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('CGPA must be a number between 0.0 and 10.0'),
  body('activeBacklogs')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Active backlogs must be 0 or a positive integer'),
  validateRequest,
];
