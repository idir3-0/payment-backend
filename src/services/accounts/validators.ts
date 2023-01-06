import { check } from 'express-validator';

export const setupUserAccountValidation = () => [
  check('firstName').notEmpty().trim().escape(),
  check('lastName').notEmpty().trim().escape(),
  check('address.street').notEmpty().trim().escape(),
  check('address.city').notEmpty().trim().escape(),
  check('address.country').isIn(['dz']),
  check('address.zipCode').isNumeric(),
  check('nationalIdFile').notEmpty().trim().escape(),
];

export const setupBusinessAccountValidation = () => [
  check('displayName').notEmpty().trim().escape(),
  check('firstName').notEmpty().trim().escape(),
  check('lastName').notEmpty().trim().escape(),
  check('description').notEmpty().trim().escape(),
  check('logo').notEmpty().trim().escape(),
  check('address.street').notEmpty().trim().escape(),
  check('address.city').notEmpty().trim().escape(),
  check('address.country').isIn(['dz']),
  check('address.zipCode').isNumeric(),
  check('businessLegal.tradeRegisterFile').notEmpty().trim().escape(),
  check('businessLegal.taxID').notEmpty().trim().escape(),
];
