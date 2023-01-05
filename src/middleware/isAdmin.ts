import { Request, Response } from 'express';
import { Roles } from 'src/services/accounts/models';

export const isAdminMiddelware = async (req: Request, res: Response, next) => {
  try {
    if (!(req.user.role === Roles.admin)) {
      throw 'Unauthorized';
    }
    return next();
  } catch (error) {
    return res.status(401).json({ status: false, error });
  }
};
