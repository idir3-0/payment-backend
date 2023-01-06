export type InvoiceStatusType = 'archived' | 'draft' | 'paied' | 'pending';

export type InvoiceType = 'created' | 'paied';

export type InvoiceUser = 'createdBy' | 'payerId';

export const InvoiceUserMap: {
  createdBy: InvoiceUser;
  payerId: InvoiceUser;
} = {
  createdBy: 'createdBy',
  payerId: 'payerId',
};

export const InvoiceTypeMap: {
  created: InvoiceType;
  paied: InvoiceType;
} = {
  created: 'created',
  paied: 'paied',
};

export const InvoiceStatusMap = {
  archived: 'archived',
  draft: 'draft',
  paied: 'paied',
  pending: 'pending',
};

export const InvoiceStatusState = {
  archived: [InvoiceStatusMap.pending],
  draft: [InvoiceStatusMap.pending, InvoiceStatusMap.archived],
  paied: [],
  pending: [InvoiceStatusMap.archived, InvoiceStatusMap.paied],
};

export interface BaseInvoice {
  invoiceId?: string;
  billToEmail?: string;
  createdBy?: string;
  payerId?: string;
  items?: Item;
  messageToClient?: string;
  termAndCondition?: string;
  referenceNumber?: string;
  fileURLs?: string[];
  status?: InvoiceStatusType;
  invoiceNumber?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface BaseOwnerInvoice extends BaseInvoice {
  memoToSelf?: string;
}

export interface Invoice extends BaseInvoice {
  invoiceId: string;
}

export interface CreateInvoiceRequest extends BaseOwnerInvoice {}

export interface GetInvoiceRequest {
  invoiceId: string;
  userId: string;
  userEmail: string;
}

export interface UpdateInvoiceRequest extends BaseOwnerInvoice {}

export interface DeleteInvoiceRequest {
  createdBy: string;
  invoiceId: string;
}

export interface GetPayInvoiceRequest extends BaseInvoice {}

export interface PayInvoiceRequest {
  invoiceId: string;
  payerId: string;
  payerEmail: string;
  createdAt: number;
}

export interface Item {
  id: string;
  line: number;
  title: string;
  amount: number;
}

export interface ListInvoicesRequest {
  userId: string;
  key: InvoiceUser;
  limit?: number;
}
