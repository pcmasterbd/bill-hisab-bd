import express, { type Request, type Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET all courier configurations
router.get('/', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    try {
        const couriers = await prisma.courierConfig.findMany();

        // If no couriers exist, initialize default ones
        if (couriers.length === 0) {
            const defaults = [
                { name: 'Steadfast', isActive: false },
                { name: 'Pathao', isActive: false },
                { name: 'RedX', isActive: false },
                { name: 'Paperfly', isActive: false },
            ];

            await prisma.courierConfig.createMany({
                data: defaults,
            });

            const newCouriers = await prisma.courierConfig.findMany();
            return res.json(newCouriers);
        }

        res.json(couriers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch courier configurations' });
    }
});

// UPDATE a courier configuration (Setup/Toggle)
router.put('/:id', authorizeRole(['ADMIN', 'MODERATOR']), async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive, apiKey, apiSecret, apiBaseUrl, senderId } = req.body;

    try {
        const updateData: any = {};
        if (isActive !== undefined) updateData.isActive = Boolean(isActive);
        if (apiKey !== undefined) updateData.apiKey = String(apiKey);
        if (apiSecret !== undefined) updateData.apiSecret = String(apiSecret);
        if (apiBaseUrl !== undefined) updateData.apiBaseUrl = String(apiBaseUrl);
        if (senderId !== undefined) updateData.senderId = String(senderId);

        const courier = await prisma.courierConfig.update({
            where: { id: String(id) },
            data: updateData
        });
        res.json(courier);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update courier configuration' });
    }
});

export default router;
