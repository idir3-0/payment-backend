import { Request, Response } from 'express';
import {
  deposit,
  userUpdateTransaction,
  adminUpdateTransaction,
  withdraw,
  listUserTransactions,
} from './controllers';
import {
  TransactionRequest,
  UserUpdateTransactionRequest,
  AdminUpdateTransactionRequest,
  ListTransactionRequest,
  TransactionType,
} from './models';
import { errorHandler } from './errors';

export const depositHandler = async (req: Request, res: Response) => {
  const depositRequest: TransactionRequest = {
    amount: req.body.amount,
    bank: req.body.bank,
    fileURLs: req.body.fileURLs,
    note: req.body.note,
  };

  const { data, error } = await deposit(depositRequest, req.user.user_id);
  return responseHandler(res, data, 201, error);
};

export const withdrawHandler = async (req: Request, res: Response) => {
  const withdrawRequest: TransactionRequest = {
    amount: req.body.amount,
    bank: req.body.bank,
    fileURLs: req.body.fileURLs,
    note: req.body.note,
  };
  const { data, error } = await withdraw(withdrawRequest, req.user.user_id);
  return responseHandler(res, data, 201, error);
};

export const updateTransactionHandler = async (req: Request, res: Response) => {
  const userUpdateTransactionRequest: UserUpdateTransactionRequest = {
    transactionIdInfo: {
      id: req.params.id,
      type: req.params.type as TransactionType,
    },
    fileUrls: req.body.fileUrls,
    note: req.body.note,
  };

  const { data, error } = await userUpdateTransaction(
    userUpdateTransactionRequest,
    req.user.user_id,
  );
  return responseHandler(res, data, 204, error);
};

export const adminUpdateTransactionHandler = async (
  req: Request,
  res: Response,
) => {
  const verifyRequest: AdminUpdateTransactionRequest = {
    transactionIdInfo: {
      id: req.params.id,
      type: req.params.type as TransactionType,
    },
    uid: req.body.uid,
    status: req.body.status,
    fileUrls: req.body.fileUrls,
    note: req.body.note,
  };

  const { error } = await adminUpdateTransaction(
    verifyRequest,
    req.user.user_id,
  );
  return responseHandler(res, {}, 204, error);
};

export const listUserTransactionsHandler = async (
  req: Request,
  res: Response,
) => {
  const listTransactionRequest: ListTransactionRequest = {
    startAfter: String(req.query.startAfter),
    transactionType: req.query.type as TransactionType,
  };

  const { data, error } = await listUserTransactions(
    listTransactionRequest,
    req.user.user_id,
  );
  return responseHandler(res, data, 200, error);
};

const responseHandler = (
  res: Response,
  data: any,
  successStatus: number,
  err: string,
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
