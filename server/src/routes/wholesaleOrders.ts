import express, { type Request, type Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET all wholesale orders (not deleted)
router.get('/', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                orderType: 'WHOLESALE',
                isDeleted: false
            },
            include: {
                customer: true,
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
        res.status(500).json({ error: 'Failed to fetch wholesale orders' });
    }
});

// GET trash orders
router.get('/trash', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                orderType: 'WHOLESALE',
                isDeleted: true
            },
            include: {
                customer: true,
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch trash orders' });
    }
});

// CREATE a wholesale order
router.post('/', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    const { customerId, totalAmount, discount, laborCost, paidAmount, payableAmount, status, note, items } = req.body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Customer ID and at least one item are required' });
    }

    try {
        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    customerId: String(customerId),
                    totalAmount: parseFloat(String(totalAmount)),
                    discount: discount ? parseFloat(String(discount)) : 0,
                    laborCost: laborCost ? parseFloat(String(laborCost)) : 0,
                    paidAmount: paidAmount ? parseFloat(String(paidAmount)) : 0,
                    payableAmount: parseFloat(String(payableAmount)),
                    status: status || 'PENDING',
                    orderType: 'WHOLESALE',
                    note: note ? String(note) : null,
                }
            });

            for (const item of items) {
                await tx.orderItem.create({
                    data: {
                        orderId: newOrder.id,
                        productId: String(item.productId),
                        quantity: parseInt(String(item.quantity)),
                        price: parseFloat(String(item.price))
                    }
                });

                // Update stock
                await tx.product.update({
                    where: { id: String(item.productId) },
                    data: {
                        stock: {
                            decrement: parseInt(String(item.quantity))
                        }
                    }
                });
            }

            return newOrder;
        });

        res.status(201).json(order);
    } catch (error) {
        console.error("Wholesale order creation error:", error);
        res.status(500).json({ error: 'Failed to create wholesale order' });
    }
});

// SOFT DELETE an order (move to trash)
router.delete('/:id', authorizeRole(['ADMIN', 'MODERATOR']), async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.order.update({
            where: { id: String(id) },
            data: { isDeleted: true }
        });
        res.json({ message: 'Order moved to trash' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to move order to trash' });
    }
});

// RESTORE an order from trash
router.patch('/:id/restore', authorizeRole(['ADMIN', 'MODERATOR']), async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.order.update({
            where: { id: String(id) },
            data: { isDeleted: false }
        });
        res.json({ message: 'Order restored successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to restore order' });
    }
});

// PERMANENT DELETE an order
router.delete('/:id/permanent', authorizeRole(['ADMIN']), async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.orderItem.deleteMany({ where: { orderId: String(id) } });
        await prisma.order.delete({ where: { id: String(id) } });
        res.json({ message: 'Order permanently deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to permanently delete order' });
    }
});

// UPDATE order status
router.patch('/:id/status', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const order = await prisma.order.update({
            where: { id: String(id) },
            data: { status: status as any }
        });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

export default router;
