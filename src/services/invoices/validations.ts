import { check, query, param } from 'express-validator';
import { InvoiceStatusMap, InvoiceUserMap } from './models';

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
  check('fileURLs.*').default([]).trim().escape(),
  check('invoiceNumber').notEmpty().trim().escape(),
];

export const listInvoicesValidation = () => [
  query('key')
    .default(InvoiceUserMap.createdBy)
    .isIn([InvoiceUserMap.createdBy, InvoiceUserMap.payerId]),
];

export const updateInvoiceValidation = () => [
  param('invoiceId').notEmpty().trim().escape(),
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
  check('status').isIn(Object.values(InvoiceStatusMap)),
];

export const deleteInvoiceValidation = () => [param('invoiceId').notEmpty()];

export const getInvoiceValidation = () => [param('invoiceId').notEmpty()];

export const payInvoiceValidation = () => [
  param('invoiceId').notEmpty().notEmpty(),
];
