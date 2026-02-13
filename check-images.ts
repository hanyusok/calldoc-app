
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const posts = await prisma.post.findMany();
    console.log("Current Post Image URLs:");
    posts.forEach(post => {
        console.log(`ID: ${post.id}, ImageURL: ${post.imageUrl}`);
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
