import express, { Router } from 'express';
import {
  depositHandler,
  userUpdateTransactionHandler,
  adminUpdateTransactionHandler,
  withdrawHandler,
  listUserTransactionsHandler,
} from './handlers';
import { authorizationMiddelware } from 'src/middleware/auth';
import {
  transactionValidation,
  listValidation,
  updateValidation,
  adminUpdateValidation,
} from './validatons';
import { isAccountActiveMiddelware } from 'src/middleware/isAccountActive';
import { validatorMiddelware } from 'src/middleware/validator';
import { isAdminMiddelware } from 'src/middleware/isAdmin';

const userRouter = express.Router();
userRouter.use(authorizationMiddelware);
userRouter.use(isAccountActiveMiddelware);

userRouter.post(
  '/deposit',
  ...transactionValidation(),
  validatorMiddelware,
  depositHandler,
);
userRouter.post(
  '/withdraw',
  ...transactionValidation(),
  validatorMiddelware,
  withdrawHandler,
);
userRouter.get(
  '/',
  ...listValidation(),
  validatorMiddelware,
  listUserTransactionsHandler,
);
userRouter.put(
  '/',
  ...updateValidation(),
  validatorMiddelware,
  userUpdateTransactionHandler,
);
userRouter.put(
  '/validate',
  isAdminMiddelware,
  ...adminUpdateValidation(),
  validatorMiddelware,
  adminUpdateTransactionHandler,
);

export { userRouter };
