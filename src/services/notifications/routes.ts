import express from 'express';
import { listNotificationsHandler, readNotificationsHandler } from './handlers';
import { authorizationMiddelware } from 'src/middleware/auth';
// import {
//   transactionValidation,
//   listValidation,
//   updateValidation,
//   adminUpdateValidation,
// } from './validatons';

const notificationRouter = express.Router();
notificationRouter.use(authorizationMiddelware);

notificationRouter.get('/', listNotificationsHandler);
notificationRouter.put('/', readNotificationsHandler);

export { notificationRouter };
