import express, { type Request, type Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET all suppliers
router.get('/', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    try {
        const suppliers = await prisma.supplier.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
});

// CREATE a supplier
router.post('/', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    const { name, contactPerson, phone, email, address } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ error: 'Name and phone are required' });
    }

    try {
        const supplier = await prisma.supplier.create({
            data: { name, contactPerson, phone, email, address }
        });
        res.status(201).json(supplier);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'A supplier with this phone already exists' });
        }
        res.status(500).json({ error: 'Failed to create supplier' });
    }
});

// UPDATE a supplier
router.put('/:id', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, contactPerson, phone, email, address } = req.body;

    try {
        const supplier = await prisma.supplier.update({
            where: { id: id as string },
            data: { name, contactPerson, phone, email, address }
        });
        res.json(supplier);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update supplier' });
    }
});

// DELETE a supplier
router.delete('/:id', authorizeRole(['ADMIN']), async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.supplier.delete({ where: { id: id as string } });
        res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete supplier' });
    }
});

export default router;
