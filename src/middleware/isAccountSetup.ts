import { Request, Response } from 'express';

export const isAccountSetupMiddelware = async (
  req: Request,
  res: Response,
  next,
) => {
  try {
    if (req.user.role && req.user.acv) {
      throw 'The account was already setup';
    }
    return next();
  } catch (error) {
    return res.status(401).json({ status: false, error });
  }
};
