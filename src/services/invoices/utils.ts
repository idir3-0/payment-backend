import { ListInvoicesRequest } from './models';

export const normalizePagination = (
  req: ListInvoicesRequest,
): ListInvoicesRequest => {
  req.limit = 20;

  return req;
};
