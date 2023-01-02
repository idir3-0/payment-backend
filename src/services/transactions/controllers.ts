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
} from 'firebase/firestore';
import { firebaseDatabase } from 'src/adapters/firebase/firebase';
import {
  TransactionRequest,
  UserUpdateTransactionRequest,
  AdminUpdateTransactionRequest,
  TransactionInfo,
  TransactionType,
  TransactionStateMap,
  TransactionStatusMap,
  ListTransactionRequest,
} from './models';
import { getCurrentDate } from 'src/utils/date';
import {
  ERROR_TRANSACTION_CAN_NOT_UPDATE,
  ERROR_TRANSACTION_INVALID_STATUS,
  ERROR_TRANSACTION_NOT_EXIST,
  ERROR_TRANSACTION_PROCESSED,
} from './errors';
import { normalizePagination } from './utils';
import { newNotificationsTx } from '../notifications/controllers';

const TRANSACTIONS_COLLECTION_NAME = 'transactions';
const TRANSACTIONS_LOG_COLLECTION_NAME = 'transactions-logs';
const TRANSACTIONS_DEPOSIT = 'deposit';
const TRANSACTIONS_WITHDRAW = 'withdraw';
const TRANSACTIONS_ADMIN_TASK = 'transactions-admin-tasks';
const NOTIFICATIONS = 'notifications';

export const deposit = async (
  transactionRequest: TransactionRequest,
  userId: string,
) => {
  return await baseTransaction(
    transactionRequest,
    TRANSACTIONS_DEPOSIT,
    userId,
  );
};

export const withdraw = async (req: TransactionRequest, userId: string) => {
  return baseTransaction(req, TRANSACTIONS_WITHDRAW, userId);
};

const baseTransaction = async (
  transactionRequest: TransactionRequest,
  transactionType: TransactionType,
  userId: string,
) => {
  let id = randomUUID();
  try {
    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      // Path: transactions-{deposit | withdraw} > [user_id] > deposit | withdraw > ID
      const d1 = doc(
        firebaseDatabase,
        TRANSACTIONS_COLLECTION_NAME,
        transactionType,
        userId,
        id,
      );

      const datetime = Timestamp.now();
      const transaction = {
        amount: transactionRequest.amount,
        bank: transactionRequest.bank,
        createdAt: datetime.seconds,
        userId,
        logs: [
          {
            fileUrls: transactionRequest.fileURLs,
            note: transactionRequest.note,
            createdAt: datetime.seconds,
            userId,
            status: TransactionStatusMap.requested,
          },
          {
            note: 'In review',
            createdAt: datetime.seconds,
            status: TransactionStatusMap.processing,
          },
        ],
      };

      // TODO: check user balance when withdraw

      await tx.set(d1, transaction);

      const d2 = doc(
        firebaseDatabase,
        `${TRANSACTIONS_LOG_COLLECTION_NAME}_${transactionType}`,
        getCurrentDate(),
      );

      const transactionLocation = getTransactionLocation(
        transactionType,
        userId,
        id,
        Timestamp.now().seconds,
      );

      await tx.set(
        d2,
        {
          logs: { transactionLocation: { status: 'open' } },
        },
        { merge: true },
      );
    });
    return { data: { id } };
  } catch (error) {
    return { error };
  }
};

export const userUpdateTransaction = async (
  userUpdateTransactionRequest: UserUpdateTransactionRequest,
  userId: string,
) => {
  try {
    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const d1 = doc(
        firebaseDatabase,
        TRANSACTIONS_COLLECTION_NAME,
        userUpdateTransactionRequest.transactionIdInfo.type,
        userId,
        userUpdateTransactionRequest.transactionIdInfo.id,
      );

      const transactionsSnapshot = await tx.get(d1);
      const transaction = transactionsSnapshot.data() as TransactionInfo;
      if (!transaction) {
        throw ERROR_TRANSACTION_NOT_EXIST;
      }

      if (transaction.userId !== userId) {
        throw ERROR_TRANSACTION_NOT_EXIST;
      }

      const txStatus = transaction.logs[transaction.logs.length - 1].status;
      if (
        txStatus === TransactionStatusMap.funded ||
        txStatus === TransactionStatusMap.accepted
      ) {
        throw ERROR_TRANSACTION_PROCESSED;
      }

      const log = {
        userId,
        fileUrls: userUpdateTransactionRequest.fileUrls,
        note: userUpdateTransactionRequest.note,
        status: TransactionStatusMap.processing,
        createdAt: Timestamp.now().seconds,
      };
      await tx.set(
        d1,
        {
          logs: arrayUnion(log),
        },
        { merge: true },
      );
    });
    return { data: {} };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

