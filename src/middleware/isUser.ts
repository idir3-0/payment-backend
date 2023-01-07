import { Request, Response } from 'express';
import { Roles } from 'payment-types';

export const isUserMiddelware = async (req: Request, res: Response, next) => {
  try {
    if (!(req.user.role === Roles.user)) {
      throw 'Unauthorized: not user';
    }
    return next();
  } catch (error) {
    return res.status(401).json({ status: false, error });
  }
};
