
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting clinic visibility update...');

    // 1. Hide all clinics except '마트의원'
    const updateResult = await prisma.clinic.updateMany({
        where: {
            name: {
                not: '마트의원',
            },
        },
        data: {
            isVisible: false,
        },
    });

    console.log(`Hidden ${updateResult.count} clinics.`);

    // 2. Ensure '마트의원' is visible
    const martClinic = await prisma.clinic.findFirst({
        where: { name: '마트의원' },
    });

    if (martClinic) {
        if (!martClinic.isVisible) {
            await prisma.clinic.update({
                where: { id: martClinic.id },
                data: { isVisible: true },
            });
            console.log(`'${martClinic.name}' (ID: ${martClinic.id}) set to visible.`);
        } else {
            console.log(`'${martClinic.name}' (ID: ${martClinic.id}) is already visible.`);
        }
    } else {
        console.error("Critical Error: '마트의원' not found!");
    }

    console.log('Update complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
