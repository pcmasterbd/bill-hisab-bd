import express, { type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

const router = express.Router();
console.log('Auth router file executed');
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';

// Register User
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, password, name, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'একটি একই ইমেইল দিয়ে ইদমধ্যেই অ্যাকাউন্ট খোলা হয়েছে (Email already exists)' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 7-Day Trial Logic
        const trialDays = 7;
        const trialExpiresAt = new Date();
        trialExpiresAt.setDate(trialExpiresAt.getDate() + trialDays);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: (role === 'ADMIN' || role === 'MODERATOR' || role === 'USER') ? role : 'USER',
                subscriptionStatus: 'TRIAL',
                trialExpiresAt,
                trialUsed: true,
            },
        });

        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({ message: 'নিবন্ধন সফল হয়েছে (Registration successful)', user: userWithoutPassword });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'নিবন্ধন ব্যর্থ হয়েছে (Registration failed)' });
    }
});

// Login User
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'ইমেল এবং পাসওয়ার্ড প্রয়োজন (Email and password are required)' });
        }

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'ভুল ইমেল বা পাসওয়ার্ড (Invalid credentials)' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'ভুল ইমেল বা পাসওয়ার্ড (Invalid credentials)' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const { password: _, ...userWithoutPassword } = user;
        res.json({ message: 'লগইন সফল হয়েছে (Login successful)', user: userWithoutPassword, token });
    } catch (error: any) {
        console.error('CRITICAL LOGIN ERROR:', error);
        // If it's a Prisma error, we want to know
        const errorMessage = error.message || 'Login failed';
        res.status(500).json({
            error: 'লগইন ব্যর্থ হয়েছে (Login failed)',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
            code: error.code // Prisma error codes are useful
        });
    }
});

export default router;
