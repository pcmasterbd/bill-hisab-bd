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

    console.log('Synchronizing Company Order schema on Turso...');

    const commands = [
        `CREATE TABLE IF NOT EXISTS "Supplier" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "contactPerson" TEXT,
      "phone" TEXT NOT NULL,
      "email" TEXT,
      "address" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "Supplier_phone_key" ON "Supplier"("phone")`,
        `CREATE TABLE IF NOT EXISTS "CompanyOrder" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "supplierId" TEXT NOT NULL,
      "totalAmount" REAL NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'DRAFT',
      "note" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "CompanyOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )`,
        `CREATE TABLE IF NOT EXISTS "CompanyOrderItem" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "orderId" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      "quantity" INTEGER NOT NULL,
      "costPrice" REAL NOT NULL,
      CONSTRAINT "CompanyOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CompanyOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "CompanyOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )`
    ];

    for (const cmd of commands) {
        try {
            await client.execute(cmd);
            console.log(`✅ Success executed command starting with: ${cmd.substring(0, 30)}...`);
        } catch (e: any) {
            console.error(`❌ Error executing command: ${cmd.substring(0, 50)}...`);
            console.error(e.message);
        }
    }

    console.log('Done!');
    await client.close();
}

apply();
