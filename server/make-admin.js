const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin() {
    const email = process.argv[2] || 'admin@saha.com';

    try {
        // Update user to admin
        const user = await prisma.user.update({
            where: { email: email },
            data: { role: 'ADMIN' }
        });

        console.log(`✅ User ${user.email} has been granted ADMIN role`);
        console.log(`🔐 Admin Dashboard: /admin`);
        console.log(`📧 Email: ${user.email}`);
        console.log(`🔑 Password: password (if using test user)`);

    } catch (error) {
        console.error('❌ Error updating user role:', error.message);

        // If user doesn't exist, create admin user
        if (error.code === 'P2025') {
            console.log('👤 Creating new admin user...');

            const adminUser = await prisma.user.create({
                data: {
                    name: 'Saha Administrator',
                    email: 'admin@saha.com',
                    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
                    role: 'ADMIN',
                    verified: true,
                    phone: '+966500000000',
                    phoneVerified: true,
                }
            });

            console.log(`✅ Admin user created successfully!`);
            console.log(`🔐 Admin Dashboard: /admin`);
            console.log(`📧 Email: ${adminUser.email}`);
            console.log(`🔑 Password: password`);
        }
    } finally {
        await prisma.$disconnect();
    }
}

makeAdmin();