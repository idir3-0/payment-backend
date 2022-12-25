import { Request, Response } from 'express';
import admin from 'firebase-admin';

export const authorizationMiddelware = async (
  req: Request,
  res: Response,
  next,
) => {
  const accssToken = req.get('Authorization').split(' ')[1];
  try {
    const user = await admin.auth().verifyIdToken(accssToken);
    req.user = user;
    return next();
  } catch (e) {
    res.status(401).json({ status: false, message: 'unauthorized' });
  }
};
