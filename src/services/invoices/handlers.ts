import { Request, Response } from 'express';
import {
  createInvoice,
  listInvoices,
  updateInvoice,
  deleteInvoice,
  payInvoice,
  getInvoice,
  getPayInvoice,
} from './controllers';
import {
  CreateInvoiceRequest,
  Item,
  ListInvoicesRequest,
  PayInvoiceRequest,
  UpdateInvoiceRequest,
} from 'src/types/invoice';
import { errorHandler } from './errors';

export const createInvoiceHandler = async (req: Request, res: Response) => {
  const createInvoiceRequest: CreateInvoiceRequest = {
    billToEmail: String(req.body.billToEmail),
    items: req.body.items as Item[],
    messageToClient: String(req.body.messageToClient),
    termAndCondition: String(req.body.termAndCondition),
    referenceNumber: String(req.body.referenceNumber),
    memoToSelf: String(req.body.memoToSelf),
    fileUrl: String(req.body.fileUrl),
    invoiceNumber: String(req.body.invoiceNumber),
  };

  const { data, error } = await createInvoice(
    createInvoiceRequest,
    req.user.user_id,
  );
  return responseHandler(res, data, 201, error);
};

export const listInvoicesHandler = async (req: Request, res: Response) => {
  let queryParams: ListInvoicesRequest = {
    page: Number(req.query.page),
  };
  const { data, error } = await listInvoices(queryParams, req.user.user_id);
  return responseHandler(res, data, 200, error);
};

export const getInvoiceHandler = async (req: Request, res: Response) => {
  const { data, error } = await getInvoice(
    String(req.params.id),
    req.user.user_id,
  );
  return responseHandler(res, data, 200, error);
};

export const updateInvoiceHandler = async (req: Request, res: Response) => {
  const updateInvoiceRequest: UpdateInvoiceRequest = {
    billToEmail: req.body.billToEmail,
    items: req.body.items,
    messageToClient: req.body.messageToClient,
    termAndCondition: req.body.termAndCondition,
    referenceNumber: req.body.referenceNumber,
    memoToSelf: req.body.memoToSelf,
    fileUrl: req.body.fileUrl,
    invoiceNumber: req.body.invoiceNumber,
    status: req.body.status,
  };

  const { error } = await updateInvoice(
    req.params.id,
    updateInvoiceRequest,
    req.user.user_id,
  );

  return responseHandler(res, {}, 204, error);
};

export const deleteInvoiceHandler = async (req: Request, res: Response) => {
  const { data, error } = await deleteInvoice(req.params.id, req.user.user_id);
  return responseHandler(res, data, 200, error);
};

export const payInvoiceHandler = async (req: Request, res: Response) => {
  const payInvoiceRequest: PayInvoiceRequest = {
    uid: String(req.params.uid),
    id: String(req.params.id),
  };

  const { data, error } = await payInvoice(
    payInvoiceRequest,
    req.user.user_id,
    req.user.email,
  );
  return responseHandler(res, data, 200, error);
};

export const getPayInvoiceHandler = async (req: Request, res: Response) => {
  const { data, error } = await getPayInvoice(
    {
      uid: String(req.params.uid),
      id: String(req.params.id),
    },
    req.user.email,
  );
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
