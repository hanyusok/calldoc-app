import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Find all exact matches
    const exactMatches = await prisma.pharmacy.count({
        where: { fax: '수정/입력' }
    });
    console.log(`Exact '수정/입력': ${exactMatches}`);

    // 2. See some sample values containing '수정/입력'
    const pharmacies = await prisma.pharmacy.findMany({
        where: { fax: { contains: '수정/입력' } },
        take: 5,
        select: { id: true, name: true, fax: true }
    });
    console.log(pharmacies);
}

main().catch(console.error).finally(() => prisma.$disconnect());
