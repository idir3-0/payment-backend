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
  UpdateTransactionRequest,
  AdminUpdateTransactionRequest,
  ListTransactionRequest,
  TransactionType,
  TransactionStatusMap,
} from './models';
import { errorHandler } from './errors';
import { Timestamp } from 'firebase/firestore';

export const depositHandler = async (req: Request, res: Response) => {
  const depositRequest: TransactionRequest = {
    amount: req.body.amount,
    bank: req.body.bank,
    createdBy: req.user.user_id,
    note: req.body.note,
    fileURLs: req.body.fileURLs,
    status: TransactionStatusMap.requested,
    createdAt: Timestamp.now().seconds,
  };

  const { data, error } = await deposit(depositRequest);
  return responseHandler(res, data, 201, error);
};

export const withdrawHandler = async (req: Request, res: Response) => {
  const withdrawRequest: TransactionRequest = {
    amount: req.body.amount,
    bank: req.body.bank,
    createdBy: req.user.user_id,
    note: req.body.note,
    fileURLs: req.body.fileURLs,
    status: TransactionStatusMap.requested,
    createdAt: Timestamp.now().seconds,
  };
  const { data, error } = await withdraw(withdrawRequest);
  return responseHandler(res, data, 201, error);
};

export const userUpdateTransactionHandler = async (
  req: Request,
  res: Response,
) => {
  const userUpdateTransactionRequest: UpdateTransactionRequest = {
    createdBy: req.user.user_id,
    transactionId: req.body.transactionId,
    transactionType: req.body.transactionType,
    note: req.body.note,
    fileURLs: req.body.fileURLs,
    status: TransactionStatusMap.processing,
    createdAt: Timestamp.now().seconds,
  };

  const { data, error } = await userUpdateTransaction(
    userUpdateTransactionRequest,
  );
  return responseHandler(res, data, 204, error);
};

export const adminUpdateTransactionHandler = async (
  req: Request,
  res: Response,
) => {
  const adminUpdateTransactionRequest: AdminUpdateTransactionRequest = {
    createdBy: req.user.user_id,
    transactionId: req.body.transactionId,
    transactionType: req.body.transactionType,
    transactionOwner: req.body.transactionOwner,
    status: req.body.status,
    fileURLs: req.body.fileURLs,
    note: req.body.note,
    createdAt: Timestamp.now().seconds,
  };

  const { error } = await adminUpdateTransaction(adminUpdateTransactionRequest);
  return responseHandler(res, {}, 204, error);
};

export const listUserTransactionsHandler = async (
  req: Request,
  res: Response,
) => {
  const listTransactionRequest: ListTransactionRequest = {
    owner: req.user.user_id,
    transactionType: req.query.transactionType as TransactionType,
  };

  const { data, error } = await listUserTransactions(listTransactionRequest);
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
