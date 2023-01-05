import { check } from 'express-validator';

export const setupUserAccountValidation = () => [
  check('userProfile.firstName').notEmpty().trim().escape(),
  check('userProfile.lastName').notEmpty().trim().escape(),
  check('userProfile.address.street').notEmpty().trim().escape(),
  check('userProfile.address.city').notEmpty().trim().escape(),
  check('userProfile.address.country').isIn(['dz']),
  check('userProfile.address.zipCode').isNumeric(),
  check('userProfile.nationalIdFile').notEmpty().trim().escape(),
];

export const setupBusinessAccountValidation = () => [
  check('businessProfile.displayName').notEmpty().trim().escape(),
  check('businessProfile.firstName').notEmpty().trim().escape(),
  check('businessProfile.lastName').notEmpty().trim().escape(),
  check('businessProfile.description').notEmpty().trim().escape(),
  check('businessProfile.logo').notEmpty().trim().escape(),
  check('businessProfile.address.street').notEmpty().trim().escape(),
  check('businessProfile.address.city').notEmpty().trim().escape(),
  check('businessProfile.address.country').isIn(['dz']),
  check('businessProfile.address.zipCode').isNumeric(),
  check('businessProfile.businessLegal.tradeRegisterFile')
    .notEmpty()
    .trim()
    .escape(),
  check('businessProfile.businessLegal.taxID').notEmpty().trim().escape(),
];
