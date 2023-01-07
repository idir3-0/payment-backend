import express, { Express } from 'express';
import {
  depositHandler,
  userUpdateTransactionHandler,
  adminUpdateTransactionHandler,
  withdrawHandler,
  listUserTransactionsHandler,
  getTransactionHandler,
} from './handlers';
import {
  createTransactionValidation,
  listValidation,
  updateValidation,
  adminUpdateValidation,
} from './validatons';
import { authorizationMiddelware } from 'src/middleware/auth';
import { isAccountActiveMiddelware } from 'src/middleware/isAccountActive';
import { validatorMiddelware } from 'src/middleware/validator';
import { isAdminMiddelware } from 'src/middleware/isAdmin';
import { isNotAdminMiddelware } from 'src/middleware/isNotAdmin';

export const initTransactionRoutes = (app: Express) => {
  const router = express.Router();

  router.use(authorizationMiddelware);
  router.use(isAccountActiveMiddelware);

  router.put(
    '/admin/validate/:transactionId',
    isAdminMiddelware,
    ...adminUpdateValidation(),
    validatorMiddelware,
    adminUpdateTransactionHandler,
  );

  router.post(
    '/deposit',
    isNotAdminMiddelware,
    ...createTransactionValidation(),
    validatorMiddelware,
    depositHandler,
  );

  router.post(
    '/withdraw',
    isNotAdminMiddelware,
    ...createTransactionValidation(),
    validatorMiddelware,
    withdrawHandler,
  );

  router.get(
    '/',
    ...listValidation(),
    validatorMiddelware,
    listUserTransactionsHandler,
  );

  router.get(
    '/:transactionId',
    ...listValidation(),
    validatorMiddelware,
    getTransactionHandler,
  );

  router.put(
    '/:transactionId',
    ...updateValidation(),
    validatorMiddelware,
    userUpdateTransactionHandler,
  );

  // Setup App
  app.use('/transactions', router);
};
