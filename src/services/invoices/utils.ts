import { ListInvoicesRequest } from 'src/types/invoice';

export const normalizePagination = (
  req: ListInvoicesRequest,
): ListInvoicesRequest => {
  const limit = 20;
  if (req.page < 0) {
    req.page = 0;
  }
  req.offset = req.page * limit;
  req.limit = limit;

  return req;
};
