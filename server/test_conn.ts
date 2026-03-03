import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

console.log('URL:', process.env.TURSO_DATABASE_URL ? 'Defined' : 'Undefined');
console.log('TOKEN:', process.env.TURSO_AUTH_TOKEN ? 'Defined' : 'Undefined');

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

try {
    const res = await client.execute('SELECT 1');
    console.log('Success:', res.rows);
} catch (e: any) {
    console.error('Error:', e.message);
} finally {
    await client.close();
}
