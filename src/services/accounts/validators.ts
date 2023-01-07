import { check } from 'express-validator';

const commonFields = [
  check('firstName').notEmpty().trim().escape().isLength({ max: 32, min: 1 }),
  check('lastName').notEmpty().trim().escape().isLength({ max: 32, min: 1 }),
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
export const createUserAccountValidation = () => [
  ...commonFields,
  check('nationalIdURL')
    .notEmpty()
    .trim()
    .escape()
    .isLength({ max: 128, min: 1 }),
];

export const createBusinessAccountValidation = () => [
  ...commonFields,
  check('description')
    .notEmpty()
    .trim()
    .escape()
    .isLength({ max: 512, min: 1 }),
  check('logo').notEmpty().trim().escape().isLength({ max: 128, min: 1 }),
  check('businessLegal.tradeRegisterURL')
    .notEmpty()
    .trim()
    .escape()
    .isLength({ max: 128, min: 1 }),
  check('businessLegal.taxID')
    .notEmpty()
    .trim()
    .escape()
    .isLength({ max: 128, min: 1 }),
];
