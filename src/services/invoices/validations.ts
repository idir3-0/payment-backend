import { check, query, param } from 'express-validator';
import { InvoiceStatusMap, InvoiceUserMap } from 'payment-types';

const commonFields = [
  check('billToEmail').isEmail().normalizeEmail().isLength({ max: 64, min: 1 }),
  check('items.*.id').notEmpty().trim().escape().isLength({ max: 16, min: 1 }),
  check('items.*.line').notEmpty().isNumeric(),
  check('items.*.title')
    .notEmpty()
    .trim()
    .escape()
    .isLength({ max: 32, min: 1 }),
  check('items.*.amount').notEmpty().isNumeric(),
  check('messageToClient')
    .notEmpty()
    .trim()
    .escape()
    .isLength({ max: 256, min: 1 }),
  check('termAndCondition')
    .notEmpty()
    .trim()
    .escape()
    .isLength({ max: 1024, min: 1 }),
  check('referenceNumber').notEmpty().trim().escape(),
  check('memoToSelf').notEmpty().trim().escape().isLength({ max: 256, min: 1 }),
  check('fileURLs.*').trim().escape().isLength({ max: 128, min: 1 }),
  check('invoiceNumber')
    .notEmpty()
    .trim()
    .escape()
    .isLength({ max: 32, min: 1 }),
  check('status')
    .default(InvoiceStatusMap.draft)
    .isIn(Object.keys(InvoiceStatusMap)),
];
export const createInvoiceValidation = () => [...commonFields];

export const listInvoicesValidation = () => [
  query('key')
    .default(InvoiceUserMap.createdBy)
    .isIn([InvoiceUserMap.createdBy, InvoiceUserMap.payerId]),
];

export const updateInvoiceValidation = () => [
  param('invoiceId').notEmpty().trim().escape(),
  ...commonFields,
];

export const deleteInvoiceValidation = () => [param('invoiceId').notEmpty()];

export const getInvoiceValidation = () => [param('invoiceId').notEmpty()];

export const payInvoiceValidation = () => [
  param('invoiceId').notEmpty().notEmpty(),
  check('address.street')
    .notEmpty()
    .trim()
    .escape()
    .isLength({ max: 128, min: 1 }),
  check('address.city')
    .notEmpty()
    .trim()
    .escape()
    .isLength({ max: 32, min: 1 }),
  check('address.country').notEmpty().isIn(['dz']),
  check('address.zipCode').notEmpty().isNumeric(),
];
