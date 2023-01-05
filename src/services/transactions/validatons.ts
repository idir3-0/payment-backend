import { body, check, query, param } from 'express-validator';
import { Banks } from './models';

const note = check('note').default('').notEmpty().trim().escape();
const fileURLs = check('fileURLs.*').default([]).trim().escape();
const transactionType = body('transactionType')
  .isIn(['deposit', 'withdraw'])
  .notEmpty();
const transactionId = body('transactionId').notEmpty().isUUID();

export const transactionValidation = () => [
  check('amount').isNumeric().notEmpty(),
  check('bank').isIn(Object.values(Banks)).notEmpty(),
  fileURLs,
  note,
];

export const listValidation = () => [transactionType];

export const updateValidation = () => [
  transactionId,
  transactionType,
  fileURLs,
  note,
];

export const adminUpdateValidation = () => [
  transactionId,
  transactionType,
  fileURLs,
  note,
  check('transactionOwner').notEmpty().trim().escape(),
  check('status').isIn(['processing', 'rejected', 'accepted']).notEmpty(),
];
