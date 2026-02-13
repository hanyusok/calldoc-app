
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'test@calldoc.co.kr';
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (!existingUser) {
        const hashedPassword = await bcrypt.hash('password', 10);

        await prisma.user.create({
            data: {
                email,
                name: 'Test User',
                password: hashedPassword,
                role: Role.PATIENT,
                phoneNumber: '010-1234-5678',
                residentNumber: '900101-1234567',
                age: 30,
                gender: 'male',
                emailVerified: new Date(),
            }
        });
        console.log(`Created user: ${email}`);
    } else {
        console.log(`User ${email} already exists.`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
