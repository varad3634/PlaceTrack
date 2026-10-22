import { body } from 'express-validator';
import { validateRequest } from './authValidator.js';

export const createCompanyValidator = [
  body('name').trim().notEmpty().withMessage('Company name is required'),
  body('industry').trim().notEmpty().withMessage('Industry is required'),
  body('hrContactName').trim().notEmpty().withMessage('HR contact name is required'),
  body('hrContactEmail')
    .isEmail()
    .withMessage('Valid HR contact email is required')
    .normalizeEmail(),
  validateRequest,
];

export const updateCompanyValidator = [
  body('hrContactEmail')
    .optional()
    .isEmail()
    .withMessage('Valid HR contact email is required')
    .normalizeEmail(),
  validateRequest,
];
