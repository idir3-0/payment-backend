import { Request, Response } from 'express';

export const isAccountActiveMiddelware = async (
  req: Request,
  res: Response,
  next,
) => {
  try {
    if (!req.user.acv) {
      throw 'The account in not active';
    }
    return next();
  } catch (error) {
    return res.status(401).json({ status: false, error });
  }
};
