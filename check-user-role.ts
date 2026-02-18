
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'test@test.com';
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, role: true }
    });
    console.log('User Role:', user);

    const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true, email: true, role: true }
    });
    console.log('Admins:', admins);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
