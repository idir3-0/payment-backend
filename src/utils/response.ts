import { Response } from 'express';
import Logger from 'src/logger';

export const responseHandler = (
  res: Response,
  data: any,
  successStatus: number,
  err: Error,
  errorHandler: Function,
) => {
  if (err) {
    const { status, error } = errorHandler(err.message);
    Logger.warn(err);
    return res.status(status).json({
      status: false,
      error,
    });
  }
  return res.status(successStatus).json({
    status: true,
    result: data,
  });
};
