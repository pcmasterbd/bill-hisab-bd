import dotenv from 'dotenv';
dotenv.config();

console.log('--- ENV CHECK ---');
console.log('TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL);
console.log('PORT:', process.env.PORT);
console.log('-----------------');
