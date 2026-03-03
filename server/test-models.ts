import { prisma } from './src/db.js';

async function test() {
    try {
        console.log('Testing Prisma model access...');
        const supplier = await prisma.supplier.findFirst();
        console.log('Supplier access OK');

        // Testing order fields access indirectly via a query that might fail if fields aren't there
        // but findFirst() should work regardless if the model exists.
        const order = await prisma.order.findFirst({
            where: {
                // @ts-ignore
                orderType: 'REGULAR'
            }
        });
        console.log('Order access with orderType OK');

        console.log('✅ All models and new fields and accessible!');
    } catch (error) {
        console.error('❌ VERIFICATION FAILED:', error);
    } finally {
        process.exit();
    }
}

test();
