import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function migrate() {
    const client = createClient({
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
    });

    console.log('Creating Payment table on Turso...');

    try {
        await client.execute(`CREATE TABLE IF NOT EXISTS "Payment" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "orderId" TEXT,
            "customerId" TEXT,
            "amount" REAL NOT NULL,
            "method" TEXT NOT NULL,
            "type" TEXT NOT NULL DEFAULT 'INCOME',
            "transactionId" TEXT,
            "note" TEXT,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL,
            FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
            FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
        )`);
        console.log('✅ Payment table established');
    } catch (e: any) {
        console.error('❌ Error creating Payment table:', e.message);
    }

    await client.close();
}

migrate();
