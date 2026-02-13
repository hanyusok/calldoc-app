
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const VACCINATIONS = [
    { name: "Influenza (Flu) Vaccine", price: 30000, visitTime: "15 min", location: "Gangnam Health Center", category: "Flu" },
    { name: "COVID-19 Booster", price: 0, visitTime: "20 min", location: "Seocho Clinic", category: "COVID-19" },
    { name: "Hepatitis B", price: 25000, visitTime: "10 min", location: "Seoul National Univ. Hospital", category: "Hepatitis" },
    { name: "Tetanus (Tdap)", price: 40000, visitTime: "15 min", location: "CallDoc Center", category: "Tetanus" },
    { name: "Shingles (Zoster)", price: 150000, visitTime: "30 min", location: "Gangnam Severance", category: "Shingles" },
    { name: "HPV (Gardasil 9)", price: 200000, visitTime: "20 min", location: "Women's Health Clinic", category: "HPV" },
    { name: "Pneumococcal", price: 120000, visitTime: "15 min", location: "Asan Medical Center", category: "Pneumonia" },
    { name: "Measles, Mumps, Rubella (MMR)", price: 35000, visitTime: "15 min", location: "Children's Hospital", category: "MMR" },
    { name: "Chickenpox (Varicella)", price: 40000, visitTime: "15 min", location: "Samsung Medical Center", category: "Chickenpox" },
    { name: "Meningococcal", price: 130000, visitTime: "20 min", location: "Yonsei Clinic", category: "Meningitis" }
];

async function main() {
    console.log("Seeding vaccinations...");

    await prisma.vaccination.deleteMany({});

    for (const v of VACCINATIONS) {
        await prisma.vaccination.create({
            data: {
                name: v.name,
                price: v.price,
                visitTime: v.visitTime,
                location: v.location,
                category: v.category,
                description: `Protects against ${v.category}. Recommended for all ages.`
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
