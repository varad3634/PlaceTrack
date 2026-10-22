import { body } from 'express-validator';
import { validateRequest } from './authValidator.js';

export const createDriveValidator = [
  body('company').isMongoId().withMessage('Valid company ID is required'),
  body('jobTitle').trim().notEmpty().withMessage('Job title is required'),
  body('jobDescription').trim().notEmpty().withMessage('Job description is required'),
  body('salaryPackage')
    .isFloat({ min: 0 })
    .withMessage('Salary package (LPA) must be a positive number'),
  body('minCgpa')
    .isFloat({ min: 0, max: 10 })
    .withMessage('Minimum CGPA must be between 0.0 and 10.0'),
  body('maxBacklogs')
    .isInt({ min: 0 })
    .withMessage('Maximum allowed backlogs must be 0 or a positive integer'),
  body('eligibleDepartments')
    .isArray({ min: 1 })
    .withMessage('At least one eligible department must be provided'),
  body('graduationYears')
    .isArray({ min: 1 })
    .withMessage('At least one eligible graduation year must be provided'),
  body('applicationDeadline')
    .isISO8601()
    .withMessage('Valid application deadline date is required'),
  validateRequest,
];

export const updateDriveStatusValidator = [
  body('status')
    .isIn(['Draft', 'Published', 'Closed', 'Cancelled'])
    .withMessage('Status must be one of: Draft, Published, Closed, Cancelled'),
  validateRequest,
];
