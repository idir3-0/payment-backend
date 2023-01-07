import { Request, Response } from 'express';
import { listNotifications, readNotifications } from './controllers';
import { responseHandler } from 'src/utils/response';
import { ListNotificationParams } from 'payment-types';

export const listNotificationsHandler = async (req: Request, res: Response) => {
  const listNotificationParams: ListNotificationParams = {
    limit: 10,
    _userId: req.user.user_id,
  };
  const { data, error } = await listNotifications(listNotificationParams);
  return responseHandler(res, data, 200, error, () => {});
};

export const readNotificationsHandler = async (req: Request, res: Response) => {
  const ids = req.body.ids as number[];
  const { data, error } = await readNotifications(req.user.user_id);
  return responseHandler(res, data, 200, error, () => {});
};
