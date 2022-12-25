import { BusinessInfo } from './account';

export type InvoiceStatus =
  | 'archived'
  | 'draft'
  | 'paid'
  | 'pending'
  | 'closed';
export const InvoiceOrderBy = ['createdAt'];

export interface InvoiceInfo {
  id?: string;
  billToEmail?: string;
  email?: string;
  items?: Item;
  messageToClient?: string;
  termAndCondition?: string;
  referenceNumber?: string;
  memoToSelf?: string;
  fileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  invoiceNumber?: string;
  status?: InvoiceStatus;
}

export interface Invoice {
  invoiceInfo: InvoiceInfo;
  businessInfo: BusinessInfo;
}

export interface Item {
  id: string;
  line: number;
  title: string;
  amount: number;
}

export interface CreateInvoiceRequest {
  userId: string;
  billToEmail?: string;
  email?: string;
  items?: Item;
  messageToClient?: string;
  termAndCondition?: string;
  referenceNumber?: string;
  memoToSelf?: string;
  fileUrl?: string;
  invoiceNumber?: string;
}

export interface CreateInvoiceResponse {
  id: string;
}

export interface UpdateInvoiceRequest {
  billToEmail?: string;
  items?: Item;
  messageToClient?: string;
  termAndCondition?: string;
  referenceNumber?: string;
  memoToSelf?: string;
  fileUrl?: string;
  invoiceNumber?: string;
}

export interface UpdateInvoiceStatusRequest {
  status: InvoiceStatus;
}

export interface ListInvoicesRequest {
  page?: number;
  offset?: number;
  limit?: number;
  orderBy?: string;
}

export interface ListInvoicesResponse {
  total: number;
  limit: number;
  invoices: Array<InvoiceInfo>;
}

export interface DeleteInvoice {
  id: string;
}
