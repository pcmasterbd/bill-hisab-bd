import express, { type Request, type Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.use(authenticateToken);

router.post('/chat', async (req: Request, res: Response) => {
    const { message, history } = req.body;

    console.log('AI Chat request received');
    if (!process.env.GEMINI_API_KEY) {
        console.error('Missing GEMINI_API_KEY in process.env');
        return res.status(500).json({ error: 'Gemini API Key is not configured in the server environment.' });
    }

    try {
        console.log('Aggregating business context...');
        // 1. Aggregate Business Context
        const [orders, products, payments, customers] = await Promise.all([
            prisma.order.findMany({ where: { isDeleted: false }, take: 50, orderBy: { createdAt: 'desc' }, include: { items: true } }),
            prisma.product.findMany({ take: 100 }),
            (prisma as any).payment.findMany({ take: 50, orderBy: { createdAt: 'desc' } }),
            prisma.customer.findMany({ take: 50 })
        ]);

        const context = {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum: number, o: any) => sum + o.payableAmount, 0),
            inventory: products.map((p: any) => ({ name: p.name, stock: p.stock, price: p.price })),
            recentTransactions: payments.map((p: any) => ({ amount: p.amount, method: p.method, type: p.type })),
            customerCount: customers.length,
            lowStockProducts: products.filter((p: any) => p.stock < 10).map((p: any) => p.name)
        };
        console.log('Context aggregated successfully');

        // 2. Prepare AI Prompt with Fallback Models
        const candidateModels = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-pro", "gemini-1.5-pro"];
        let responseText = '';
        let lastError = '';

        for (const modelName of candidateModels) {
            try {
                console.log(`Trying Gemini model: ${modelName}...`);
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: `You are an expert Business AI Assistant for a retail/wholesale platform called "Bill Hisab BD". 
                    Your goal is to analyze the user's business data and provide helpful, concise, and actionable insights.
                    
                    Current Business Context:
                    ${JSON.stringify(context, null, 2)}
                    
                    When replying:
                    - Be professional but friendly.
                    - If the user asks about sales, stock, or growth, use the provided data.
                    - Suggest ways to improve business based on trends.
                    - Keep responses concise and focused on the data.`
                });

                const chat = model.startChat({
                    history: history || [],
                    generationConfig: { maxOutputTokens: 800 },
                });

                const result = await chat.sendMessage(message);
                responseText = result.response.text();
                console.log(`Success with model: ${modelName}`);
                break; // Exit loop on success
            } catch (err: any) {
                console.warn(`Model ${modelName} failed:`, err.message);
                lastError = err.message;
            }
        }

        if (!responseText) {
            throw new Error(`All Gemini models failed. Last error: ${lastError}`);
        }

        res.json({ reply: responseText });
    } catch (error: any) {
        console.error('Detailed AI Chat Error:', error);
        res.status(500).json({ error: `AI Assistant Error: ${error.message || 'Unknown error'}` });
    }
});

export default router;
