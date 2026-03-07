import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const res = await prisma.pharmacy.updateMany({
        where: { fax: '수정/입력' },
        data: { fax: '업데이트' }
    });
    console.log(`Updated ${res.count} records from '수정/입력' to '업데이트'`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
