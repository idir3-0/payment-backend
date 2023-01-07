import express, { Express } from 'express';
import {
  testRegisterHandler,
  testLoginHandler,
  createUserAccountHandler,
  createBusinessAccountHandler,
  adminValidateAccountHandler,
  updateBusinessHandler,
  updateProfileHandler,
  getUserProfileHandler,
  getBusinessHandler,
} from './handlers';
import {
  createBusinessAccountValidation,
  createUserAccountValidation,
} from './validators';
import { isBusinessMiddelware } from 'src/middleware/isBusiness';
import { isUserMiddelware } from 'src/middleware/isUser';

import { authorizationMiddelware } from 'src/middleware/auth';
import { validatorMiddelware } from 'src/middleware/validator';
import { isAdminMiddelware } from 'src/middleware/isAdmin';

export const initAccountRoutes = (app: Express) => {
  const router = express.Router();
  const testRouter = express.Router();
  router.use(authorizationMiddelware);

  testRouter.post('/test-register', testRegisterHandler);
  testRouter.post('/test-login', testLoginHandler);

  router.post(
    '/admin/validate-account',
    isAdminMiddelware,
    adminValidateAccountHandler,
  );

  router.post(
    '/create-business-account',
    ...createBusinessAccountValidation(),
    validatorMiddelware,
    createBusinessAccountHandler,
  );

  router.post(
    '/create-user-account',
    ...createUserAccountValidation(),
    validatorMiddelware,
    createUserAccountHandler,
  );

  router.get('/business', isBusinessMiddelware, getBusinessHandler);
  router.put('/business', isBusinessMiddelware, updateBusinessHandler);

  router.get('/profile', isUserMiddelware, getUserProfileHandler);
  router.put('/profile', isUserMiddelware, updateProfileHandler);

  app.use('/accounts/test', testRouter);
  app.use('/accounts', router);
};
