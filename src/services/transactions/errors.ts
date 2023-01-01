export const ERROR_TRANSACTION_NOT_EXIST = 'The transaction does not exists';
export const ERROR_TRANSACTION_CAN_NOT_UPDATE =
  'Can not update the transaction';
export const ERROR_TRANSACTION_CAN_NOT_DELETE =
  'Can not delete the transaction';
export const ERROR_TRANSACTION_INVALID_STATUS = 'Invalid transaction status';
export const ERROR_TRANSACTION_PROCESSED = 'The transaction was processed';

export const errorToStatus = (err: string) => {
  switch (err) {
    case ERROR_TRANSACTION_CAN_NOT_UPDATE:
    case ERROR_TRANSACTION_CAN_NOT_DELETE:
    case ERROR_TRANSACTION_INVALID_STATUS:
    case ERROR_TRANSACTION_PROCESSED:
      return { status: 400, error: err };
    case ERROR_TRANSACTION_NOT_EXIST:
      return { status: 404, error: err };
    default:
      return { status: 500, error: 'Internal error server' };
  }
};

export const errorHandler = (err: string) => errorToStatus(err);
