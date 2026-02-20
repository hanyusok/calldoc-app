
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const atFrontPharmacies = await prisma.pharmacy.findMany({
        where: { atFront: true },
        take: 5,
        select: { name: true, address: true, atFront: true }
    });

    console.log("Here are 5 pharmacies with the '문전약국' badge:");
    atFrontPharmacies.forEach(p => {
        console.log(`- ${p.name}`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
