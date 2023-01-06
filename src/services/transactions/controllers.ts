import { randomUUID } from 'crypto';
import {
  arrayUnion,
  Transaction,
  runTransaction,
  doc,
  addDoc,
  query,
  limit,
  collection,
  getDocs,
  orderBy,
  where,
} from 'firebase/firestore';
import { firebaseDatabase } from 'src/adapters/firebase/firebase';
import {
  TransactionRequest,
  UpdateTransactionRequest,
  AdminUpdateTransactionRequest,
  TransactionLog,
  TransactionType,
  TransactionStateMap,
  TransactionStatusMap,
  ListTransactionRequest,
  DWTransaction,
  TransactionTypeMap,
} from './models';
import { getCurrentDate } from 'src/utils/date';
import {
  ERROR_TRANSACTION_ALREADY_IN_REVIEW,
  ERROR_TRANSACTION_CAN_NOT_UPDATE,
  ERROR_TRANSACTION_INVALID_STATUS,
  ERROR_TRANSACTION_NOT_EXIST,
  ERROR_TRANSACTION_PROCESSED,
} from './errors';
import { newNotificationsTx } from '../notifications/controllers';

const TRANSACTIONS_COLLECTION_NAME = 'transactions';
const TRANSACTIONS_LOG_COLLECTION_NAME = 'transactions-logs';

export const deposit = async (transactionRequest: TransactionRequest) => {
  return await baseTransaction(TransactionTypeMap.deposit, transactionRequest);
};

export const withdraw = async (transactionRequest: TransactionRequest) => {
  return baseTransaction(TransactionTypeMap.withdraw, transactionRequest);
};

const baseTransaction = async (
  transactionType: TransactionType,
  transactionRequest: TransactionRequest,
) => {
  try {
    const { amount, bank, createdBy, status, fileURLs, note, createdAt } =
      transactionRequest;

    const d = collection(firebaseDatabase, TRANSACTIONS_COLLECTION_NAME);

    // Check if the user can create a deposit request.
    const q = query(
      d,
      where('status', '==', TransactionStatusMap.processing),
      where('transactionType', '==', transactionType),
      where('createdBy', '==', createdBy),
    );
    const transactionSnap = await getDocs(q);
    // TODO: improve
    const numActiveDocs = transactionSnap.size;
    if (numActiveDocs >= 1) {
      throw ERROR_TRANSACTION_ALREADY_IN_REVIEW;
    }

    if (transactionType === TransactionTypeMap.withdraw) {
      // TODO: check user balance when withdraw
    }

    const transaction: DWTransaction = {
      amount,
      bank,
      createdAt,
      status: TransactionStatusMap.processing,
      createdBy,
      transactionType,
      logs: [
        {
          fileURLs,
          note,
          createdAt,
          createdBy,
          status,
        },
        {
          fileURLs: [],
          note: 'طلبك قيد المراجعة',
          createdAt,
          createdBy: 'system',
          status: TransactionStatusMap.processing,
        },
      ],
    };

    const res = await addDoc(d, transaction);
    return { data: { id: res.id } };
  } catch (error) {
    return { error };
  }
};

export const userUpdateTransaction = async (
  updateTransactionRequest: UpdateTransactionRequest,
) => {
  try {
    const { transactionId, fileURLs, note, createdBy, status, createdAt } =
      updateTransactionRequest;

    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const d1 = doc(
        firebaseDatabase,
        TRANSACTIONS_COLLECTION_NAME,
        transactionId,
      );

      const transactionsSnapshot = await tx.get(d1);
      const transaction = transactionsSnapshot.data() as DWTransaction;
      if (!transaction) {
        throw ERROR_TRANSACTION_NOT_EXIST;
      }

      if (transaction.createdBy !== createdBy) {
        throw ERROR_TRANSACTION_NOT_EXIST;
      }

      if (
        transaction.status === TransactionStatusMap.funded ||
        transaction.status === TransactionStatusMap.accepted
      ) {
        throw ERROR_TRANSACTION_PROCESSED;
      }

      const log: TransactionLog = {
        note,
        fileURLs,
        status,
        createdBy,
        createdAt,
      };

      tx.set(
        d1,
        {
          logs: arrayUnion(log),
        },
        { merge: true },
      );
    });
    return { data: {} };
  } catch (error) {
    return { error };
  }
};

export const adminFundBalanceAccount = async () => {};

export const listUserTransactions = async (
  listTransactionRequest: ListTransactionRequest,
) => {
  try {
    const { owner, transactionType, limit: lim } = listTransactionRequest;
    const col = collection(firebaseDatabase, TRANSACTIONS_COLLECTION_NAME);

    // TODO: add paggination
    const q = query(
      col,
      orderBy('createdAt', 'desc'),
      where('createdBy', '==', owner),
      limit(lim),
    );
    const transactionsSnap = await getDocs(q);
    const transactions = [];
    transactionsSnap.forEach((inv) => {
      const invoice = {
        id: inv.id,
        ...inv.data(),
      };
      transactions.push(invoice);
    });
    return { data: { transactions, limit: lim } };
  } catch (error) {
    return { error };
  }
};

export const adminUpdateTransaction = async (
  adminUpdateTransactionRequest: AdminUpdateTransactionRequest,
) => {
  try {
    const { transactionId, status, fileURLs, note, createdBy, createdAt } =
      adminUpdateTransactionRequest;

    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const d1 = doc(
        firebaseDatabase,
        TRANSACTIONS_COLLECTION_NAME,
        transactionId,
      );

      const transactionSnapshot = await tx.get(d1);
      const transaction = transactionSnapshot.data() as DWTransaction;

      if (!transaction) {
        throw ERROR_TRANSACTION_NOT_EXIST;
      }

      if (
        transaction.status === TransactionStatusMap.accepted ||
        transaction.status === TransactionStatusMap.funded
      ) {
        throw ERROR_TRANSACTION_CAN_NOT_UPDATE;
      }

      if (
        !(TransactionStateMap[transaction.status] as string[]).includes(status)
      ) {
        throw ERROR_TRANSACTION_INVALID_STATUS;
      }

      const log: TransactionLog = {
        fileURLs,
        note,
        createdBy,
        status,
        createdAt,
      };

      await tx.set(
        d1,
        {
          status: adminUpdateTransactionRequest.status,
          logs: arrayUnion(log),
        },
        { merge: true },
      );

      newNotificationsTx(tx, {
        collection: TRANSACTIONS_COLLECTION_NAME,
        userIdinBox: transaction.createdBy,
        path: [],
        action: status,
        refId: transactionId,
      });
    });
    return {};
  } catch (error) {
    return { error };
  }
};
