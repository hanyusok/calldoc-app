import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const pharmacies = await prisma.pharmacy.findMany({
        where: {
            fax: {
                contains: '수정'
            }
        }
    });
    console.log(`Found ${pharmacies.length} pharmacies with fax containing '수정'`);
    if (pharmacies.length > 0) {
        console.log(pharmacies[0].fax);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
