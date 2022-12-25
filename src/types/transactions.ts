export type Bank = 'CCP';
export type TransactionStatusType =
  | 'processing'
  | 'rejected'
  | 'refunded'
  | 'accepted'
  | 'funded';

export const TransactionStatus = {
  processing: 'processing',
  rejected: 'rejected',
  refunded: 'refunded',
  accepted: 'accepted',
  funded: 'funded',
};

export const TransactionStatusMap = {
  processing: ['rejected', 'refunded', 'accepted'],
  rejected: [],
  refunded: [],
  accepted: ['funded'],
  funded: [],
};

export const DEPOSIT: string = 'deposit';
export const WITHDRAW: string = 'withdraw';

export interface TransactionInfo {
  bank: Bank;
  amount: number;
  userId: string;
  note?: string;
  fileURLs: string[];
  status?: TransactionStatusType;
  logs?: VerificationLog[];
}

export interface TransactionRequest {
  bank: Bank;
  amount: number;
  note?: string;
  fileURLs?: string[];
}

export interface VerificationLog {
  note?: string;
  fileUrls?: string[];
  status: TransactionStatusType;
  createdBy: string;
  createdAt: number;
}

export interface UserUpdateTransactionRequest {
  transactionIdInfo: TransactionIdInfo;
  note?: string;
  fileUrls?: string[];
}

export interface AdminUpdateTransactionRequest {
  transactionIdInfo: TransactionIdInfo;
  transactionOwner: string;
  status?: string;
  note?: string;
  fileUrls?: string[];
}

export interface TransactionsLog {
  logs: string[];
}

export interface TransactionLogInfo {
  userId: string;
  status: string;
  createdAt: number;
}

export interface TransactionIdInfo {
  type: string;
  date: string;
  id: string;
}

export interface ListTransactionRequest {
  type: string;
  date: string;
  user: string;
}
