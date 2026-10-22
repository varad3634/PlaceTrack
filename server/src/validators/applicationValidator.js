import { body } from 'express-validator';
import { validateRequest } from './authValidator.js';

export const applyDriveValidator = [
  body('driveId').isMongoId().withMessage('Valid placement drive ID is required'),
  validateRequest,
];

export const updateApplicationStatusValidator = [
  body('status')
    .isIn(['Applied', 'Shortlisted', 'In Process', 'Selected', 'Rejected', 'Withdrawn'])
    .withMessage('Invalid application status'),
  body('comment').optional().trim(),
  validateRequest,
];

export const scheduleInterviewValidator = [
  body('roundNumber').isInt({ min: 1 }).withMessage('Round number must be at least 1'),
  body('roundName').trim().notEmpty().withMessage('Interview round name is required'),
  body('scheduledDate')
    .isISO8601()
    .withMessage('Valid scheduled date and time is required'),
  validateRequest,
];

export const updateInterviewValidator = [
  body('status')
    .isIn(['Scheduled', 'Completed', 'Cleared', 'Failed', 'Absent', 'Cancelled'])
    .withMessage('Invalid interview status'),
  validateRequest,
];
