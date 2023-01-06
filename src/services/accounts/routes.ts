import express, { Express } from 'express';
import {
  testRegisterHandler,
  testLoginHandler,
  setupUserAccountHandler,
  setupBusinessAccountHandler,
  adminValidateAccountHandler,
  updateBusinessHandler,
  updateProfileHandler,
  getUserProfileHandler,
  getBusinessHandler,
} from './handlers';
import {
  setupBusinessAccountValidation,
  setupUserAccountValidation,
} from './validators';
import { isBusinessMiddelware } from 'src/middleware/isBusiness';
import { isUserMiddelware } from 'src/middleware/isUser';

import { authorizationMiddelware } from 'src/middleware/auth';
import { validatorMiddelware } from 'src/middleware/validator';
import { isAdminMiddelware } from 'src/middleware/isAdmin';

export const initAccountRoutes = (app: Express) => {
  const baseRouter = express.Router();
  const testRouter = express.Router();
  const adminRouter = express.Router();
  const setupAccountRouter = express.Router();
  const userRouter = express.Router();
  const businessRouter = express.Router();

  baseRouter.use(authorizationMiddelware);

  adminRouter.use(baseRouter);
  setupAccountRouter.use(baseRouter);
  userRouter.use(baseRouter);

  adminRouter.use(isAdminMiddelware);
  businessRouter.use(isBusinessMiddelware);
  userRouter.use(isUserMiddelware);

  // Tests
  testRouter.post('/test-register', testRegisterHandler);
  testRouter.post('/test-login', testLoginHandler);

  // Admin
  adminRouter.post('/validate-account', adminValidateAccountHandler);

  // User && Business
  setupAccountRouter.post(
    '/setup-business-account',
    ...setupBusinessAccountValidation(),
    validatorMiddelware,
    setupBusinessAccountHandler,
  );

  setupAccountRouter.post(
    '/setup-user-account',
    ...setupUserAccountValidation(),
    validatorMiddelware,
    setupUserAccountHandler,
  );

  // Business
  businessRouter.get('/business', getBusinessHandler);
  businessRouter.put('/business', updateBusinessHandler);

  // User
  userRouter.get('/profile', getUserProfileHandler);
  userRouter.put('/profile', updateProfileHandler);

  // Setup App
  app.use('/accounts/admin', adminRouter);
  app.use('/accounts/test', testRouter);

  app.use('/accounts', setupAccountRouter);
  app.use('/accounts', businessRouter);
  app.use('/accounts', userRouter);
};
