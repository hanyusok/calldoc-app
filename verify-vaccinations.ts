
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking Vaccination Table...");

    // limit 1 just to see structure
    const vaccine = await prisma.vaccination.findFirst();

    if (vaccine) {
        console.log("✅ Vaccination table exists.");
        console.log("Sample Record:");
        console.log(JSON.stringify(vaccine, null, 2));

        if ('manufacturer' in vaccine && 'targetDisease' in vaccine) {
            console.log("✅ New fields (manufacturer, targetDisease) are present.");
        } else {
            console.error("❌ New fields are MISSING!");
        }
    } else {
        console.log("⚠️ Table exists but is empty.");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
