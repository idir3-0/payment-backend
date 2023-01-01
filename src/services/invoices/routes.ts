import express from 'express';

import {
  createInvoiceHandler,
  deleteInvoiceHandler,
  listInvoicesHandler,
  getInvoiceHandler,
  updateInvoiceHandler,
  payInvoiceHandler,
  getPayInvoiceHandler,
} from './handlers';
import { authorizationMiddelware } from 'src/middleware/auth';
import { validatorMiddelware } from 'src/middleware/validator';

import {
  createInvoiceValidation,
  listInvoicesValidation,
  updateInvoiceValidation,
  deleteInvoiceValidation,
  getInvoiceValidation,
  getPayInvoiceValidation,
  payInvoiceValidation,
} from './validations';
const router = express.Router();
router.use(authorizationMiddelware);

router.post(
  '/',
  ...createInvoiceValidation(),
  validatorMiddelware,
  createInvoiceHandler,
);

router.get(
  '/:id',
  ...getInvoiceValidation(),
  validatorMiddelware,
  getInvoiceHandler,
);

router.get(
  '/',
  ...listInvoicesValidation(),
  validatorMiddelware,
  listInvoicesHandler,
);

router.put(
  '/:id',
  ...updateInvoiceValidation(),
  validatorMiddelware,
  updateInvoiceHandler,
);

router.delete(
  '/:id',
  ...deleteInvoiceValidation(),
  validatorMiddelware,
  deleteInvoiceHandler,
);

router.get(
  '/pay-invoice/:uid/:id',
  ...getPayInvoiceValidation(),
  validatorMiddelware,
  getPayInvoiceHandler,
);

router.post(
  '/pay-invoice/:uid/:id',
  ...payInvoiceValidation(),
  validatorMiddelware,
  payInvoiceHandler,
);

export default router;
