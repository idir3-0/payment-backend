import { Request, Response } from 'express';
import { Roles } from 'src/services/accounts/models';

export const isNotAdminMiddelware = async (
  req: Request,
  res: Response,
  next,
) => {
  try {
    if (![Roles.business, Roles.user].includes(req.user.role)) {
      throw 'Unauthorized: invalid role';
    }
    return next();
  } catch (error) {
    return res.status(401).json({ status: false, error });
  }
};
