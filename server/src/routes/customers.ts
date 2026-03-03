import express, { type Request, type Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET all customers (Accessible by all authenticated users to search customers)
router.get('/', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    try {
        const customers = await prisma.customer.findMany();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// CREATE a customer (Accessible by all authenticated users when billing)
router.post('/', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    const { name, phone, district, thana, address } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ error: 'Name and phone are required' });
    }

    try {
        const customer = await prisma.customer.create({
            data: {
                name: String(name),
                phone: String(phone),
                district: district ? String(district) : null,
                thana: thana ? String(thana) : null,
                address: address ? String(address) : null
            }
        });
        res.status(201).json(customer);
    } catch (error) {
        if ((error as any).code === 'P2002') {
            return res.status(400).json({ error: 'Phone number already exists' });
        }
        res.status(500).json({ error: 'Failed to create customer' });
    }
});

// UPDATE a customer (Accessible by ADMIN and MODERATOR)
router.put('/:id', authorizeRole(['ADMIN', 'MODERATOR']), async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, phone, district, thana, address } = req.body;

    try {
        const updateData: any = {};
        if (typeof name === 'string') updateData.name = name;
        if (typeof phone === 'string') updateData.phone = phone;
        if (typeof district === 'string') updateData.district = district;
        if (typeof thana === 'string') updateData.thana = thana;
        if (typeof address === 'string') updateData.address = address;

        const customer = await prisma.customer.update({
            where: { id: String(id) },
            data: updateData
        });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update customer' });
    }
});

// DELETE a customer (ADMIN only)
router.delete('/:id', authorizeRole(['ADMIN']), async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.customer.delete({ where: { id: String(id) } });
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete customer' });
    }
});

export default router;
