import express, { type Request, type Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET all products (Accessible by ADMIN, MODERATOR, USER)
router.get('/', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// CREATE a product
router.post('/', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    const { name, description, price, wholesalePrice, stock, category, isRawMaterial } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({ error: 'Name and price are required' });
    }

    try {
        const product = await prisma.product.create({
            data: {
                name: String(name),
                description: description ? String(description) : null,
                price: parseFloat(String(price)),
                wholesalePrice: wholesalePrice !== undefined ? parseFloat(String(wholesalePrice)) : 0,
                stock: stock !== undefined ? parseInt(String(stock)) : 0,
                category: category ? String(category) : null,
                isRawMaterial: Boolean(isRawMaterial)
            }
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// UPDATE a product
router.put('/:id', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, price, wholesalePrice, stock, category, isRawMaterial } = req.body;

    try {
        const updateData: any = {};
        if (typeof name === 'string') updateData.name = name;
        if (typeof description === 'string') updateData.description = description;
        if (price !== undefined) updateData.price = parseFloat(String(price));
        if (wholesalePrice !== undefined) updateData.wholesalePrice = parseFloat(String(wholesalePrice));
        if (stock !== undefined) updateData.stock = parseInt(String(stock));
        if (typeof category === 'string') updateData.category = category;
        if (isRawMaterial !== undefined) updateData.isRawMaterial = Boolean(isRawMaterial);

        const product = await prisma.product.update({
            where: { id: String(id) },
            data: updateData
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// DELETE a product
router.delete('/:id', authorizeRole(['ADMIN', 'MODERATOR', 'USER']), async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.product.delete({ where: { id: String(id) } });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

export default router;
