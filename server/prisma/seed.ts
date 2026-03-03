import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding default users...');

    const adminEmail = 'pcmasterbd1122@gmail.com';
    const adminPassword = 'Admin1122';
    const userEmail = 'user1122@gmail.com';
    const userPassword = 'User1122';

    // Hash passwords
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
    const hashedUserPassword = await bcrypt.hash(userPassword, 10);

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { password: hashedAdminPassword, role: 'ADMIN' },
        create: {
            email: adminEmail,
            password: hashedAdminPassword,
            name: 'Admin User',
            role: 'ADMIN',
            subscriptionStatus: 'ACTIVE',
        },
    });
    console.log('✅ Admin user seeded:', admin.email);

    // Create Regular User
    const user = await prisma.user.upsert({
        where: { email: userEmail },
        update: { password: hashedUserPassword, role: 'USER' },
        create: {
            email: userEmail,
            password: hashedUserPassword,
            name: 'Regular User',
            role: 'USER',
            subscriptionStatus: 'ACTIVE',
        },
    });
    console.log('✅ Regular user seeded:', user.email);

    console.log('🏁 Seeding finished.');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
