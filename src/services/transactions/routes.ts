import express, { Router } from 'express';
import {
  depositHandler,
  updateTransactionHandler,
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

const userRouter = express.Router();
userRouter.use(authorizationMiddelware);
userRouter.use(isAccountActiveMiddelware);

userRouter.post('/deposit', ...transactionValidation(), depositHandler);
userRouter.post('/withdraw', ...transactionValidation(), withdrawHandler);
userRouter.get('/', ...listValidation(), listUserTransactionsHandler);
userRouter.put('/:type/:id', ...updateValidation(), updateTransactionHandler);
userRouter.put(
  '/validate/:type/:id',
  ...adminUpdateValidation(),
  adminUpdateTransactionHandler,
);

export { userRouter };
