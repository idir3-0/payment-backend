import express from 'express';
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
import { authorizationMiddelware } from 'src/middleware/auth';
import { setupAccountMiddelware } from 'src/middleware/setupAccount';
import {
  setupBusinessAccountValidation,
  setupUserAccountValidation,
} from './validators';
import { validatorMiddelware } from 'src/middleware/validator';
import { isAdminMiddelware } from 'src/middleware/isAdmin';

const testAccountRouter = express.Router();
const accountRouter = express.Router();
accountRouter.use(authorizationMiddelware);
// accountRouter.use(setupAccountMiddelware);

testAccountRouter.post('/test-register', testRegisterHandler);
testAccountRouter.post('/test-login', testLoginHandler);

accountRouter.post(
  '/setup-user-account',
  setupAccountMiddelware,
  ...setupUserAccountValidation(),
  validatorMiddelware,
  setupUserAccountHandler,
);
accountRouter.post(
  '/setup-business-account',
  setupAccountMiddelware,
  ...setupBusinessAccountValidation(),
  validatorMiddelware,
  setupBusinessAccountHandler,
);

accountRouter.post(
  '/validate-account',
  isAdminMiddelware,
  adminValidateAccountHandler,
);

accountRouter.get('/business', getBusinessHandler);
accountRouter.put('/business', updateBusinessHandler);

accountRouter.get('/profile', getUserProfileHandler);
accountRouter.put('/profile', updateProfileHandler);

export { accountRouter, testAccountRouter };
