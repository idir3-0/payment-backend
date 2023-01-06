import {
  collection,
  doc,
  getDoc,
  limit,
  query,
  orderBy,
  getDocs,
  runTransaction,
  Transaction,
  addDoc,
  where,
  setDoc,
  documentId,
  deleteDoc,
} from 'firebase/firestore';
import { firebaseDatabase } from 'src/adapters/firebase/firebase';
import {
  CreateInvoiceRequest,
  ListInvoicesRequest,
  GetInvoiceRequest,
  BaseInvoice,
  UpdateInvoiceRequest,
  InvoiceStatusMap,
  PayInvoiceRequest,
  DeleteInvoiceRequest,
  InvoiceStatusState,
  BaseOwnerInvoice,
} from './models';
import {
  ERROR_INVOICE_NOT_EXIST,
  ERROR_INVOICE_CAN_NOT_UPDATE,
  ERROR_INVOICE_INVALID_STATUS,
  ERROR_INVOICE_UNAUTH_PAY,
  ERROR_INVOICE_ALREADY_PAIED,
  ERROR_INVOICE_DELETE,
} from './errors';

const INVOICE_COLLECTION_NAME = 'invoices';

export const createInvoice = async (
  createInvoiceRequest: CreateInvoiceRequest,
) => {
  try {
    console.log(createInvoiceRequest);
    const col = collection(firebaseDatabase, INVOICE_COLLECTION_NAME);
    const invoice = await addDoc(col, createInvoiceRequest);

    return {
      data: { id: invoice.id },
    };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

export const listInvoices = async (
  listInvoicesRequest: ListInvoicesRequest,
) => {
  try {
    const { userId, key } = listInvoicesRequest;
    const col = collection(firebaseDatabase, INVOICE_COLLECTION_NAME);

    const q = query(
      col,
      orderBy('createdAt'),
      where(key, '==', userId),
      limit(10),
    );
    const invoicesSnap = await getDocs(q);
    const invoices = [];
    invoicesSnap.forEach((inv) => {
      const invoice = {
        id: inv.id,
        ...inv.data(),
      };
      invoices.push(invoice);
    });
    return { data: { invoices, limit: 10 } };
  } catch (error) {
    return { error };
  }
};

export const updateInvoice = async (
  updateInvoiceRequest: UpdateInvoiceRequest,
) => {
  try {
    const {
      billToEmail,
      items,
      messageToClient,
      termAndCondition,
      referenceNumber,
      fileURLs,
      status,
      invoiceNumber,
      createdAt,
      updatedAt,
      invoiceId,
    } = updateInvoiceRequest;

    const d = doc(firebaseDatabase, INVOICE_COLLECTION_NAME, invoiceId);
    const invoiceSnapshot = await getDoc(d);
    const invoice = invoiceSnapshot.data() as BaseInvoice;
    if (!invoice) {
      throw ERROR_INVOICE_NOT_EXIST;
    }

    if (invoice.status !== InvoiceStatusMap.draft) {
      throw ERROR_INVOICE_CAN_NOT_UPDATE;
    }

    if (status) {
      if (
        !InvoiceStatusState[invoice.status].includes(status) ||
        status === InvoiceStatusMap.paied
      ) {
        throw ERROR_INVOICE_INVALID_STATUS;
      }
    }

    setDoc(
      d,
      {
        billToEmail: billToEmail || invoice.billToEmail,
        items: items || invoice.items,
        messageToClient: messageToClient || invoice.messageToClient,
        termAndCondition: termAndCondition || invoice.termAndCondition,
        referenceNumber: referenceNumber || invoice.referenceNumber,
        fileURLs: fileURLs || invoice.fileURLs,
        status: status || invoice.status,
        invoiceNumber: invoiceNumber || invoice.invoiceNumber,
        updatedAt,
      },
      { merge: true },
    );
    return { data: {} };
  } catch (error) {
    return { error };
  }
};

export const deleteInvoice = async (
  deleteInvoiceRequest: DeleteInvoiceRequest,
) => {
  try {
    const { createdBy, invoiceId } = deleteInvoiceRequest;
    const d = doc(firebaseDatabase, INVOICE_COLLECTION_NAME, invoiceId);

    const invoiceSnapshot = await getDoc(d);
    const invoice = invoiceSnapshot.data() as BaseOwnerInvoice;

    if (!invoice) {
      throw ERROR_INVOICE_NOT_EXIST;
    }

    if (
      invoice.createdBy != createdBy ||
      invoice.status != InvoiceStatusMap.draft
    ) {
      throw ERROR_INVOICE_DELETE;
    }

    await deleteDoc(d);
    return { data: { id: invoiceId } };
  } catch (error) {
    return { error };
  }
};

export const payInvoice = async (payInvoiceRequest: PayInvoiceRequest) => {
  try {
    const { invoiceId, payerEmail, payerId, createdAt } = payInvoiceRequest;

    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const d = doc(firebaseDatabase, INVOICE_COLLECTION_NAME, invoiceId);
      const invoiceSnapshot = await tx.get(d);

      const invoice = invoiceSnapshot.data() as BaseInvoice;
      if (!invoice) {
        throw ERROR_INVOICE_NOT_EXIST;
      }

      // TODO: interact with the contract to pay the invoice
      if (invoice.billToEmail !== payerEmail) {
        throw ERROR_INVOICE_UNAUTH_PAY;
      }

      if (invoice.status === InvoiceStatusMap.paied) {
        throw ERROR_INVOICE_ALREADY_PAIED;
      }

      if (invoice.status !== InvoiceStatusMap.pending) {
        throw ERROR_INVOICE_NOT_EXIST;
      }

      tx.set(
        d,
        {
          payerId,
          status: InvoiceStatusMap.paied,
          updatedAt: createdAt,
        },
        { merge: true },
      );
    });
    return { data: { id: invoiceId } };
  } catch (error) {
    return { error };
  }
};

export const getInvoice = async (getInvoiceRequest: GetInvoiceRequest) => {
  const { invoiceId, userId, userEmail } = getInvoiceRequest;
  try {
    const d = doc(firebaseDatabase, INVOICE_COLLECTION_NAME, invoiceId);
    const invoiceSnapshot = await getDoc(d);
    const invoice = invoiceSnapshot.data() as BaseOwnerInvoice;
    if (!invoice) {
      throw ERROR_INVOICE_NOT_EXIST;
    }

    if (userId == invoice.createdBy) {
      return { data: { invoice } };
    }

    if (userId == invoice.payerId || userEmail == invoice.billToEmail) {
      return { data: { invoice: invoice as BaseInvoice } };
    }

    throw ERROR_INVOICE_NOT_EXIST;
  } catch (error) {
    return { error };
  }
};
