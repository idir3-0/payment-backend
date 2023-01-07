import 'module-alias/register';
import express from 'express';

import config from 'src/configs';
import { initAccountRoutes } from './services/accounts/routes';
import { initTransactionRoutes } from './services/transactions/routes';
import { initInvoiceRoutes } from './services/invoices/routes';
import { initFirebase } from './adapters/firebase/firebase';
import { initNotificationRoutes } from './services/notifications/routes';
import morganMiddleware from './middleware/logger';

const app = express();
app.use(express.json()); // for parsing application/json
app.use(morganMiddleware);

const port = config.server.appPort;

initFirebase();
initAccountRoutes(app);
initTransactionRoutes(app);
initInvoiceRoutes(app);
initNotificationRoutes(app);

app.all('*', (req, res) => {
  res.status(404).json({ status: false, error: '404 not found' });
});

app.listen(port, () => {
  console.log(`Server running on: http://0.0.0.0:${port}`);
});
