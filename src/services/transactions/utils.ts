import { TransactionIdInfo } from 'src/types/transactions';

export const parseTransactionId = (id: string): TransactionIdInfo => {
  const infos = id.split('_');
  return {
    type: infos[0],
    date: infos[1],
    id: infos[2],
  };
};
