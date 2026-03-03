import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function apply() {
    const client = createClient({
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
    });

    console.log('Updating Order table for Wholesale features on Turso...');

    const commands = [
        `ALTER TABLE "Order" ADD COLUMN "orderType" TEXT DEFAULT 'REGULAR'`,
        `ALTER TABLE "Order" ADD COLUMN "laborCost" REAL DEFAULT 0`,
        `ALTER TABLE "Order" ADD COLUMN "paidAmount" REAL DEFAULT 0`,
        `ALTER TABLE "Order" ADD COLUMN "isDeleted" BOOLEAN DEFAULT 0`
    ];

    for (const cmd of commands) {
        try {
            await client.execute(cmd);
            console.log(`✅ Success executed: ${cmd}`);
        } catch (e: any) {
            if (e.message.includes('duplicate column name')) {
                console.log(`ℹ️ Column already exists, skipping: ${cmd}`);
            } else {
                console.error(`❌ Error executing: ${cmd}`);
                console.error(e.message);
            }
        }
    }

    console.log('Done!');
    await client.close();
}

apply();
