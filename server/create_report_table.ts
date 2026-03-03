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

    console.log('Creating Report table on Turso...');

    try {
        await client.execute(`CREATE TABLE IF NOT EXISTS "Report" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "title" TEXT NOT NULL,
            "type" TEXT NOT NULL,
            "periodStart" DATETIME NOT NULL,
            "periodEnd" DATETIME NOT NULL,
            "data" TEXT NOT NULL,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL
        )`);
        console.log('✅ Report table established');
    } catch (e: any) {
        console.error('❌ Error creating Report table:', e.message);
    }

    await client.close();
}

migrate();
