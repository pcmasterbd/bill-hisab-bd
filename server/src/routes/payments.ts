import express, { type Request, type Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET all payment history
router.get('/', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    try {
        const payments = await prisma.payment.findMany({
            include: {
                order: true,
                customer: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch payment history' });
    }
});

// POST new payment
router.post('/', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    const { orderId, customerId, amount, method, type, transactionId, note } = req.body;

    if (!amount || !method) {
        return res.status(400).json({ error: 'Amount and method are required' });
    }

    try {
        const payment = await prisma.$transaction(async (tx) => {
            const newPayment = await tx.payment.create({
                data: {
                    orderId: orderId || null,
                    customerId: customerId || null,
                    amount: parseFloat(String(amount)),
                    method,
                    type: type || 'INCOME',
                    transactionId: transactionId || null,
                    note: note || ''
                }
            });

            // If linked to an order, update the order's paidAmount
            if (orderId && (type === 'INCOME' || !type)) {
                await tx.order.update({
                    where: { id: orderId },
                    data: {
                        paidAmount: {
                            increment: parseFloat(String(amount))
                        }
                    }
                });
            }

            return newPayment;
        });

        res.status(201).json(payment);
    } catch (error) {
        console.error('Payment creation error:', error);
        res.status(500).json({ error: 'Failed to record payment' });
    }
});

// DELETE a payment record
router.delete('/:id', authorizeRole(['ADMIN']), async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.$transaction(async (tx) => {
            const payment = await tx.payment.findUnique({ where: { id } });
            if (!payment) throw new Error('Payment not found');

            // If it was linked to an order, decrement the order's paidAmount
            if (payment.orderId && (payment.type === 'INCOME')) {
                await tx.order.update({
                    where: { id: payment.orderId },
                    data: {
                        paidAmount: {
                            decrement: payment.amount
                        }
                    }
                });
            }

            await tx.payment.delete({ where: { id } });
        });

        res.json({ message: 'Payment record deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to delete payment record' });
    }
});

export default router;
