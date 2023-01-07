import { Request, Response } from 'express';
import { Roles } from 'payment-types';

export const isAdminMiddelware = async (req: Request, res: Response, next) => {
  try {
    if (!(req.user.role === Roles.admin)) {
      throw 'Unauthorized: not admin';
    }
    return next();
  } catch (error) {
    return res.status(401).json({ status: false, error });
  }
};
