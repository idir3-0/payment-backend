import { randomUUID } from 'crypto';
import {
  collection,
  doc,
  getDoc,
  limit,
  startAt,
  query,
  orderBy,
  getDocs,
  Timestamp,
  runTransaction,
  Transaction,
  arrayUnion,
  deleteField,
} from 'firebase/firestore';
import { firebaseDatabase } from 'src/adapters/firebase/firebase';
import {
  CreateInvoiceRequest,
  ListInvoicesRequest,
  InvoiceInfo,
  UpdateInvoiceRequest,
  InvoiceStatus,
  PayInvoiceRequest,
  InvoiceStatusState,
  GetPayInvoiceRequest,
} from 'src/types/invoice';
import {
  ERROR_INVOICE_NOT_EXIST,
  ERROR_INVOICE_CAN_NOT_UPDATE,
  ERROR_INVOICE_CAN_NOT_DELETE,
  ERROR_INVOICE_INVALID_STATUS,
  ERROR_INVOICE_UNAUTH_PAY,
  ERROR_INVOICE_ALREADY_PAIED,
} from './errors';
import { normalizePagination } from './utils';

const INVOICE_COLLECTION_NAME = 'invoices';
const CREATED_INVOICE_COLLECTION_NAME = 'created-invoices';
const PAIED_INVOICE_COLLECTION_NAME = 'paied-invoices';

const getCurrentDate = () => {
  const datetime = new Date();
  return `${datetime.getFullYear()}-${datetime.getMonth() + 1}`;
};

export const createInvoice = async (
  req: CreateInvoiceRequest,
  userId: string,
) => {
  let uuid = randomUUID();

  try {
    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      // Path: invoices > user_id > created > UUID

      const d1 = doc(
        firebaseDatabase,
        INVOICE_COLLECTION_NAME,
        userId,
        CREATED_INVOICE_COLLECTION_NAME,
        uuid,
      );

      const datetime = Timestamp.now();
      await tx.set(d1, {
        ...req,
        userId,
        status: InvoiceStatus.draft,
        createdAt: datetime.seconds,
      });

      const invoiceLocation = `${userId}_${INVOICE_COLLECTION_NAME}_${CREATED_INVOICE_COLLECTION_NAME}_${uuid}_${datetime.seconds}`;

      const d2 = doc(
        firebaseDatabase,
        `${INVOICE_COLLECTION_NAME}-create-log`,
        getCurrentDate(),
      );

      await tx.set(
        d2,
        {
          logs: arrayUnion(invoiceLocation),
        },
        { merge: true },
      );
    });
    return {
      data: { id: uuid },
    };
  } catch (error) {
    return { error };
  }
};

export const listInvoices = async (
  req: ListInvoicesRequest,
  userId: string,
) => {
  try {
    const { limit: lim, offset: off, page } = normalizePagination(req);
    const col = collection(
      firebaseDatabase,
      INVOICE_COLLECTION_NAME,
      userId,
      CREATED_INVOICE_COLLECTION_NAME,
    );

    const q = query(col, orderBy('createdAt'), startAt(off), limit(lim));
    const invoicesSnap = await getDocs(q);
    const invoices = [];
    invoicesSnap.forEach((inv) => {
      const invoice = {
        id: inv.id,
        ...inv.data(),
      };
      invoices.push(invoice);
    });
    return { data: { invoices, page, limit: lim } };
  } catch (error) {
    return { error };
  }
};

export const updateInvoice = async (
  id: string,
  updateInvoiceRequest: UpdateInvoiceRequest,
  userId: string,
) => {
  try {
    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const d = doc(
        firebaseDatabase,
        INVOICE_COLLECTION_NAME,
        userId,
        CREATED_INVOICE_COLLECTION_NAME,
        id,
      );

      const invoiceSnapshot = await tx.get(d);
      const invoice = invoiceSnapshot.data() as InvoiceInfo;

      if (!invoice) {
        throw ERROR_INVOICE_NOT_EXIST;
      }

      if (invoice.status !== InvoiceStatus.draft) {
        throw ERROR_INVOICE_CAN_NOT_UPDATE;
      }

      if (updateInvoiceRequest.status) {
        if (
          !InvoiceStatusState[invoice.status].includes(
            updateInvoiceRequest.status,
          ) ||
          updateInvoiceRequest.status === InvoiceStatus.paied
        ) {
          throw ERROR_INVOICE_INVALID_STATUS;
        }
      }

      tx.set(
        d,
        {
          billToEmail: updateInvoiceRequest.billToEmail || invoice.billToEmail,
          items: updateInvoiceRequest.items || invoice.items,
          messageToClient:
            updateInvoiceRequest.messageToClient || invoice.messageToClient,
          termAndCondition:
            updateInvoiceRequest.termAndCondition || invoice.termAndCondition,
          referenceNumber:
            updateInvoiceRequest.referenceNumber || invoice.referenceNumber,
          memoToSelf: updateInvoiceRequest.memoToSelf || invoice.memoToSelf,
          fileUrl: updateInvoiceRequest.fileUrl || invoice.fileUrl,
          invoiceNumber:
            updateInvoiceRequest.invoiceNumber || invoice.invoiceNumber,
          status: updateInvoiceRequest.status || invoice.status,
          updatedAt: Timestamp.now().seconds,
        },
        { merge: true },
      );

      if (updateInvoiceRequest.status != InvoiceStatus.draft) {
        const d2 = doc(
          firebaseDatabase,
          `${INVOICE_COLLECTION_NAME}-${
            InvoiceStatus[updateInvoiceRequest.status]
          }-log`,
          getCurrentDate(),
        );

        const datetime = Timestamp.now();
        const invoiceLocation = `${userId}_${INVOICE_COLLECTION_NAME}_${CREATED_INVOICE_COLLECTION_NAME}_${id}_${datetime.seconds}`;

        await tx.set(
          d2,
          {
            logs: arrayUnion(invoiceLocation),
          },
          { merge: true },
        );
      }
    });
  } catch (error) {
    return { error };
  }
  return {};
};

