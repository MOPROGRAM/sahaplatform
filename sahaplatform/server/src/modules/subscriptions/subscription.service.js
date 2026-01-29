const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createSubscription = async (userId, planName, price) => {
    // Basic simulation: active for 30 days
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    return await prisma.subscription.create({
        data: {
            userId,
            planName,
            planType: 'PRO',
            price: parseFloat(price),
            currencyId: 'sar',
            status: 'active',
            endDate
        }
    });
};

const getUserSubscriptions = async (userId) => {
    return await prisma.subscription.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
};

module.exports = { createSubscription, getUserSubscriptions };
