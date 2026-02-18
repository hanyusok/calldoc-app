
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.post.count();
    console.log(`Total Posts: ${count}`);

    const posts = await prisma.post.findMany({
        select: { title: true, locale: true }
    });
    console.log('Posts:', JSON.stringify(posts, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
