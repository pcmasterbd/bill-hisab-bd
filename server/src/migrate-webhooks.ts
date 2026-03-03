import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the server root
dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
    const client = createClient({
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
    });

    console.log('Synchronizing Webhook table on Turso...');

    try {
        await client.execute(`CREATE TABLE IF NOT EXISTS "Webhook" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "url" TEXT NOT NULL,
            "event" TEXT NOT NULL,
            "isActive" BOOLEAN NOT NULL DEFAULT 1,
            "secret" TEXT,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL,
            CONSTRAINT "Webhook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
        )`);
        console.log('✅ Webhook table established');
    } catch (e: any) {
        console.error('❌ Error creating Webhook table:', e.message);
    }

    console.log('Done!');
    await client.close();
}

migrate();
