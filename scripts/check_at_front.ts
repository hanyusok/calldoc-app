
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const total = await prisma.pharmacy.count();
    const atFrontCount = await prisma.pharmacy.count({
        where: {
            atFront: true,
        },
    });

    console.log(`Total Pharmacies: ${total}`);
    console.log(`Pharmacies with atFront=true: ${atFrontCount}`);

    if (atFrontCount === 0) {
        console.log("No pharmacies have atFront=true. Updating 5 random pharmacies...");
        const pharmacies = await prisma.pharmacy.findMany({ take: 5 });
        for (const p of pharmacies) {
            await prisma.pharmacy.update({
                where: { id: p.id },
                data: { atFront: true }
            });
            console.log(`Updated ${p.name} to atFront=true`);
        }
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
