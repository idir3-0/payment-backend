import { Request, Response } from 'express';
import admin from 'firebase-admin';

export const authorizationMiddelware = async (
  req: Request,
  res: Response,
  next,
) => {
  try {
    const authorization = req.get('Authorization');
    if (!authorization) {
      throw 'Authorization hearder does not exist';
    }
    const accssToken = authorization.split(' ')[1];
    const user = await admin.auth().verifyIdToken(accssToken);
    req.user = user;
    return next();
  } catch (error) {
    res.status(401).json({ status: false, error });
  }
};
