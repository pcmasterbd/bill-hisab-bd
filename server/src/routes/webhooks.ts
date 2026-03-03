import express, { type Request, type Response } from 'express';
import { prisma } from '../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to protect routes
const authenticate = (req: Request, res: Response, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Invalid token format' });

    try {
        const secret: string = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jwt.verify(token, secret) as any;
        (req as any).user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// GET all webhooks for the logged-in user
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const userRole = (req as any).user.role;

        // Admins can see all webhooks, others only their own
        const where = userRole === 'ADMIN' ? {} : { userId };

        const webhooks = await prisma.webhook.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(webhooks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching webhooks', error: String(error) });
    }
});

// POST create a new webhook
router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const { url, event, secret } = req.body;
        const userId = (req as any).user.id;

        if (!url || !event) {
            return res.status(400).json({ message: 'URL and Event are required' });
        }

        const webhook = await prisma.webhook.create({
            data: {
                url,
                event,
                secret,
                userId,
                isActive: true
            }
        });

        res.status(201).json(webhook);
    } catch (error) {
        res.status(500).json({ message: 'Error creating webhook', error: String(error) });
    }
});

// PUT update a webhook
router.put('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { url, event, isActive, secret } = req.body;
        const userId = (req as any).user.id;
        const userRole = (req as any).user.role;

        // Check ownership if not admin
        const existingWebhook = await prisma.webhook.findUnique({ where: { id: id as string } });
        if (!existingWebhook) return res.status(404).json({ message: 'Webhook not found' });
        if (userRole !== 'ADMIN' && existingWebhook.userId !== userId) {
            return res.status(403).json({ message: 'Permission denied' });
        }

        const updatedWebhook = await prisma.webhook.update({
            where: { id: id as string },
            data: {
                url,
                event,
                isActive,
                secret
            }
        });

        res.json(updatedWebhook);
    } catch (error) {
        res.status(500).json({ message: 'Error updating webhook', error: String(error) });
    }
});

// DELETE a webhook
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;
        const userRole = (req as any).user.role;

        const existingWebhook = await prisma.webhook.findUnique({ where: { id: id as string } });
        if (!existingWebhook) return res.status(404).json({ message: 'Webhook not found' });
        if (userRole !== 'ADMIN' && existingWebhook.userId !== userId) {
            return res.status(403).json({ message: 'Permission denied' });
        }

        await prisma.webhook.delete({ where: { id: id as string } });
        res.json({ message: 'Webhook deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting webhook', error: String(error) });
    }
});

export default router;
