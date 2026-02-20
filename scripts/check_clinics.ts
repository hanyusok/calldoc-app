
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const totalClinics = await prisma.clinic.count();
    console.log(`Total clinics: ${totalClinics}`);

    const martClinics = await prisma.clinic.findMany({
        where: {
            name: {
                contains: '마트',
            },
        },
        select: {
            id: true,
            name: true,
            isVisible: true,
        },
    });

    console.log('Clinics matching "마트":');
    martClinics.forEach((c) => {
        console.log(`- [${c.id}] ${c.name} (Visible: ${c.isVisible})`);
    });

    const visibleCount = await prisma.clinic.count({
        where: { isVisible: true },
    });
    console.log(`Currently visible clinics: ${visibleCount}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
