
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Finding '마트의원'...");
    const target = await prisma.clinic.findFirst({
        where: { name: '마트의원', isVisible: true }
    });

    if (!target) {
        console.log("Target clinic not found");
        return;
    }

    console.log(`Found clinic '${target.name}' (ID: ${target.id}). Current images: ${JSON.stringify(target.images)}`);

    const updated = await prisma.clinic.update({
        where: { id: target.id },
        data: { images: [] }
    });

    console.log(`Updated clinic ${updated.name} (ID: ${updated.id}). Images set to empty array.`);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
