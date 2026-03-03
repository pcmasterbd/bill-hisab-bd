import './env.js';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { prisma } from './db.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

import authRouter from './routes/auth.js';
import userRouter from './routes/users.js';
import subscriptionRouter from './routes/subscription.js';
import permissionsRouter from './routes/permissions.js';
import productRouter from './routes/products.js';
import customerRouter from './routes/customers.js';
import orderRouter from './routes/orders.js';
import supplierRouter from './routes/suppliers.js';
import companyOrderRouter from './routes/companyOrders.js';
import wholesaleOrderRouter from './routes/wholesaleOrders.js';
import courierRouter from './routes/couriers.js';
import webhookRouter from './routes/webhooks.js';
import reportRouter from './routes/reports.js';
import paymentRouter from './routes/payments.js';
import aiRouter from './routes/ai.js';
import productionRouter from './routes/production.js';

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/subscription', subscriptionRouter);
app.use('/api/permissions', permissionsRouter);
app.use('/api/products', productRouter);
app.use('/api/customers', customerRouter);
app.use('/api/orders', orderRouter);
app.use('/api/suppliers', supplierRouter);
app.use('/api/company-orders', companyOrderRouter);
app.use('/api/wholesale-orders', wholesaleOrderRouter);
app.use('/api/couriers', courierRouter);
app.use('/api/webhooks', webhookRouter);
app.use('/api/reports', reportRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/ai', aiRouter);
app.use('/api/production', productionRouter);
console.log('Routers mounted');

// Heartbeat route
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    // Ping the database
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check database error:', error);
    res.status(500).json({
      status: 'Error',
      database: 'Disconnected',
      error: String(error),
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
