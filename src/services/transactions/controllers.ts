import { randomUUID } from 'crypto';
import {
  arrayUnion,
  Transaction,
  runTransaction,
  doc,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { firebaseDatabase } from 'src/adapters/firebase/firebase';
import {
  TransactionRequest,
  UserUpdateTransactionRequest,
  AdminUpdateTransactionRequest,
  TransactionInfo,
  TransactionLogInfo,
  DEPOSIT,
  WITHDRAW,
  TransactionStatusType,
  TransactionStatus,
  TransactionStatusMap,
  ListTransactionRequest,
} from 'src/types/transactions';

const TRANSACTIONS_COLLECTION_NAME = 'transactions';
const TRANSACTIONS_LOG_COLLECTION_NAME = 'transactions-logs';

export const deposit = async (req: TransactionRequest, userId: string) => {
  return baseTransaction(req, DEPOSIT, userId);
};

export const withdraw = async (req: TransactionRequest, userId: string) => {
  return baseTransaction(req, WITHDRAW, userId);
};

export const adminUpdateTransaction = async (
  req: AdminUpdateTransactionRequest,
  userId: string,
) => {
  try {
    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const d1 = doc(
        firebaseDatabase,
        req.transactionOwner,
        TRANSACTIONS_COLLECTION_NAME,
        req.transactionIdInfo.type,
        req.transactionIdInfo.date,
      );

      const transactionsSnapshot = await tx.get(d1);
      if (!transactionsSnapshot.exists()) {
        throw 'Transaction does not exist';
      }

      const transactions = transactionsSnapshot.data();
      const transaction = transactions[
        req.transactionIdInfo.id
      ] as TransactionInfo;

      if (
        !TransactionStatusMap[
          transaction.logs[transaction.logs.length - 1].status
        ].includes(req.status) &&
        req.status !== TransactionStatus.processing
      ) {
        throw 'Invalid transaction status';
      }

      const log = {
        fileUrls: req.fileUrls,
        note: req.note,
        createdAt: Timestamp.now().seconds,
        userId,
        status: req.status ? req.status : transaction.status,
      };

      await tx.set(
        d1,
        {
          [req.transactionIdInfo.id]: {
            logs: arrayUnion(log),
          },
        },
        { merge: true },
      );

      // if (req.status) {
      //   console.log(req.status);
      //   const d2 = doc(
      //     firebaseDatabase,
      //     TRANSACTIONS_LOG_COLLECTION_NAME,
      //     req.transactionIdInfo.date,
      //   );

      //   await tx.update(d2, {
      //     [`${req.transactionOwner}_${req.transactionIdInfo.type}_${req.transactionIdInfo.date}_${req.transactionIdInfo.id}.status`]:
      //       req.status,
      //   });
      // }
    });
  } catch (error) {
    return { error };
  }
  return {};
};

export const userUpdateTransaction = async (
  req: UserUpdateTransactionRequest,
  userId: string,
) => {
  try {
    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const d1 = doc(
        firebaseDatabase,
        userId,
        TRANSACTIONS_COLLECTION_NAME,
        req.transactionIdInfo.type,
        req.transactionIdInfo.date,
      );

      const transactionsSnapshot = await tx.get(d1);
      if (!transactionsSnapshot.exists()) {
        throw 'Transaction does not exist';
      }

      const transactions = transactionsSnapshot.data();
      const transaction = transactions[
        req.transactionIdInfo.id
      ] as TransactionInfo;

      if (
        transaction.logs[transaction.logs.length - 1].status !==
        TransactionStatus.processing
      ) {
        throw 'Transaction can not be updated';
      }

      const log = {
        fileUrls: req.fileUrls,
        note: req.note,
        createdAt: Timestamp.now().seconds,
        userId,
        status: TransactionStatus.processing,
      };
      await tx.set(
        d1,
        {
          [req.transactionIdInfo.id]: {
            logs: arrayUnion(log),
          },
        },
        { merge: true },
      );
    });
  } catch (error) {
    return { error };
  }
  return {};
};

export const adminFundBalanceAccount = async () => {};

const baseTransaction = async (
  req: TransactionRequest,
  transactionType: string,
  userId: string,
) => {
  const date = new Date();
  let collectionId: string = `${date.getFullYear()}-${date.getMonth() + 1}`;
  let id = randomUUID();
  let status: TransactionStatusType =
    TransactionStatus.processing as TransactionStatusType;

  try {
    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const d1 = doc(
        firebaseDatabase,
        userId,
        TRANSACTIONS_COLLECTION_NAME,
        transactionType,
        collectionId,
      );

      const transaction = {
        amount: req.amount,
        bank: req.bank,
        logs: [
          {
            fileUrls: req.fileURLs,
            note: req.note,
            createdAt: Timestamp.now().seconds,
            userId,
            status: TransactionStatus.processing,
          },
        ],
      };
      await tx.set(d1, { [id]: transaction }, { merge: true });

      const d2 = doc(
        firebaseDatabase,
        TRANSACTIONS_LOG_COLLECTION_NAME,
        collectionId,
      );

      id = `${transactionType}_${collectionId}_${id}`;
      const logId = `${userId}_${id}`;

      const createdAt = Timestamp.now().seconds;

      const log: TransactionLogInfo = {
        userId,
        status,
        createdAt,
      };
      await tx.set(
        d2,
        {
          [logId]: log,
        },
        { merge: true },
      );
    });
  } catch (error) {
    return { error };
  }
  return { id };
};

export const listUserTransactions = async (req: ListTransactionRequest) => {
  const d1 = doc(
    firebaseDatabase,
    req.user,
    TRANSACTIONS_COLLECTION_NAME,
    req.type,
    req.date,
  );

  const transactionsSnapshot = await getDoc(d1);

  if (!transactionsSnapshot.exists()) {
    return {};
  }
  const transactions = transactionsSnapshot.data();

  return {
    transactions,
  };
};
