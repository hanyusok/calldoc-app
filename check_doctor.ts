
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const doctor = await prisma.doctor.findFirst({
        where: {
            OR: [
                { name: { contains: "한유석" } },
                { name: { contains: "Han" } } // Check for English name too just in case
            ]
        }
    });
    console.log("Doctor found:", doctor);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
