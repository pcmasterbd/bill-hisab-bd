import express, { type Request, type Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET dashboard statistics split by Retail and Wholesale
router.get('/dashboard-stats', async (req: Request, res: Response) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const [
            retailToday,
            wholesaleToday,
            retailMonth,
            wholesaleMonth,
            totalExpenses,
            retailPending,
            wholesalePending
        ] = await Promise.all([
            // Today's Orders & Revenue - Retail
            prisma.order.aggregate({
                where: { orderType: 'REGULAR', createdAt: { gte: todayStart }, isDeleted: false },
                _count: { id: true },
                _sum: { payableAmount: true }
            }),
            // Today's Orders & Revenue - Wholesale
            prisma.order.aggregate({
                where: { orderType: 'WHOLESALE', createdAt: { gte: todayStart }, isDeleted: false },
                _count: { id: true },
                _sum: { payableAmount: true }
            }),
            // Monthly Revenue - Retail
            prisma.order.aggregate({
                where: { orderType: 'REGULAR', createdAt: { gte: monthStart }, isDeleted: false },
                _sum: { payableAmount: true }
            }),
            // Monthly Revenue - Wholesale
            prisma.order.aggregate({
                where: { orderType: 'WHOLESALE', createdAt: { gte: monthStart }, isDeleted: false },
                _sum: { payableAmount: true }
            }),
            // Total Expenses
            prisma.payment.aggregate({
                where: { type: 'EXPENSE' },
                _sum: { amount: true }
            }),
            // Pending Retail
            prisma.order.aggregate({
                where: { orderType: 'REGULAR', status: 'PENDING', isDeleted: false },
                _sum: { payableAmount: true },
                _count: { id: true }
            }),
            // Pending Wholesale
            prisma.order.aggregate({
                where: { orderType: 'WHOLESALE', status: 'PENDING', isDeleted: false },
                _sum: { payableAmount: true },
                _count: { id: true }
            })
        ]);

        res.json({
            today: {
                retail: { orders: retailToday._count.id, revenue: retailToday._sum.payableAmount || 0 },
                wholesale: { orders: wholesaleToday._count.id, revenue: wholesaleToday._sum.payableAmount || 0 }
            },
            monthly: {
                retailRevenue: retailMonth._sum.payableAmount || 0,
                wholesaleRevenue: wholesaleMonth._sum.payableAmount || 0
            },
            pending: {
                retail: { count: retailPending._count.id, amount: retailPending._sum.payableAmount || 0 },
                wholesale: { count: wholesalePending._count.id, amount: wholesalePending._sum.payableAmount || 0 }
            },
            totalExpenses: totalExpenses._sum.amount || 0
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

// GET all saved reports
router.get('/', async (req: Request, res: Response) => {
    try {
        const reports = await prisma.report.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// POST generate and save a report
router.post('/', authorizeRole(['ADMIN', 'MODERATOR']), async (req: Request, res: Response) => {
    const { title, type, periodStart, periodEnd } = req.body;

    if (!title || !type || !periodStart || !periodEnd) {
        return res.status(400).json({ error: 'Missing required report fields' });
    }

    try {
        // Simple mock analytical data for now - could be replaced with real calculations
        // based on periodStart and periodEnd
        const mockData = {
            totalRevenue: Math.floor(Math.random() * 500000),
            totalOrders: Math.floor(Math.random() * 500),
            avgOrderValue: Math.floor(Math.random() * 2000),
        };

        const report = await prisma.report.create({
            data: {
                title,
                type,
                periodStart: new Date(periodStart),
                periodEnd: new Date(periodEnd),
                data: JSON.stringify(mockData)
            }
        });

        res.status(201).json(report);
    } catch (error) {
        console.error('Report creation error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// DELETE a report
router.delete('/:id', authorizeRole(['ADMIN']), async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.report.delete({ where: { id: id as string } });
        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete report' });
    }
});

export default router;
