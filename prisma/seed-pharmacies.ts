
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PHARMACY_NAMES = [
    "Better Health Pharmacy",
    "City Center Chemists",
    "Sunshine Drugstore",
    "Community Care Pharmacy",
    "Quick Relief Meds",
    "MediPlus Pharmacy",
    "Wellness Corner",
    "Family First Pharmacy",
    "Urban Apothecary",
    "Green Cross Pharmacy"
];

const ADDRESSES = [
    "123 Gangnam-daero, Gangnam-gu, Seoul",
    "456 Teheran-ro, Gangnam-gu, Seoul",
    "789 Sejong-daero, Jongno-gu, Seoul",
    "101 Itaewon-ro, Yongsan-gu, Seoul",
    "202 Hongdae-ro, Mapo-gu, Seoul",
    "303 Yeouido-daero, Yeongdeungpo-gu, Seoul",
    "404 Jamsil-ro, Songpa-gu, Seoul",
    "505 Apgujeong-ro, Gangnam-gu, Seoul",
    "606 Cheongdam-ro, Gangnam-gu, Seoul",
    "707 Hannam-daero, Yongsan-gu, Seoul"
];

async function main() {
    console.log("Seeding pharmacies...");

    for (let i = 0; i < 10; i++) {
        const name = PHARMACY_NAMES[i];
        const address = ADDRESSES[i];
        const phone = `02-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`;
        const fax = `02-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`;

        await prisma.pharmacy.create({
            data: {
                name,
                address,
                phone,
                fax,
                isDefault: i === 0 // Make the first one default for testing purposes if needed
            }
        });
    }

    console.log("Seeding completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
