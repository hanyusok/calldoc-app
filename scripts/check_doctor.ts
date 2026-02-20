
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const query = '한유석';
    console.log(`Searching for doctor with name containing: ${query}`);

    const doctors = await prisma.doctor.findMany({
        where: {
            name: { contains: query },
        },
        include: {
            clinic: true,
        },
    });

    if (doctors.length === 0) {
        console.log('No doctors found.');
    } else {
        doctors.forEach(doc => {
            console.log('---');
            console.log(`Name: ${doc.name}`);
            console.log(`ID: ${doc.id}`);
            console.log(`Specialty: ${doc.specialty}`);
            console.log(`Clinic: ${doc.clinic?.name} (Visible: ${doc.clinic?.isVisible})`);
            console.log(`IsAvailable: ${doc.isAvailable}`);
        });
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
