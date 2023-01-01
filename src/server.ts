import 'module-alias/register';
import express from 'express';

import config from 'src/configs';
import accountRoutes from './services/accounts/routes';
import invoiceRoutes from './services/invoices/routes';
import { adminRouter, userRouter } from './services/transactions/routes';
import { initFirebase } from './adapters/firebase/firebase';

const app = express();
app.use(express.json()); // for parsing application/json

const port = config.server.appPort;

initFirebase();

app.use('/accounts', accountRoutes);
app.use('/invoices', invoiceRoutes);
app.use('/transactions', adminRouter);
app.use('/transactions', userRouter);
app.all('*', (req, res) => {
  res.status(404).json({ status: false, error: 'not found' });
});

app.listen(port, () => {
  console.log(`Server running on: http://0.0.0.0:${port}`);
});
