import express, { Express } from 'express';

import {
  createInvoiceHandler,
  deleteInvoiceHandler,
  getInvoiceHandler,
  listInvoicesHandler,
  updateInvoiceHandler,
  payInvoiceHandler,
} from './handlers';
import { authorizationMiddelware } from 'src/middleware/auth';
import { validatorMiddelware } from 'src/middleware/validator';

import {
  createInvoiceValidation,
  listInvoicesValidation,
  updateInvoiceValidation,
  deleteInvoiceValidation,
  getInvoiceValidation,
  payInvoiceValidation,
} from './validations';
import { isAccountActiveMiddelware } from 'src/middleware/isAccountActive';
import { isBusinessMiddelware } from 'src/middleware/isBusiness';

export const initInvoiceRoutes = (app: Express) => {
  const baseRouter = express.Router();
  baseRouter.use(authorizationMiddelware);
  baseRouter.use(isAccountActiveMiddelware);

  /**
   * @summary Create invoice. Only business
   */
  baseRouter.post(
    '/',
    isBusinessMiddelware,
    ...createInvoiceValidation(),
    validatorMiddelware,
    createInvoiceHandler,
  );

  /**
   * @summary Get an invoice. Business and User
   */
  baseRouter.get(
    '/:invoiceId',
    ...getInvoiceValidation(),
    validatorMiddelware,
    getInvoiceHandler,
  );

  /**
   * @summary Update an invoice. Only Business
   */
  baseRouter.put(
    '/:invoiceId',
    isBusinessMiddelware,
    ...updateInvoiceValidation(),
    validatorMiddelware,
    updateInvoiceHandler,
  );

  /**
   * @summary List created or paied invoices. Business and User
   */
  baseRouter.get(
    '/',
    ...listInvoicesValidation(),
    validatorMiddelware,
    listInvoicesHandler,
  );

  /**
   * @summary Delete an invoice. Only Business
   */
  baseRouter.delete(
    '/:invoiceId',
    isBusinessMiddelware,
    ...deleteInvoiceValidation(),
    validatorMiddelware,
    deleteInvoiceHandler,
  );

  /**
   * @summary Update an invoice. Only Business
   */
  baseRouter.post(
    '/pay-invoice/:invoiceId',
    ...payInvoiceValidation(),
    validatorMiddelware,
    payInvoiceHandler,
  );

  // Setup App
  app.use('/invoices', baseRouter);
};