export const adminFundBalanceAccount = async () => {};

export const listUserTransactions = async (
  listTransactionRequest: ListTransactionRequest,
  userId: string,
) => {
  try {
    const { limit: lim, transactionType } = normalizePagination(
      listTransactionRequest,
    );

    const col = collection(
      firebaseDatabase,
      TRANSACTIONS_COLLECTION_NAME,
      transactionType,
      userId,
    );

    const q = query(col, orderBy('createdAt', 'desc'), limit(lim));
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
    console.log(error);
    return { error };
  }
};

export const adminUpdateTransaction = async (
  adminUpdateTransactionRequest: AdminUpdateTransactionRequest,
  userId: string,
) => {
  try {
    const {
      transactionIdInfo,
      uid,
      status: newStatus,
      fileUrls,
      note,
    } = adminUpdateTransactionRequest;

    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const d1 = doc(
        firebaseDatabase,
        TRANSACTIONS_COLLECTION_NAME,
        transactionIdInfo.type,
        uid,
        transactionIdInfo.id,
      );

      const transactionSnapshot = await tx.get(d1);
      const transaction = transactionSnapshot.data() as TransactionInfo;

      if (!transaction) {
        throw ERROR_TRANSACTION_NOT_EXIST;
      }

      const txStatus = transaction.logs[transaction.logs.length - 1].status;
      if (
        txStatus === TransactionStatusMap.accepted ||
        txStatus === TransactionStatusMap.funded
      ) {
        throw ERROR_TRANSACTION_CAN_NOT_UPDATE;
      }

      if (!(TransactionStateMap[txStatus] as string[]).includes(newStatus)) {
        throw ERROR_TRANSACTION_INVALID_STATUS;
      }

      const createdAt = Timestamp.now().seconds;
      const log = {
        fileUrls: fileUrls || null,
        note: note || null,
        userId,
        status: newStatus,
        createdAt,
      };

      await tx.set(
        d1,
        {
          logs: arrayUnion(log),
        },
        { merge: true },
      );

      // Create notification for the invoice owner
      newNotificationsTx(tx, {
        userId: uid,
        collection: TRANSACTIONS_COLLECTION_NAME,
        path: transactionIdInfo.type,
        createdAt,
        action: newStatus,
        ownerId: uid,
        refId: transactionIdInfo.id,
      });

      if (
        newStatus === TransactionStatusMap.accepted ||
        newStatus === TransactionStatusMap.rejected
      ) {
        const d2 = doc(
          firebaseDatabase,
          `${TRANSACTIONS_LOG_COLLECTION_NAME}_${transactionIdInfo.type}`,
          getCurrentDate(),
        );
        const transactionLocation = getTransactionLocation(
          transactionIdInfo.type,
          uid,
          transactionIdInfo.id,
          Timestamp.now().seconds,
        );

        await tx.update(d2, {
          logs: arrayUnion(transactionLocation),
        });
      }
    });
    return {};
  } catch (error) {
    return { error };
  }
};

const getTransactionLocation = (
  transactionType: TransactionType,
  transactionOwner: string,
  transactionId: string,
  timestamp: number,
) => {
  return `${TRANSACTIONS_LOG_COLLECTION_NAME}_${transactionType}_${transactionOwner}_${transactionId}_${timestamp}`;
};
