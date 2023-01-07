import { check, param } from 'express-validator';
import { Banks, TransactionStatusMap } from 'payment-types';

const commonFields = [
  check('amount').isNumeric().notEmpty(),
  check('bank').isIn(Object.values(Banks)).notEmpty(),
  check('fileURLs.*').trim().escape().isLength({ max: 128, min: 1 }),
  check('note')
    .default('')
    .notEmpty()
    .trim()
    .escape()
    .isLength({ max: 128, min: 1 }),
];
export const createTransactionValidation = () => [...commonFields];

export const listValidation = () => [];

export const updateValidation = () => [
  param('transactionId').notEmpty().trim().escape(),
  ...commonFields,
];

export const adminUpdateValidation = () => [
  param('transactionId')
    .notEmpty()
    .trim()
    .escape()
    .isLength({ max: 64, min: 1 }),
  check('fileURLs.*')
    .default([])
    .trim()
    .escape()
    .isLength({ max: 128, min: 1 }),
  check('note')
    .default('')
    .notEmpty()
    .trim()
    .escape()
    .isLength({ max: 256, min: 1 }),
  check('status')
    .isIn([
      TransactionStatusMap.processing,
      TransactionStatusMap.rejected,
      TransactionStatusMap.accepted,
    ])
    .notEmpty(),
];
