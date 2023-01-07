import { Request, Response } from 'express';
import {
  createInvoice,
  listInvoices,
  updateInvoice,
  deleteInvoice,
  payInvoice,
  getInvoice,
} from './controllers';
import {
  CreateInvoiceParams,
  CreateInvoiceRequest,
  DeleteInvoiceParams,
  DeleteInvoiceRequest,
  GetInvoiceParams,
  GetInvoiceRequest,
  InvoiceStatusMap,
  InvoiceUser,
  ListInvoicesParams,
  ListInvoicesRequest,
  PayInvoiceParams,
  PayInvoiceRequest,
  UpdateInvoiceParams,
  UpdateInvoiceRequest,
} from 'payment-types';
import { errorHandler } from './errors';
import { Timestamp } from 'firebase/firestore';
import { responseHandler } from 'src/utils/response';

export const createInvoiceHandler = async (req: Request, res: Response) => {
  const createdAt = Timestamp.now().seconds;

  const createInvoiceRequest: CreateInvoiceRequest =
    req.body as CreateInvoiceRequest;

  const createInvoiceParams: CreateInvoiceParams = {
    ...createInvoiceRequest,
    _createdBy: req.user.user_id,
    _createdAt: createdAt,
    _updatedAt: createdAt,
  };

  const { data, error } = await createInvoice(createInvoiceParams);
  return responseHandler(res, data, 201, error, errorHandler);
};

export const listInvoicesHandler = async (req: Request, res: Response) => {
  let listInvoicesRequest: ListInvoicesRequest = {
    key: req.query.key as InvoiceUser,
    limit: 10,
  };

  let listInvoicesParams: ListInvoicesParams = {
    ...listInvoicesRequest,
    _userId: req.user.user_id,
  };
  const { data, error } = await listInvoices(listInvoicesParams);
  return responseHandler(res, data, 200, error, errorHandler);
};

export const getInvoiceHandler = async (req: Request, res: Response) => {
  let getInvoiceRequest: GetInvoiceRequest = {
    invoiceId: req.params.invoiceId,
  };

  let getInvoiceParams: GetInvoiceParams = {
    ...getInvoiceRequest,
    _userId: req.user.user_id,
    _userEmail: req.user.email,
  };

  const { data, error } = await getInvoice(getInvoiceParams);
  return responseHandler(res, data, 200, error, errorHandler);
};

export const updateInvoiceHandler = async (req: Request, res: Response) => {
  const updateInvoiceRequest: UpdateInvoiceRequest = {
    billToEmail: req.body.billToEmail,
    items: req.body.items,
    messageToClient: req.body.messageToClient,
    termAndCondition: req.body.termAndCondition,
    referenceNumber: req.body.referenceNumber,
    memoToSelf: req.body.memoToSelf,
    fileURLs: req.body.fileURLs,
    invoiceNumber: req.body.invoiceNumber,
    status: req.body.status,
  };

  const updateInvoiceParams: UpdateInvoiceParams = {
    ...updateInvoiceRequest,
    _invoiceId: req.params.invoiceId,
    _updatedAt: Timestamp.now().seconds,
    _createdBy: req.user.user_id,
  };

  const { error } = await updateInvoice(updateInvoiceParams);
  return responseHandler(res, {}, 204, error, errorHandler);
};

export const deleteInvoiceHandler = async (req: Request, res: Response) => {
  const deleteInvoiceRequest: DeleteInvoiceRequest = {
    invoiceId: req.params.invoiceId,
  };

  const deleteInvoiceParams: DeleteInvoiceParams = {
    ...deleteInvoiceRequest,
    _createdBy: req.user.user_id,
  };
  const { data, error } = await deleteInvoice(deleteInvoiceParams);
  return responseHandler(res, data, 200, error, errorHandler);
};

export const payInvoiceHandler = async (req: Request, res: Response) => {
  const payInvoiceRequest: PayInvoiceRequest = {
    invoiceId: req.params.invoiceId,
    address: req.body.address,
  };

  const payInvoiceParams: PayInvoiceParams = {
    ...payInvoiceRequest,
    _payerId: req.user.user_id,
    _payerEmail: req.user.email,
    _createdAt: Timestamp.now().seconds,
  };

  const { data, error } = await payInvoice(payInvoiceParams);
  return responseHandler(res, data, 200, error, errorHandler);
};
