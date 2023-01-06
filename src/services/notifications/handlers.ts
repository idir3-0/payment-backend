import { Request, Response } from 'express';
import { listNotifications, readNotifications } from './controllers';
import { responseHandler } from 'src/utils/response';
import { ListNotificationRequest } from './models';

export const listNotificationsHandler = async (req: Request, res: Response) => {
  const listNotificationRequest: ListNotificationRequest = {
    userId: req.user.user_id,
    limit: 10,
  };
  const { data, error } = await listNotifications(listNotificationRequest);
  return responseHandler(res, data, 200, error, () => {});
};

export const readNotificationsHandler = async (req: Request, res: Response) => {
  const ids = req.body.ids as number[];
  const { data, error } = await readNotifications(req.user.user_id);
  return responseHandler(res, data, 200, error, () => {});
};
