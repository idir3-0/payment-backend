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
  getDoc,
} from 'firebase/firestore';
import { firebaseDatabase } from 'src/adapters/firebase/firebase';
import {
  TransactionStateMap,
  TransactionStatusMap,
  DWTransaction,
  TransactionTypeMap,
  CreateTransactionParams,
  UserUpdateTransactionParams,
  ListTransactionParams,
  AdminUpdateTransactionParams,
  TransactionLogParams,
  GetTransactionParams,
} from 'payment-types';
import {
  ERROR_TRANSACTION_ALREADY_IN_REVIEW,
  ERROR_TRANSACTION_CAN_NOT_UPDATE,
  ERROR_TRANSACTION_INVALID_STATUS,
  ERROR_TRANSACTION_NOT_EXIST,
  ERROR_TRANSACTION_PROCESSED,
} from './errors';
import { newNotificationsTx } from '../notifications/controllers';

const TRANSACTIONS_COLLECTION_NAME = 'transactions';

export const deposit = async (
  createTransactionParams: CreateTransactionParams,
): Promise<{ data?: Object; error?: Error }> => {
  return await baseTransaction(createTransactionParams);
};

export const withdraw = async (
  createTransactionParams: CreateTransactionParams,
): Promise<{ data?: Object; error?: Error }> => {
  return baseTransaction(createTransactionParams);
};

const baseTransaction = async (
  createTransactionParams: CreateTransactionParams,
): Promise<{ data?: Object; error?: Error }> => {
  try {
    const {
      amount,
      bank,
      fileURLs,
      note,
      _createdBy,
      _status,
      _createdAt,
      _transactionType,
    } = createTransactionParams;

    const d = collection(firebaseDatabase, TRANSACTIONS_COLLECTION_NAME);

    // Check if the user can create a deposit request.
    const q = query(
      d,
      where('status', '==', TransactionStatusMap.processing),
      where('_transactionType', '==', _transactionType),
      where('_createdBy', '==', _createdBy),
    );
    const transactionSnap = await getDocs(q);
    // TODO: improve
    const numActiveDocs = transactionSnap.size;
    if (numActiveDocs >= 1) {
      throw ERROR_TRANSACTION_ALREADY_IN_REVIEW;
    }

    if (_transactionType === TransactionTypeMap.withdraw) {
      // TODO: check user balance when withdraw
    }

    const transaction: DWTransaction = {
      amount,
      bank,
      _createdAt,
      _status: TransactionStatusMap.processing,
      _createdBy,
      _transactionType,
      logs: [
        {
          fileURLs,
          note,
          _createdAt,
          _createdBy,
          _status,
        },
        {
          fileURLs: [],
          note: 'طلبك قيد المراجعة',
          _createdAt,
          _createdBy: 'system',
          _status: TransactionStatusMap.processing,
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
  userUpdateTransactionParams: UserUpdateTransactionParams,
): Promise<{ data?: Object; error?: Error }> => {
  try {
    const {
      transactionId,
      fileURLs,
      amount,
      bank,
      note,
      _createdBy,
      _status,
      _createdAt,
    } = userUpdateTransactionParams;

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

      if (transaction._createdBy !== _createdBy) {
        throw ERROR_TRANSACTION_NOT_EXIST;
      }

      if (
        transaction._status === TransactionStatusMap.funded ||
        transaction._status === TransactionStatusMap.accepted
      ) {
        throw ERROR_TRANSACTION_PROCESSED;
      }

      const log: TransactionLogParams = {
        note,
        fileURLs,
        _status,
        _createdBy,
        _createdAt,
      };

      tx.set(
        d1,
        {
          amount,
          bank,
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
  listTransactionParams: ListTransactionParams,
): Promise<{ data?: Object; error?: Error }> => {
  try {
    const { _userId, transactionType, limit: lim } = listTransactionParams;
    const col = collection(firebaseDatabase, TRANSACTIONS_COLLECTION_NAME);

    // TODO: add paggination
    const q = query(
      col,
      orderBy('_createdAt', 'desc'),
      where('_createdBy', '==', _userId),
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

export const getTransaction = async (
  getTransactionParams: GetTransactionParams,
): Promise<{ data?: Object; error?: Error }> => {
  try {
    const { _userId, transactionId } = getTransactionParams;

    const d1 = doc(
      firebaseDatabase,
      TRANSACTIONS_COLLECTION_NAME,
      transactionId,
    );

    const transactionSnapshot = await getDoc(d1);
    const transaction = transactionSnapshot.data() as DWTransaction;
    if (!transaction) {
      throw ERROR_TRANSACTION_NOT_EXIST;
    }

    if (transaction._createdBy !== _userId) {
      throw ERROR_TRANSACTION_NOT_EXIST;
    }

    return { data: { transaction } };
  } catch (error) {
    return { error };
  }
};

export const adminUpdateTransaction = async (
  adminUpdateTransactionParams: AdminUpdateTransactionParams,
): Promise<{ data?: Object; error?: Error }> => {
  try {
    const {
      transactionId,
      status,
      fileURLs,
      note,
      _createdBy,
      _createdAt,
      _status,
    } = adminUpdateTransactionParams;

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
        transaction._status === TransactionStatusMap.accepted ||
        transaction._status === TransactionStatusMap.funded
      ) {
        throw ERROR_TRANSACTION_CAN_NOT_UPDATE;
      }

      if (
        !(TransactionStateMap[transaction._status] as string[]).includes(status)
      ) {
        throw ERROR_TRANSACTION_INVALID_STATUS;
      }

      const log: TransactionLogParams = {
        fileURLs,
        note,
        _createdBy,
        _status,
        _createdAt,
      };

      await tx.set(
        d1,
        {
          status: _status,
          logs: arrayUnion(log),
        },
        { merge: true },
      );

      newNotificationsTx(tx, {
        collection: TRANSACTIONS_COLLECTION_NAME,
        userIdinBox: transaction._createdBy,
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
