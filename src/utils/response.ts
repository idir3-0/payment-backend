import { Response } from 'express';

export const responseHandler = (
  res: Response,
  data: any,
  successStatus: number,
  err: string,
  errorHandler: Function,
) => {
  if (err) {
    const { status, error } = errorHandler(err);
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
