export const ERROR_INVOICE_NOT_EXIST = 'The invoice does not exists';
export const ERROR_INVOICE_CAN_NOT_UPDATE = 'Can not update the invoice';
export const ERROR_INVOICE_CAN_NOT_DELETE = 'Can not delete the invoice';
export const ERROR_INVOICE_INVALID_STATUS = 'Invalid invoice status';
export const ERROR_INVOICE_UNAUTH_PAY = 'Unauth to pay the invoice';
export const ERROR_INVOICE_ALREADY_PAIED = 'The invoice was already paied';

export const errorToStatus = (err: string) => {
  switch (err) {
    case ERROR_INVOICE_ALREADY_PAIED:
    case ERROR_INVOICE_CAN_NOT_UPDATE:
    case ERROR_INVOICE_CAN_NOT_DELETE:
    case ERROR_INVOICE_INVALID_STATUS:
      return { status: 400, error: err };
    case ERROR_INVOICE_UNAUTH_PAY:
      return { status: 401, error: err };
    case ERROR_INVOICE_NOT_EXIST:
      return { status: 404, error: err };
    default:
      return { status: 500, error: 'Internal error server' };
  }
};

export const errorHandler = (err: string) => errorToStatus(err);
