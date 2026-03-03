import express, { type Request, type Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET all active orders (REGULAR type only)
router.get('/', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                orderType: 'REGULAR',
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
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// GET trashed orders (REGULAR type only)
router.get('/trash', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                orderType: 'REGULAR',
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
        res.status(500).json({ error: 'Failed to fetch trashed orders' });
    }
});

// CREATE an order (Accessible by all authenticated users)
router.post('/', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    const { customerId, totalAmount, discount, advance, payableAmount, status, note, items } = req.body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Customer ID and at least one item are required' });
    }

    try {
        // Use a transaction to ensure both order and items are created together
        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    customerId: String(customerId),
                    totalAmount: parseFloat(String(totalAmount)),
                    discount: discount ? parseFloat(String(discount)) : 0,
                    advance: advance ? parseFloat(String(advance)) : 0,
                    payableAmount: parseFloat(String(payableAmount)),
                    status: status || 'PENDING',
                    note: note ? String(note) : null,
                }
            });

            // Create order items and update product stock
            for (const item of items) {
                await tx.orderItem.create({
                    data: {
                        orderId: newOrder.id,
                        productId: String(item.productId),
                        quantity: parseInt(String(item.quantity)),
                        price: parseFloat(String(item.price))
                    }
                });

                // Optional: Update stock (decrease by quantity)
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
        console.error("Order creation error:", error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// UPDATE order status (Accessible by all authenticated users)
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

// SOFT DELETE an order (Accessible by ADMIN and MODERATOR)
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

// RESTORE an order (Accessible by ADMIN and MODERATOR)
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

// PERMANENT DELETE an order (ADMIN only)
router.delete('/:id/permanent', authorizeRole(['ADMIN']), async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // First delete items related to the order (Cascade is not configured in schema maybe)
        await prisma.orderItem.deleteMany({ where: { orderId: String(id) } });
        await prisma.order.delete({ where: { id: String(id) } });
        res.json({ message: 'Order permanently deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to permanently delete order' });
    }
});

export default router;
