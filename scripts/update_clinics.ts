import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const result = await prisma.clinic.updateMany({
        data: {
            isVisible: false
        }
    });
    console.log(`Updated ${result.count} clinics to be invisible.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
