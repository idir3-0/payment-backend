import { body, check, param } from 'express-validator';
import { Banks } from './models';

const note = check('note').default('').notEmpty().trim().escape();
const fileURLs = check('fileURLs.*').default([]).trim().escape();
const transactionType = body('transactionType')
  .isIn(['deposit', 'withdraw'])
  .notEmpty();
const transactionId = param('transactionId').notEmpty().trim().escape();

export const transactionValidation = () => [
  check('amount').isNumeric().notEmpty(),
  check('bank').isIn(Object.values(Banks)).notEmpty(),
  fileURLs,
  note,
];

export const listValidation = () => [];

export const updateValidation = () => [transactionId, fileURLs, note];

export const adminUpdateValidation = () => [
  transactionId,
  fileURLs,
  note,
  check('status').isIn(['processing', 'rejected', 'accepted']).notEmpty(),
];
