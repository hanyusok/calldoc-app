import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    console.log("Checking Prisma Client...");
    try {
        const doctor = await prisma.doctor.findFirst({
            include: { clinic: true }
        });
        console.log("Success! Found doctor:", doctor?.name, "Clinic:", doctor?.clinic?.name);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}

check()
    .finally(() => prisma.$disconnect());
