
import { prisma } from "@/app/lib/prisma";

async function main() {
    const email = "test@test.com";
    console.log(`Searching for user with email: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.log("User not found!");
        return;
    }

    console.log(`User found: ${user.name} (${user.id})`);

    const appointments = await prisma.appointment.findMany({
        where: { userId: user.id },
        include: { doctor: true }
    });

    console.log(`Found ${appointments.length} appointments for user.`);

    appointments.forEach(apt => {
        console.log(`[${apt.id}] Status: ${apt.status}, Date: ${apt.date}, Doctor: ${apt.doctor.name}`);
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
