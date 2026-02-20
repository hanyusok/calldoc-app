
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.pharmacy.count();
    console.log(`Total Pharmacies: ${count}`);

    if (count > 0) {
        const pharmacies = await prisma.pharmacy.findMany({ take: 5 });
        console.log('Sample Pharmacies:');
        pharmacies.forEach(p => {
            console.log(`- ${p.name} (${p.address})`);
        });
    } else {
        console.log('Use "npm run seed" or check your migration scripts if this is unexpected.');
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
