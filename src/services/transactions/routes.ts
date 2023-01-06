import express, { Express } from 'express';
import {
  depositHandler,
  userUpdateTransactionHandler,
  adminUpdateTransactionHandler,
  withdrawHandler,
  listUserTransactionsHandler,
} from './handlers';
import {
  transactionValidation,
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
  const baseRouter = express.Router();
  const adminRouter = express.Router();
  const notAdminRouter = express.Router();

  baseRouter.use(authorizationMiddelware);
  baseRouter.use(isAccountActiveMiddelware);

  adminRouter.use(baseRouter);
  notAdminRouter.use(baseRouter);

  adminRouter.use(isAdminMiddelware);
  notAdminRouter.use(isNotAdminMiddelware);

  // Admin
  adminRouter.put(
    '/validate/:transactionId',
    ...adminUpdateValidation(),
    validatorMiddelware,
    adminUpdateTransactionHandler,
  );

  // User & Admin
  notAdminRouter.post(
    '/deposit',
    ...transactionValidation(),
    validatorMiddelware,
    depositHandler,
  );

  notAdminRouter.post(
    '/withdraw',
    ...transactionValidation(),
    validatorMiddelware,
    withdrawHandler,
  );

  notAdminRouter.get(
    '/',
    ...listValidation(),
    validatorMiddelware,
    listUserTransactionsHandler,
  );

  notAdminRouter.put(
    '/:transactionId',
    ...updateValidation(),
    validatorMiddelware,
    userUpdateTransactionHandler,
  );

  // Setup App
  app.use('/transactions/admin', adminRouter);
  app.use('/transactions', notAdminRouter);
};
