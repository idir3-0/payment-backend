import 'module-alias/register';
import express from 'express';

import config from 'src/configs';
import { accountRouter, testAccountRouter } from './services/accounts/routes';
import invoiceRoutes from './services/invoices/routes';
import { userRouter } from './services/transactions/routes';
import { notificationRouter } from './services/notifications/routes';
import { initFirebase } from './adapters/firebase/firebase';

const app = express();
app.use(express.json()); // for parsing application/json

const port = config.server.appPort;

initFirebase();

testAccountRouter;
app.use('/test-accounts', testAccountRouter);
app.use('/accounts', accountRouter);
app.use('/invoices', invoiceRoutes);
app.use('/transactions', userRouter);
app.use('/notifications', notificationRouter);

app.all('*', (req, res) => {
  res.status(404).json({ status: false, error: '404 not found' });
});

app.listen(port, () => {
  console.log(`Server running on: http://0.0.0.0:${port}`);
});
