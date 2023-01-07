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
  deleteDoc,
} from 'firebase/firestore';
import { firebaseDatabase } from 'src/adapters/firebase/firebase';
import {
  Invoice,
  InvoiceStatusMap,
  InvoiceStatusState,
  CreateInvoiceParams,
  GetInvoiceParams,
  UpdateInvoiceParams,
  DeleteInvoiceParams,
  PayInvoiceParams,
  ListInvoicesParams,
} from 'payment-types';
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
  createInvoiceParams: CreateInvoiceParams,
): Promise<{ data?: Object; error?: Error }> => {
  try {
    const col = collection(firebaseDatabase, INVOICE_COLLECTION_NAME);
    const invoice = await addDoc(col, createInvoiceParams);

    return {
      data: { id: invoice.id },
    };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

export const listInvoices = async (
  listInvoicesParams: ListInvoicesParams,
): Promise<{ data?: Object; error?: Error }> => {
  try {
    console.log(listInvoicesParams);
    const { _userId, key } = listInvoicesParams;
    const col = collection(firebaseDatabase, INVOICE_COLLECTION_NAME);

    const q = query(
      col,
      orderBy('_createdAt'),
      where(key, '==', _userId),
      limit(10),
    );
    const invoicesSnap = await getDocs(q);
    const invoices = [];
    invoicesSnap.forEach((inv) => {
      console.log(11111111);
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
  updateInvoiceParams: UpdateInvoiceParams,
): Promise<{ data?: Object; error?: Error }> => {
  try {
    const {
      billToEmail,
      items,
      messageToClient,
      termAndCondition,
      referenceNumber,
      fileURLs,
      memoToSelf,
      status,
      invoiceNumber,
      _invoiceId,
      _createdBy,
      _updatedAt,
    } = updateInvoiceParams;
    console.log(updateInvoiceParams);
    const d = doc(firebaseDatabase, INVOICE_COLLECTION_NAME, _invoiceId);
    const invoiceSnapshot = await getDoc(d);
    const invoice = invoiceSnapshot.data() as Invoice;
    if (!invoice) {
      throw ERROR_INVOICE_NOT_EXIST;
    }

    if (_createdBy !== invoice._createdBy) {
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
        memoToSelf: memoToSelf || invoice.memoToSelf,
        updatedAt: _updatedAt,
      },
      { merge: true },
    );
    return { data: {} };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

export const deleteInvoice = async (
  deleteInvoiceParams: DeleteInvoiceParams,
): Promise<{ data?: Object; error?: Error }> => {
  try {
    const { _createdBy, invoiceId } = deleteInvoiceParams;
    const d = doc(firebaseDatabase, INVOICE_COLLECTION_NAME, invoiceId);
    console.log(deleteInvoiceParams);

    const invoiceSnapshot = await getDoc(d);
    const invoice = invoiceSnapshot.data() as Invoice;

    if (!invoice) {
      throw ERROR_INVOICE_NOT_EXIST;
    }

    console.log(invoice._createdBy, _createdBy);
    console.log(invoice.status, InvoiceStatusMap.draft);
    if (
      invoice._createdBy != _createdBy ||
      invoice.status != InvoiceStatusMap.draft
    ) {
      throw ERROR_INVOICE_DELETE;
    }

    await deleteDoc(d);
    return { data: { id: invoiceId } };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

export const payInvoice = async (
  payInvoiceParams: PayInvoiceParams,
): Promise<{ data?: Object; error?: Error }> => {
  try {
    const { invoiceId, _payerEmail, _payerId, _createdAt } = payInvoiceParams;

    await runTransaction(firebaseDatabase, async (tx: Transaction) => {
      const d = doc(firebaseDatabase, INVOICE_COLLECTION_NAME, invoiceId);
      const invoiceSnapshot = await tx.get(d);

      const invoice = invoiceSnapshot.data() as Invoice;
      if (!invoice) {
        throw ERROR_INVOICE_NOT_EXIST;
      }

      // TODO: interact with the contract to pay the invoice
      if (invoice.billToEmail !== _payerEmail) {
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
          _payerId,
          status: InvoiceStatusMap.paied,
          updatedAt: _createdAt,
        },
        { merge: true },
      );
    });
    return { data: { id: invoiceId } };
  } catch (error) {
    return { error };
  }
};

export const getInvoice = async (
  getInvoiceParams: GetInvoiceParams,
): Promise<{ data?: Object; error?: Error }> => {
  const { invoiceId, _userId, _userEmail } = getInvoiceParams;
  try {
    const d = doc(firebaseDatabase, INVOICE_COLLECTION_NAME, invoiceId);
    const invoiceSnapshot = await getDoc(d);
    const invoice = invoiceSnapshot.data() as Invoice;
    if (!invoice) {
      throw ERROR_INVOICE_NOT_EXIST;
    }

    if (_userId == invoice._createdBy) {
      return { data: { invoice } };
    }

    if (_userId == invoice._payerId || _userEmail == invoice.billToEmail) {
      delete invoice.memoToSelf;
      return { data: { invoice } };
    }

    throw ERROR_INVOICE_NOT_EXIST;
  } catch (error) {
    return { error };
  }
};
