import { prisma } from './db.js';
import bcrypt from 'bcrypt';

async function main() {
    console.log('🌱 Seeding database...');

    const users = [
        {
            email: 'pcmasterbd1122@gmail.com',
            password: 'Admin1122',
            name: 'Admin User',
            role: 'ADMIN',
        },
        {
            email: 'user1122@gmail.com',
            password: 'User1122',
            name: 'Regular User',
            role: 'USER',
        },
    ];

    for (const userData of users) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const trialExpiresAt = new Date();
        trialExpiresAt.setDate(trialExpiresAt.getDate() + 7);

        const user = await prisma.user.upsert({
            where: { email: userData.email },
            update: {
                password: hashedPassword,
                role: userData.role as any,
                subscriptionStatus: 'TRIAL',
                trialExpiresAt,
                trialUsed: true,
            },
            create: {
                email: userData.email,
                password: hashedPassword,
                name: userData.name,
                role: userData.role as any,
                subscriptionStatus: 'TRIAL',
                trialExpiresAt,
                trialUsed: true,
            },
        });

        console.log(`✅ User ${user.email} (${user.role}) created/updated`);
    }

    console.log('🌱 Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
