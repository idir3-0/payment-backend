import { Request, Response } from 'express';
import { listNotifications, readNotifications } from './controllers';
import { responseHandler } from 'src/utils/response';

export const listNotificationsHandler = async (req: Request, res: Response) => {
  const { data, error } = await listNotifications(req.user.user_id);
  return responseHandler(res, data, 200, error, () => {});
};

export const readNotificationsHandler = async (req: Request, res: Response) => {
  const ids = req.body.ids as number[];
  const { data, error } = await readNotifications(ids, req.user.user_id);
  return responseHandler(res, data, 204, error, () => {});
};
