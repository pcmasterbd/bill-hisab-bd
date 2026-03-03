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

async function testApi() {
    try {
        const response = await fetch('http://localhost:5000/api/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'API Test Customer',
                phone: '01888777666',
                district: 'Dhaka',
                thana: 'Savar',
                address: 'API Test Address'
            })
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', data);
    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

testApi();
