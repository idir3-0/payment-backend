import { randomUUID } from 'crypto';
import {
  arrayUnion,
  Transaction,
  runTransaction,
  doc,
  Timestamp,
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
  TransactionAdminLog,
  TransactionActionMap,
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
  let transactionId = randomUUID();
  try {
    const { amount, bank, createdBy, status, fileURLs, note, createdAt } =
      transactionRequest;

    const d = collection(
      firebaseDatabase,
      TRANSACTIONS_COLLECTION_NAME,
      transactionType,
      createdBy,
    );

    // Check if the user can create a deposit request.
    const q = query(d, where('status', '==', TransactionStatusMap.processing));
    const transactionSnap = await getDocs(q);
    // TODO: improve
    const numActiveDocs = transactionSnap.size;
    if (numActiveDocs >= 1) {
      throw ERROR_TRANSACTION_ALREADY_IN_REVIEW;
    }

    if (transactionType === TransactionTypeMap.withdraw) {
      // TODO: check user balance when withdraw
    }

    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      // Path: transactions-{deposit | withdraw} > [user_id] > deposit | withdraw > ID
      const d1 = doc(
        firebaseDatabase,
        TRANSACTIONS_COLLECTION_NAME,
        transactionType,
        createdBy,
        transactionId,
      );

      const transaction: DWTransaction = {
        amount,
        bank,
        createdAt,
        status: TransactionStatusMap.processing,
        createdBy,
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

      tx.set(d1, transaction);

      createTransactionAdminLog(tx, {
        transactionId,
        transactionAction: TransactionActionMap.create,
        transactionOwner: createdBy,
        transactionType,
        createdAt,
      });
    });
    return { data: { id: transactionId } };
  } catch (error) {
    return { error };
  }
};

export const userUpdateTransaction = async (
  updateTransactionRequest: UpdateTransactionRequest,
) => {
  try {
    const {
      transactionId,
      transactionType,
      fileURLs,
      note,
      createdBy,
      status,
      createdAt,
    } = updateTransactionRequest;

    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const d1 = doc(
        firebaseDatabase,
        TRANSACTIONS_COLLECTION_NAME,
        transactionType,
        createdBy,
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

      createTransactionAdminLog(tx, {
        transactionId,
        transactionAction: TransactionActionMap.update,
        transactionOwner: createdBy,
        transactionType,
        createdAt,
      });
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
    const { owner, transactionType } = listTransactionRequest;
    const col = collection(
      firebaseDatabase,
      TRANSACTIONS_COLLECTION_NAME,
      transactionType,
      owner,
    );

    // TODO: add paggination
    const q = query(col, orderBy('createdAt', 'desc'), limit(20));
    const transactionsSnap = await getDocs(q);
    const transactions = [];
    transactionsSnap.forEach((inv) => {
      const invoice = {
        id: inv.id,
        ...inv.data(),
      };
      transactions.push(invoice);
    });
    return { data: { transactions, limit: 20 } };
  } catch (error) {
    return { error };
  }
};

export const adminUpdateTransaction = async (
  adminUpdateTransactionRequest: AdminUpdateTransactionRequest,
) => {
  try {
    const {
      transactionType,
      transactionOwner,
      transactionId,
      status,
      fileURLs,
      note,
      createdBy,
      createdAt,
    } = adminUpdateTransactionRequest;

    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const d1 = doc(
        firebaseDatabase,
        TRANSACTIONS_COLLECTION_NAME,
        transactionType,
        transactionOwner,
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
        userId: transactionOwner,
        path: transactionType,
        createdAt,
        action: status,
        ownerId: transactionOwner,
        refId: transactionId,
      });

      createTransactionAdminLog(tx, {
        transactionId,
        transactionAction: TransactionActionMap.update,
        transactionOwner,
        transactionType,
        createdAt,
      });
    });
    return {};
  } catch (error) {
    return { error };
  }
};

const toTransactionAdminLog = (transactionAdminLog: TransactionAdminLog) => {
  return JSON.stringify(transactionAdminLog);
};

const createTransactionAdminLog = (
  tx: Transaction,
  transactionAdminLog: TransactionAdminLog,
) => {
  const d2 = doc(
    firebaseDatabase,
    `${TRANSACTIONS_LOG_COLLECTION_NAME}_${transactionAdminLog.transactionType}`,
    getCurrentDate(),
  );

  tx.set(
    d2,
    {
      logs: arrayUnion(toTransactionAdminLog(transactionAdminLog)),
    },
    { merge: true },
  );
};
