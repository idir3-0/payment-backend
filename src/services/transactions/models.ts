export type Bank = 'CCP';
export type TransactionType = 'deposit' | 'withdraw';

export type TransactionAction = 'create' | 'update';

export const TransactionTypeMap: {
  deposit: TransactionType;
  withdraw: TransactionType;
} = {
  deposit: 'deposit',
  withdraw: 'withdraw',
};

export type TransactionStatusType =
  | 'requested'
  | 'processing'
  | 'rejected'
  | 'refunded'
  | 'accepted'
  | 'funded';

export const Banks = ['ccp'];

export interface TransactionStatus {
  requested: TransactionStatusType;
  processing: TransactionStatusType;
  rejected: TransactionStatusType;
  accepted: TransactionStatusType;
  funded: TransactionStatusType;
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

export interface DWTransaction extends BaseTransaction, BankInfos {
  logs: TransactionLog[];
}

export interface BaseTransaction {
  transactionId?: string;
  transactionType: string;
  createdBy: string;
  status: TransactionStatusType;
  createdAt: number;
}

export interface BankInfos {
  bank: Bank;
  amount: number;
}

export interface TransactionLog {
  status: TransactionStatusType;
  note?: string;
  fileURLs?: string[];
  createdBy: string;
  createdAt?: number;
}

export interface TransactionRequest extends BankInfos, TransactionLog {}

export interface TransactionMetadata {
  // transactionType: TransactionType;
  transactionId: string;
}
export interface UpdateTransactionRequest
  extends TransactionMetadata,
    TransactionLog {}

export interface AdminUpdateTransactionRequest
  extends UpdateTransactionRequest {
  status: TransactionStatusType;
}

export interface ListTransactionRequest {
  owner: string;
  limit?: number;
  transactionType?: TransactionType;
}
