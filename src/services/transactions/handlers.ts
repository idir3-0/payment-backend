import { Request, Response } from 'express';
import {
  deposit,
  userUpdateTransaction,
  adminUpdateTransaction,
  withdraw,
  listUserTransactions,
  getTransaction,
} from './controllers';
import {
  CreateTransactionRequest,
  UserUpdateTransactionRequest,
  AdminUpdateTransactionRequest,
  ListTransactionRequest,
  TransactionType,
  TransactionStatusMap,
  CreateTransactionParams,
  UserUpdateTransactionParams,
  ListTransactionParams,
  AdminUpdateTransactionParams,
  GetTransactionRequest,
  GetTransactionParams,
} from 'payment-types';
import { errorHandler } from './errors';
import { Timestamp } from 'firebase/firestore';
import { responseHandler } from 'src/utils/response';

export const depositHandler = async (req: Request, res: Response) => {
  const createTransactionRequest: CreateTransactionRequest = {
    amount: req.body.amount,
    bank: req.body.bank,
    note: req.body.note,
    fileURLs: req.body.fileURLs,
  };

  const createTransactionParams: CreateTransactionParams = {
    ...createTransactionRequest,
    _transactionType: 'deposit',
    _createdBy: req.user.user_id,
    _status: TransactionStatusMap.requested,
    _createdAt: Timestamp.now().seconds,
  };

  const { data, error } = await deposit(createTransactionParams);
  return responseHandler(res, data, 201, error, errorHandler);
};

export const withdrawHandler = async (req: Request, res: Response) => {
  const createTransactionRequest: CreateTransactionRequest = {
    amount: req.body.amount,
    bank: req.body.bank,
    note: req.body.note,
    fileURLs: req.body.fileURLs,
  };

  const createTransactionParams: CreateTransactionParams = {
    ...createTransactionRequest,
    _transactionType: 'withdraw',
    _createdBy: req.user.user_id,
    _status: TransactionStatusMap.requested,
    _createdAt: Timestamp.now().seconds,
  };
  const { data, error } = await withdraw(createTransactionParams);
  return responseHandler(res, data, 201, error, errorHandler);
};

export const userUpdateTransactionHandler = async (
  req: Request,
  res: Response,
) => {
  const userUpdateTransactionRequest: UserUpdateTransactionRequest = {
    transactionId: req.params.transactionId,
    note: req.body.note,
    fileURLs: req.body.fileURLs,
    amount: req.body.amount,
    bank: req.body.bank,
  };

  const userUpdateTransactionParams: UserUpdateTransactionParams = {
    ...userUpdateTransactionRequest,
    _createdBy: req.user.user_id,
    _status: TransactionStatusMap.processing,
    _createdAt: Timestamp.now().seconds,
  };

  const { data, error } = await userUpdateTransaction(
    userUpdateTransactionParams,
  );
  return responseHandler(res, data, 204, error, errorHandler);
};

export const adminUpdateTransactionHandler = async (
  req: Request,
  res: Response,
) => {
  const adminUpdateTransactionRequest: AdminUpdateTransactionRequest = {
    transactionId: req.params.transactionId,
    status: req.body.status,
    fileURLs: req.body.fileURLs,
    note: req.body.note,
    _status: req.body.status,
    _createdBy: req.user.user_id,
    _createdAt: Timestamp.now().seconds,
  };

  const { error } = await adminUpdateTransaction(
    adminUpdateTransactionRequest as AdminUpdateTransactionParams,
  );
  return responseHandler(res, {}, 204, error, errorHandler);
};

export const listUserTransactionsHandler = async (
  req: Request,
  res: Response,
) => {
  const listTransactionRequest: ListTransactionRequest = {
    transactionType: req.query.transactionType as TransactionType,
    limit: 10,
  };

  const listTransactionParams: ListTransactionParams = {
    ...listTransactionRequest,
    _userId: req.user.user_id,
  };

  const { data, error } = await listUserTransactions(listTransactionParams);
  return responseHandler(res, data, 200, error, errorHandler);
};

export const getTransactionHandler = async (req: Request, res: Response) => {
  const getTransactionRequest: GetTransactionRequest = {
    transactionId: req.params.transactionId,
  };

  const getTransactionParams: GetTransactionParams = {
    ...getTransactionRequest,
    _userId: req.user.user_id,
  };

  const { data, error } = await getTransaction(getTransactionParams);
  return responseHandler(res, data, 200, error, errorHandler);
};