export const deleteInvoice = async (id: string, userId: string) => {
  try {
    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const d = doc(
        firebaseDatabase,
        INVOICE_COLLECTION_NAME,
        userId,
        CREATED_INVOICE_COLLECTION_NAME,
        id,
      );

      const invoiceSnapshot = await tx.get(d);
      const invoice = invoiceSnapshot.data() as InvoiceInfo;

      if (!invoice) {
        throw ERROR_INVOICE_NOT_EXIST;
      }

      if (invoice.status !== InvoiceStatus.draft) {
        throw ERROR_INVOICE_CAN_NOT_DELETE;
      }

      tx.delete(d);

      const d2 = doc(
        firebaseDatabase,
        `${INVOICE_COLLECTION_NAME}-delete-log`,
        getCurrentDate(),
      );

      const datetime = Timestamp.now();
      const invoiceLocation = `${userId}_${INVOICE_COLLECTION_NAME}_${CREATED_INVOICE_COLLECTION_NAME}_${id}_${datetime.seconds}`;

      await tx.set(
        d2,
        {
          logs: arrayUnion(invoiceLocation),
        },
        { merge: true },
      );
    });
  } catch (error) {
    return { error };
  }
  return { data: { id } };
};

export const payInvoice = async (
  payInvoiceRequest: PayInvoiceRequest,
  userId: string,
  userEmail: string,
) => {
  try {
    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const d = doc(
        firebaseDatabase,
        INVOICE_COLLECTION_NAME,
        payInvoiceRequest.uid,
        CREATED_INVOICE_COLLECTION_NAME,
        payInvoiceRequest.id,
      );

      const invoiceSnapshot = await tx.get(d);

      const invoice = invoiceSnapshot.data() as InvoiceInfo;
      if (!invoice) {
        throw ERROR_INVOICE_NOT_EXIST;
      }

      // TODO: interact with the contract to pay the invoice

      if (invoice.billToEmail !== userEmail) {
        throw ERROR_INVOICE_UNAUTH_PAY;
      }

      if (invoice.status === InvoiceStatus.paied) {
        throw ERROR_INVOICE_ALREADY_PAIED;
      }

      if (invoice.status !== InvoiceStatus.pending) {
        throw ERROR_INVOICE_NOT_EXIST;
      }

      tx.set(
        d,
        {
          status: InvoiceStatus.paied,
          updatedAt: Timestamp.now().seconds,
        },
        { merge: true },
      );

      const d2 = doc(
        firebaseDatabase,
        `${INVOICE_COLLECTION_NAME}-paied-log`,
        getCurrentDate(),
      );

      const datetime = Timestamp.now();
      const invoiceLocation = `${payInvoiceRequest.uid}_${INVOICE_COLLECTION_NAME}_${CREATED_INVOICE_COLLECTION_NAME}_${payInvoiceRequest.id}_${datetime.seconds}_${userId}`;

      await tx.set(
        d2,
        {
          logs: arrayUnion(invoiceLocation),
        },
        { merge: true },
      );

      const d3 = doc(
        firebaseDatabase,
        INVOICE_COLLECTION_NAME,
        userId,
        PAIED_INVOICE_COLLECTION_NAME,
        payInvoiceRequest.id,
      );

      await tx.set(
        d3,
        {
          ...invoice,
          invoiceInfo: {
            uid: payInvoiceRequest.uid,
          },
          userId,
          memoToSelf: deleteField(),
          status: InvoiceStatus.paied,
          createdAt: datetime.seconds,
          updatedAt: datetime.seconds,
        },
        { merge: true },
      );
    });
  } catch (error) {
    return { error };
  }
  return { data: { id: payInvoiceRequest.id } };
};

export const getInvoice = async (id: string, userId: string) => {
  try {
    const d1 = doc(
      firebaseDatabase,
      INVOICE_COLLECTION_NAME,
      userId,
      CREATED_INVOICE_COLLECTION_NAME,
      id,
    );

    const invoiceSnap = await getDoc(d1);
    const invoice = invoiceSnap.data() as InvoiceInfo;
    if (!invoice) {
      throw ERROR_INVOICE_NOT_EXIST;
    }
    return { data: { invoice } };
  } catch (error) {
    return { error };
  }
};

export const getPayInvoice = async (
  getPayInvoiceRequest: GetPayInvoiceRequest,
  userEmail: string,
) => {
  try {
    const d1 = doc(
      firebaseDatabase,
      INVOICE_COLLECTION_NAME,
      getPayInvoiceRequest.uid,
      CREATED_INVOICE_COLLECTION_NAME,
      getPayInvoiceRequest.id,
    );

    const invoiceSnap = await getDoc(d1);
    const invoice = invoiceSnap.data() as InvoiceInfo;
    if (!invoice) {
      throw ERROR_INVOICE_NOT_EXIST;
    }

    if (invoice.status !== InvoiceStatus.pending) {
      throw ERROR_INVOICE_NOT_EXIST;
    }

    if (userEmail !== invoice.billToEmail) {
      throw ERROR_INVOICE_UNAUTH_PAY;
    }

    delete invoice.memoToSelf;

    return { data: { ...invoice } };
  } catch (error) {
    return { error };
  }
};
