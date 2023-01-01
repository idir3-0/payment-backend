import { ListTransactionRequest } from './models';

export const normalizePagination = (
  req: ListTransactionRequest,
): ListTransactionRequest => {
  req.limit = 10;
  return req;
};
