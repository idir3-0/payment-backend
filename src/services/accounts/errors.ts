export const ERROR_ACCOUNT_ALREADY_SETUP = 'The account was already setup';
export const ERROR_ACCOUNT_NOT_EXIST = 'The account does not exists';
export const ERROR_INVALID_USER_DATA = 'Invalid user data';

export const errorToStatus = (err: string) => {
  switch (err) {
    case ERROR_ACCOUNT_ALREADY_SETUP:
    case ERROR_INVALID_USER_DATA:
      return { status: 400, error: err };
    case ERROR_ACCOUNT_NOT_EXIST:
      return { status: 404, error: err };
    default:
      console.log(err);
      return { status: 500, error: 'Internal error server' };
  }
};

export const errorHandler = (err: string) => errorToStatus(err);
