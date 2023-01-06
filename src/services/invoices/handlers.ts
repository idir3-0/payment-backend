import { Request, Response, query } from 'express';
import {
  createInvoice,
  listInvoices,
  updateInvoice,
  deleteInvoice,
  payInvoice,
  getInvoice,
} from './controllers';
import {
  CreateInvoiceRequest,
  DeleteInvoiceRequest,
  GetInvoiceRequest,
  InvoiceStatusMap,
  InvoiceStatusType,
  InvoiceType,
  InvoiceUser,
  Item,
  ListInvoicesRequest,
  PayInvoiceRequest,
  UpdateInvoiceRequest,
} from './models';
import { errorHandler } from './errors';
import { Timestamp } from 'firebase/firestore';

export const createInvoiceHandler = async (req: Request, res: Response) => {
  const createdAt = Timestamp.now().seconds;

  const createInvoiceRequest: CreateInvoiceRequest = {
    billToEmail: req.body.billToEmail,
    items: req.body.items,
    messageToClient: req.body.messageToClient,
    termAndCondition: req.body.termAndCondition,
    referenceNumber: req.body.referenceNumber,
    memoToSelf: req.body.memoToSelf,
    invoiceNumber: req.body.invoiceNumber,
    createdBy: req.user.user_id,
    fileURLs: req.body.fileURLs,
    status: InvoiceStatusMap.draft as InvoiceStatusType,
    createdAt,
    updatedAt: createdAt,
  };

  const { data, error } = await createInvoice(createInvoiceRequest);
  return responseHandler(res, data, 201, error);
};

export const listInvoicesHandler = async (req: Request, res: Response) => {
  let listInvoicesRequest: ListInvoicesRequest = {
    key: req.query.key as InvoiceUser,
    userId: req.user.user_id,
    limit: 10,
  };
  const { data, error } = await listInvoices(listInvoicesRequest);
  return responseHandler(res, data, 200, error);
};

export const getInvoiceHandler = async (req: Request, res: Response) => {
  let getInvoiceRequest: GetInvoiceRequest = {
    invoiceId: req.params.invoiceId,
    userId: req.user.user_id,
    userEmail: req.user.email,
  };
  const { data, error } = await getInvoice(getInvoiceRequest);
  return responseHandler(res, data, 200, error);
};

export const updateInvoiceHandler = async (req: Request, res: Response) => {
  const updateInvoiceRequest: UpdateInvoiceRequest = {
    invoiceId: req.params.invoiceId,
    billToEmail: req.body.billToEmail,
    items: req.body.items,
    messageToClient: req.body.messageToClient,
    termAndCondition: req.body.termAndCondition,
    referenceNumber: req.body.referenceNumber,
    memoToSelf: req.body.memoToSelf,
    fileURLs: req.body.fileURLs,
    invoiceNumber: req.body.invoiceNumber,
    status: req.body.status,
    updatedAt: Timestamp.now().seconds,
    createdBy: req.user.user_id,
  };

  const { error } = await updateInvoice(updateInvoiceRequest);
  return responseHandler(res, {}, 204, error);
};

export const deleteInvoiceHandler = async (req: Request, res: Response) => {
  const deleteInvoiceRequest: DeleteInvoiceRequest = {
    createdBy: req.user.user_id,
    invoiceId: req.params.invoiceId,
  };
  const { data, error } = await deleteInvoice(deleteInvoiceRequest);
  return responseHandler(res, data, 200, error);
};

export const payInvoiceHandler = async (req: Request, res: Response) => {
  const payInvoiceRequest: PayInvoiceRequest = {
    invoiceId: req.params.invoiceId,
    payerId: req.user.user_id,
    payerEmail: req.user.email,
    createdAt: Timestamp.now().seconds,
  };

  const { data, error } = await payInvoice(payInvoiceRequest);
  return responseHandler(res, data, 200, error);
};

const responseHandler = (
  res: Response,
  data: any,
  successStatus: number,
  err: string,
) => {
  if (err) {
    const { status, error } = errorHandler(err);
    return res.status(status).json({
      status: false,
      error,
    });
  }
  return res.status(successStatus).json({
    status: true,
    result: data,
  });
};
