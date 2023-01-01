import { check, query, param } from 'express-validator';
import { InvoiceStatus } from './models';

export const createInvoiceValidation = () => [
  check('billToEmail').isEmail().normalizeEmail(),
  check('items.*.id').notEmpty().trim().escape(),
  check('items.*.line').notEmpty().isNumeric(),
  check('items.*.title').notEmpty().trim().escape(),
  check('items.*.amount').notEmpty().isNumeric(),
  check('messageToClient').notEmpty().trim().escape(),
  check('termAndCondition').notEmpty().trim().escape(),
  check('referenceNumber').notEmpty().trim().escape(),
  check('memoToSelf').notEmpty().trim().escape(),
  check('fileUrl').notEmpty().trim().escape(),
  check('invoiceNumber').notEmpty().trim().escape(),
];

export const listInvoicesValidation = () => [
  query('type').isIn(['created', 'paied']),
];

export const updateInvoiceValidation = () => [
  param('id').isUUID(),
  check('billToEmail').isEmail().normalizeEmail(),
  check('items.*.id').trim().escape(),
  check('items.*.line').isNumeric(),
  check('items.*.title').trim().escape(),
  check('items.*.amount').isNumeric(),
  check('messageToClient').trim().escape(),
  check('termAndCondition').trim().escape(),
  check('referenceNumber').trim().escape(),
  check('memoToSelf').trim().escape(),
  check('fileUrl').trim().escape(),
  check('invoiceNumber').trim().escape(),
  check('status').isIn(Object.values(InvoiceStatus)),
];

export const deleteInvoiceValidation = () => [param('id').isUUID()];

export const getInvoiceValidation = () => [param('id').isUUID()];

export const payInvoiceValidation = () => [
  param('uid').notEmpty(),
  param('id').isUUID().notEmpty(),
];

export const getPayInvoiceValidation = () => [
  param('uid').notEmpty(),
  param('id').isUUID().notEmpty(),
];
