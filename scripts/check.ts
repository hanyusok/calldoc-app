import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const doctors = await prisma.doctor.findMany({
        include: { clinic: true }
    });
    console.log(`Total doctors: ${doctors.length}`);
    doctors.forEach(d => {
        console.log(`Doctor: ${d.name} | Clinic: ${d.clinic ? d.clinic.name : 'NULL'} | Clinic Visible: ${d.clinic ? d.clinic.isVisible : 'N/A'}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
