import { body, check, query, param } from 'express-validator';
import { Banks } from './models';

export const transactionValidation = () => [
  check('amount').isNumeric().notEmpty(),
  check('bank').isIn(Object.values(Banks)).notEmpty(),
  check('fileURLs.*').notEmpty().trim().escape(),
  check('note').notEmpty().trim().escape(),
];

export const listValidation = () => [
  query('type').isIn(['deposit', 'withdraw']).notEmpty(),
];

export const updateValidation = () => [
  param('id').notEmpty().isUUID(),
  param('type').isIn(['deposit', 'withdraw']).notEmpty(),
  check('fileUrls.*').trim().escape(),
  check('note').notEmpty().trim().escape(),
];

export const adminUpdateValidation = () => [
  param('id').notEmpty().isUUID(),
  param('type').isIn(['deposit', 'withdraw']).notEmpty(),
  check('fileUrls.*').trim().escape(),
  check('uid').notEmpty().trim().escape(),
  check('note').notEmpty().trim().escape(),
  check('status').isIn(['processing', 'rejected', 'accepted']).notEmpty(),
];
