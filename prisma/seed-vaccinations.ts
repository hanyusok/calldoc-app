
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const VACCINATIONS = [
    { name: "Influenza (Flu) Vaccine", price: 30000, visitTime: "15 min", location: "Gangnam Health Center", category: "Flu", manufacturer: "GC Pharma", targetDisease: "Influenza", minAge: 0, maxAge: 100 },
    { name: "COVID-19 Booster", price: 0, visitTime: "20 min", location: "Seocho Clinic", category: "COVID-19", manufacturer: "Pfizer", targetDisease: "COVID-19", minAge: 12, maxAge: 100 },
    { name: "Hepatitis B", price: 25000, visitTime: "10 min", location: "Seoul National Univ. Hospital", category: "Hepatitis", manufacturer: "LG Chem", targetDisease: "Hepatitis B", minAge: 0, maxAge: 100 },
    { name: "Tetanus (Tdap)", price: 40000, visitTime: "15 min", location: "CallDoc Center", category: "Tetanus", manufacturer: "Sanofi", targetDisease: "Tetanus, Diphtheria, Pertussis", minAge: 10, maxAge: 65 },
    { name: "Shingles (Zoster)", price: 150000, visitTime: "30 min", location: "Gangnam Severance", category: "Shingles", manufacturer: "SK Bioscience", targetDisease: "Herpes Zoster", minAge: 50, maxAge: 100 },
    { name: "HPV (Gardasil 9)", price: 200000, visitTime: "20 min", location: "Women's Health Clinic", category: "HPV", manufacturer: "MSD", targetDisease: "Human Papillomavirus", minAge: 9, maxAge: 45 },
    { name: "Pneumococcal", price: 120000, visitTime: "15 min", location: "Asan Medical Center", category: "Pneumonia", manufacturer: "Pfizer", targetDisease: "Pneumococcal Disease", minAge: 65, maxAge: 100 },
    { name: "Measles, Mumps, Rubella (MMR)", price: 35000, visitTime: "15 min", location: "Children's Hospital", category: "MMR", manufacturer: "Merck", targetDisease: "Measles, Mumps, Rubella", minAge: 1, maxAge: 100 },
    { name: "Chickenpox (Varicella)", price: 40000, visitTime: "15 min", location: "Samsung Medical Center", category: "Chickenpox", manufacturer: "GC Pharma", targetDisease: "Varicella", minAge: 1, maxAge: 13 },
    { name: "Meningococcal", price: 130000, visitTime: "20 min", location: "Yonsei Clinic", category: "Meningitis", manufacturer: "Sanofi", targetDisease: "Meningococcal Disease", minAge: 11, maxAge: 55 }
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
                manufacturer: v.manufacturer,
                targetDisease: v.targetDisease,
                minAge: v.minAge,
                maxAge: v.maxAge,
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
