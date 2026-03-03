import express, { type Request, type Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Record a production entry (Convert raw materials to finished product)
router.post('/', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    const { productId, quantity, components } = req.body;

    if (!productId || !quantity || !components || !Array.isArray(components)) {
        return res.status(400).json({ error: 'Product ID, quantity, and components are required' });
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Increase finished product stock
            await tx.product.update({
                where: { id: String(productId) },
                data: {
                    stock: {
                        increment: parseInt(String(quantity))
                    }
                }
            });

            // Decrease raw material stocks
            for (const component of components) {
                await tx.product.update({
                    where: { id: String(component.productId) },
                    data: {
                        stock: {
                            decrement: parseInt(String(component.quantity))
                        }
                    }
                });
            }
        });

        res.status(201).json({ message: 'Production recorded successfully' });
    } catch (error) {
        console.error('Production error:', error);
        res.status(500).json({ error: 'Failed to record production' });
    }
});

export default router;
