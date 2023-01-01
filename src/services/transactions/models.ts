export type Bank = 'CCP';
export type TransactionType = 'deposit' | 'withdraw';

export type TransactionStatusType =
  | 'requested'
  | 'processing'
  | 'rejected'
  | 'refunded'
  | 'accepted'
  | 'funded';

export const Banks = ['ccp'];

export interface TransactionStatus {
  requested: string;
  processing: string;
  rejected: string;
  accepted: string;
  funded: string;
}

export const TransactionStatusMap: TransactionStatus = {
  requested: 'requested',
  processing: 'processing',
  rejected: 'rejected',
  accepted: 'accepted',
  funded: 'funded',
};

export interface TransactionStateMapInterface {
  requested: string[];
  processing: string[];
  rejected: string[];
  accepted: string[];
  funded: string[];
}

export const TransactionStateMap: TransactionStateMapInterface = {
  requested: ['processing'],
  processing: ['rejected', 'accepted'],
  rejected: ['processing'],
  accepted: ['funded'],
  funded: [],
};

export interface TransactionInfo {
  bank: Bank;
  amount: number;
  userId: string;
  logs: TransactionLog[];
}

export interface TransactionRequest {
  bank: Bank;
  amount: number;
  note?: string;
  fileURLs?: string[];
}

export interface TransactionLog {
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
  uid: string;
  status: TransactionStatusType;
  note?: string;
  fileUrls?: string[];
}

export interface TransactionIdInfo {
  type: TransactionType;
  id: string;
}

export interface ListTransactionRequest {
  transactionType: TransactionType;
  startAfter: string;
  limit?: number;
}
