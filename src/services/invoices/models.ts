import { BusinessInfo } from '../accounts/models';

export type InvoiceStatusType = 'archived' | 'draft' | 'paied' | 'pending';

export type InvoiceType = 'created' | 'paied';

export const InvoiceStatus = {
  archived: 'archived',
  draft: 'draft',
  paied: 'paied',
  pending: 'pending',
};

export const InvoiceStatusState = {
  archived: [InvoiceStatus.pending],
  draft: [InvoiceStatus.pending, InvoiceStatus.archived],
  paied: [],
  pending: [InvoiceStatus.archived, InvoiceStatus.paied],
};

export interface CreateInvoiceRequest {
  billToEmail?: string;
  items?: Item[];
  messageToClient?: string;
  termAndCondition?: string;
  referenceNumber?: string;
  memoToSelf?: string;
  fileUrl?: string;
  invoiceNumber?: string;
}

export interface ListInvoicesRequest {
  type: InvoiceType;
  limit?: number;
}

export interface InvoiceInfo {
  id?: string;
  userId: string;
  billToEmail?: string;
  items?: Item;
  messageToClient?: string;
  termAndCondition?: string;
  referenceNumber?: string;
  memoToSelf?: string;
  fileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  invoiceNumber?: string;
  status: InvoiceStatusType;
}

export interface UpdateInvoiceRequest {
  billToEmail?: string;
  email?: string;
  items?: Item;
  messageToClient?: string;
  termAndCondition?: string;
  referenceNumber?: string;
  memoToSelf?: string;
  fileUrl?: string;
  status?: InvoiceStatusType;
  invoiceNumber?: string;
}

export interface PayInvoiceRequest {
  uid: string;
  id: string;
}

export interface GetPayInvoiceRequest {
  uid: string;
  id: string;
}

export interface Item {
  id: string;
  line: number;
  title: string;
  amount: number;
}
