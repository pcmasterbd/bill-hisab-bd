import express, { type Request, type Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole(['ADMIN']));

// GET all permissions
router.get('/', async (req: Request, res: Response) => {
    try {
        let permissions = await prisma.permission.findMany();

        // Seed default permissions if empty
        if (permissions.length === 0) {
            await prisma.permission.createMany({
                data: [
                    { module: 'Users', action: 'Create Users', description: 'Ability to add new system users', admin: true, moderator: true, user: false },
                    { module: 'Users', action: 'Delete Users', description: 'Ability to remove users', admin: true, moderator: false, user: false },
                    { module: 'Products', action: 'Add Product', admin: true, moderator: true, user: true },
                    { module: 'Finance', action: 'View Reports', admin: true, moderator: false, user: false },
                ]
            });
            permissions = await prisma.permission.findMany();
        }

        res.json(permissions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch permissions' });
    }
});

// UPDATE a permission toggle
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { admin, moderator, user } = req.body;

    try {
        const permission = await prisma.permission.update({
            where: { id: id as string },
            data: {
                admin: admin === true,
                moderator: moderator === true,
                user: user === true
            } as any
        });
        res.json(permission);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update permission' });
    }
});

export default router;
