import express, { type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import { prisma } from '../db.js';
import { authenticateToken, authorizeRole, type AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Multer configuration for profile picture upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed (jpg, jpeg, png, webp)'));
    }
});

// Apply primary authentication to all user routes
router.use(authenticateToken);

// --- PROTECTED ROUTES (Available to LOGGED IN USERS for their own profile) ---

// GET current user profile
router.get('/me', async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                profilePicture: true,
                role: true,
                subscriptionStatus: true,
            }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// UPDATE current user profile
router.put('/profile', async (req: AuthRequest, res: Response) => {
    const { name, phone } = req.body;
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const user = await prisma.user.update({
            where: { id: req.user.userId },
            data: { name, phone },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                profilePicture: true,
            }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// CHANGE password
router.put('/change-password', async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: 'পাসওয়ার্ড সঠিক নয় (Incorrect current password)' });

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedNewPassword }
        });

        res.json({ message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে (Password changed successfully)' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// UPLOAD profile picture
router.post('/profile-picture', upload.single('profilePicture'), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        const user = await prisma.user.update({
            where: { id: req.user.userId },
            data: { profilePicture: imageUrl },
            select: { profilePicture: true }
        });

        res.json({ message: 'Profile picture updated', profilePicture: user.profilePicture });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload profile picture' });
    }
});

// --- ADMIN ONLY ROUTES ---

// GET all users
router.get('/', authorizeRole(['ADMIN']), async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                subscriptionStatus: true,
                subscriptionExpiresAt: true,
                trialExpiresAt: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// CREATE a user
router.post('/', authorizeRole(['ADMIN']), async (req: Request, res: Response) => {
    const { email, password, name, role, subscriptionStatus, subscriptionExpiresAt, trialExpiresAt } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role || 'USER',
                subscriptionStatus: subscriptionStatus || 'INACTIVE',
                subscriptionExpiresAt: subscriptionExpiresAt ? new Date(subscriptionExpiresAt) : null,
                trialExpiresAt: trialExpiresAt ? new Date(trialExpiresAt) : null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                subscriptionStatus: true,
                subscriptionExpiresAt: true,
                trialExpiresAt: true,
                createdAt: true,
            }
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// UPDATE a user (Admin point of view)
router.put('/:id', authorizeRole(['ADMIN']), async (req: Request, res: Response) => {
    const { id } = req.params;
    const { email, name, role, password, subscriptionStatus, subscriptionExpiresAt, trialExpiresAt } = req.body;

    try {
        const updateData: any = {};
        if (email) updateData.email = email;
        if (name) updateData.name = name;
        if (role) updateData.role = role;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        if (subscriptionStatus) updateData.subscriptionStatus = subscriptionStatus;
        if (subscriptionExpiresAt !== undefined) updateData.subscriptionExpiresAt = subscriptionExpiresAt ? new Date(subscriptionExpiresAt) : null;
        if (trialExpiresAt !== undefined) updateData.trialExpiresAt = trialExpiresAt ? new Date(trialExpiresAt) : null;

        const user = await prisma.user.update({
            where: { id: id as string },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                subscriptionStatus: true,
                subscriptionExpiresAt: true,
                trialExpiresAt: true,
                updatedAt: true,
            }
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// DELETE a user
router.delete('/:id', authorizeRole(['ADMIN']), async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // Prevent admin from deleting themselves (optional but safe)
        if (id === (req as any).user.userId) {
            return res.status(400).json({ error: 'You cannot delete your own admin account' });
        }

        await prisma.user.delete({ where: { id: id as string } });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

export default router;
