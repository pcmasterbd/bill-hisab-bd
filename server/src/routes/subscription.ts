import express, { type Request, type Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// GET current user's subscription status
router.get('/status', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                subscriptionStatus: true,
                subscriptionExpiresAt: true,
                trialExpiresAt: true,
                createdAt: true,
            }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        // Check if expired
        const now = new Date();
        let status = user.subscriptionStatus;

        if (status === 'TRIAL' && user.trialExpiresAt && user.trialExpiresAt < now) {
            status = 'EXPIRED';
        } else if (status === 'ACTIVE' && user.subscriptionExpiresAt && user.subscriptionExpiresAt < now) {
            status = 'EXPIRED';
        }

        res.json({ ...user, status });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch status' });
    }
});

// ADMIN: Update user subscription (Renew/Extend)
router.put('/update/:userId', authorizeRole(['ADMIN']), async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { status, expiresAt } = req.body;

    try {
        const user = await prisma.user.update({
            where: { id: userId as string },
            data: {
                subscriptionStatus: status as any,
                subscriptionExpiresAt: expiresAt ? new Date(expiresAt) : null,
            } as any,
            select: {
                id: true,
                email: true,
                subscriptionStatus: true,
                subscriptionExpiresAt: true,
            }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update subscription' });
    }
});

export default router;
