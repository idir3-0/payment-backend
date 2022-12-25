import express, { Router } from 'express';
import {
  depositHandler,
  updateTransactionHandler,
  adminUpdateTransactionHandler,
  withdrawHandler,
  listUserTransactionsHandler,
} from './handlers';
import { authorizationMiddelware } from 'src/middleware/auth';

const userRouter = express.Router();
const adminRouter = express.Router();
userRouter.use(authorizationMiddelware);
adminRouter.use(authorizationMiddelware);

userRouter.get('/', listUserTransactionsHandler);
userRouter.post('/deposit', depositHandler);
userRouter.post('/withdraw', withdrawHandler);
userRouter.put('/update', updateTransactionHandler);

adminRouter.put('/validate', adminUpdateTransactionHandler);

export { userRouter, adminRouter };
