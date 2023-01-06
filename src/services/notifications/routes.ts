import express, { Express } from 'express';
import { listNotificationsHandler, readNotificationsHandler } from './handlers';
import { authorizationMiddelware } from 'src/middleware/auth';
import { isAccountActiveMiddelware } from 'src/middleware/isAccountActive';

export const initNotificationRoutes = (app: Express) => {
  const baseRouter = express.Router();
  baseRouter.use(authorizationMiddelware);
  baseRouter.use(isAccountActiveMiddelware);

  baseRouter.get('/', listNotificationsHandler);
  baseRouter.put('/', readNotificationsHandler);

  // Setup App
  app.use('/notifications', baseRouter);
};
