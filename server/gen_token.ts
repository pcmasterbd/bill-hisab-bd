import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';

const token = jwt.sign(
    { userId: 'admin-id', email: 'ratul122@gmail.com', role: 'ADMIN' },
    JWT_SECRET,
    { expiresIn: '1h' }
);

console.log(token);
