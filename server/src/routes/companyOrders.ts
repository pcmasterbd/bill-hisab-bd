import express, { type Request, type Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET all company orders
router.get('/', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    try {
        const orders = await prisma.companyOrder.findMany({
            include: {
                supplier: true,
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch company orders' });
    }
});

// CREATE a company order
router.post('/', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    const { supplierId, totalAmount, status, note, items } = req.body;

    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Supplier ID and at least one item are required' });
    }

    try {
        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.companyOrder.create({
                data: {
                    supplierId,
                    totalAmount: parseFloat(String(totalAmount)),
                    status: status || 'DRAFT',
                    note: note || null,
                }
            });

            for (const item of items) {
                await tx.companyOrderItem.create({
                    data: {
                        orderId: newOrder.id,
                        productId: item.productId,
                        quantity: parseInt(String(item.quantity)),
                        costPrice: parseFloat(String(item.costPrice))
                    }
                });

                // If status is COMPLETED, we should increase the stock
                if (status === 'COMPLETED') {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                increment: parseInt(String(item.quantity))
                            }
                        }
                    });
                }
            }

            return newOrder;
        });

        res.status(201).json(order);
    } catch (error) {
        console.error("Company Order creation error:", error);
        res.status(500).json({ error: 'Failed to create company order' });
    }
});

// UPDATE order status
router.patch('/:id/status', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const order = await prisma.$transaction(async (tx) => {
            const currentOrder = await tx.companyOrder.findUnique({
                where: { id: id as string },
                include: { items: true }
            }) as any;

            if (!currentOrder) throw new Error('Order not found');

            const updatedOrder = await tx.companyOrder.update({
                where: { id: id as string },
                data: { status: status as any }
            });

            // If status changed to COMPLETED, increase stock
            if (status === 'COMPLETED' && currentOrder.status !== 'COMPLETED') {
                for (const item of currentOrder.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                increment: item.quantity
                            }
                        }
                    });
                }
            }

            return updatedOrder;
        });

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// DELETE a company order
router.delete('/:id', authorizeRole(['ADMIN']), async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.$transaction(async (tx) => {
            await tx.companyOrderItem.deleteMany({ where: { orderId: id as string } });
            await tx.companyOrder.delete({ where: { id: id as string } });
        });
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

export default router;
