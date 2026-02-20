
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const clinic = await prisma.clinic.findFirst({
        where: { name: '마트의원' },
        select: { id: true, name: true, images: true },
    });

    if (clinic) {
        console.log(`Clinic: ${clinic.name}`);
        console.log(`Images: ${JSON.stringify(clinic.images)}`);
    } else {
        console.log('Clinic not found');
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
