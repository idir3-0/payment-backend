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
} from 'src/types/transactions';
import { parseTransactionId } from './utils';

export const depositHandler = async (req: Request, res: Response) => {
  try {
    const depositRequest: TransactionRequest = {
      amount: req.body.amount,
      bank: req.body.bank,
      fileURLs: req.body.fileURLs,
      note: req.body.note,
    };

    const data = await deposit(depositRequest, req.user.user_id);
    res.status(200).json({
      status: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: true,
      message: 'Internal error',
    });
  }
};

export const withdrawHandler = async (req: Request, res: Response) => {
  try {
    const withdrawRequest: TransactionRequest = {
      amount: req.body.amount,
      bank: req.body.bank,
      fileURLs: req.body.fileURLs,
      note: req.body.note,
    };
    const data = await withdraw(withdrawRequest, req.user.user_id);

    res.status(200).json({
      status: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: true,
      message: 'Internal error',
    });
  }
};

export const updateTransactionHandler = async (req: Request, res: Response) => {
  try {
    const verifyRequest: UserUpdateTransactionRequest = {
      transactionIdInfo: parseTransactionId(req.body.transactionId),
      fileUrls: req.body.fileUrls,
      note: req.body.note,
    };

    const { error } = await userUpdateTransaction(
      verifyRequest,
      req.user.user_id,
    );
    if (error) {
      return res.status(400).json({
        status: false,
        error,
      });
    }

    return res.status(200).json({
      status: true,
    });
  } catch (error) {
    return res.status(500).json({
      status: true,
      message: 'Internal error',
    });
  }
};

export const adminUpdateTransactionHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const verifyRequest: AdminUpdateTransactionRequest = {
      transactionIdInfo: parseTransactionId(req.body.transactionId),
      transactionOwner: req.body.transactionOwner,
      status: req.body.status,
      fileUrls: req.body.fileUrls,
      note: req.body.note,
    };

    const { error } = await adminUpdateTransaction(
      verifyRequest,
      req.user.user_id,
    );
    if (error) {
      return res.status(400).json({
        status: false,
        error,
      });
    }

    return res.status(200).json({
      status: true,
    });
  } catch (error) {
    return res.status(500).json({
      status: true,
      message: 'Internal error',
    });
  }
};

export const listUserTransactionsHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const listTransactionRequest: ListTransactionRequest = {
      date: String(req.query.date),
      type: String(req.query.type),
      user: req.user.user_id,
    };

    const data = await listUserTransactions(listTransactionRequest);
    return res.status(200).json({
      status: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: true,
      message: 'Internal error',
    });
  }
};
