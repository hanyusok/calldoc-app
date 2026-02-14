import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const doctors = [
    {
        name: 'Dr. Sarah Kim',
        specialty: 'Internal Medicine',
        hospital: 'Seoul National Univ. Hospital',
        rating: 4.9,
        patients: 1500,
        imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
        bio: 'Specialist in digestive disorders with 10 years of experience at SNUH. Dedicated to preventative care.',
        gender: 'female',
        address: '101 Daehak-ro, Jongno-gu, Seoul',
        isAvailable: true,
    },
    {
        name: 'Dr. James Lee',
        specialty: 'Pediatrics',
        hospital: 'Yonsei Kids Clinic',
        rating: 4.8,
        patients: 2300,
        imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        bio: 'Friendly pediatrician loved by kids. Expert in childhood asthma and allergies.',
        gender: 'male',
        address: '50-1 Yonsei-ro, Seodaemun-gu, Seoul',
        isAvailable: true,
    },
    {
        name: 'Dr. Emily Park',
        specialty: 'Dermatology',
        hospital: 'Clear Skin Center',
        rating: 5.0,
        patients: 3100,
        imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200',
        bio: 'Renowned dermatologist focusing on acne treatment and anti-aging procedures.',
        gender: 'female',
        address: '123 Gangnam-daero, Gangnam-gu, Seoul',
        isAvailable: false,
    },
    {
        name: 'Dr. Michael Chen',
        specialty: 'Family Medicine',
        hospital: 'Gangnam Healthy Life',
        rating: 4.7,
        patients: 980,
        imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
        bio: 'Comprehensive care for the whole family. Focus on lifestyle medicine and chronic disease management.',
        gender: 'male',
        address: '456 Teheranno, Gangnam-gu, Seoul',
        isAvailable: true,
    },
    {
        name: 'Dr. Olivia Choi',
        specialty: 'ENT Specialist',
        hospital: 'Breath Easy Clinic',
        rating: 4.8,
        patients: 1200,
        imageUrl: 'https://images.unsplash.com/photo-1651008325506-71d3748d70fe?auto=format&fit=crop&q=80&w=200',
        bio: 'Expert in treating sinus infections and sleep apnea. Uses minimally invasive techniques.',
        gender: 'female',
        address: '789 Songpa-daero, Songpa-gu, Seoul',
        isAvailable: true,
    },
    {
        name: 'Dr. David Kim',
        specialty: 'Orthopedics',
        hospital: 'Strong Bone Hospital',
        rating: 4.9,
        patients: 1800,
        imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        bio: 'Sports medicine specialist. Former team doctor for national athletes.',
        gender: 'male',
        address: '321 Olympic-ro, Songpa-gu, Seoul',
        isAvailable: true,
    },
    {
        name: 'Dr. Hana Ryu',
        specialty: 'Psychiatry',
        hospital: 'Mindful Care Clinic',
        rating: 4.9,
        patients: 850,
        imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
        bio: 'Compassionate care for anxiety and depression. Offers both therapy and medication management.',
        gender: 'female',
        address: '654 Itaewon-ro, Yongsan-gu, Seoul',
        isAvailable: true,
    },
    {
        name: 'Dr. Minho Song',
        specialty: 'Dental Care',
        hospital: 'Bright Smile Dental',
        rating: 4.6,
        patients: 2100,
        imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
        bio: 'Cosmetic dentistry expert. Known for painless procedures and implants.',
        gender: 'male',
        address: '987 Apgujeong-ro, Gangnam-gu, Seoul',
        isAvailable: false,
    },
    {
        name: 'Dr. Soyeon Park',
        specialty: 'Ophthalmology',
        hospital: 'Clear Vision Eye Center',
        rating: 5.0,
        patients: 4000,
        imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200',
        bio: 'LASIK and cataract surgery specialist using the latest laser technology.',
        gender: 'female',
        address: '159 Sinsa-dong, Gangnam-gu, Seoul',
        isAvailable: true,
    },
    {
        name: 'Dr. Junho Choi',
        specialty: 'Cardiology',
        hospital: 'Heart First Center',
        rating: 4.8,
        patients: 1600,
        imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        bio: 'Interventional cardiologist focused on preventing heart disease through lifestyle changes.',
        gender: 'male',
        address: '753 Yeouido-dong, Yeongdeungpo-gu, Seoul',
        isAvailable: true,
    },
    {
        name: 'Dr. Jiwon Lim',
        specialty: 'Telemedicine',
        hospital: 'CallDoc Virtual Clinic',
        rating: 4.7,
        patients: 5000,
        imageUrl: 'https://images.unsplash.com/photo-1651008325506-71d3748d70fe?auto=format&fit=crop&q=80&w=200',
        bio: 'Expert in remote diagnosis and digital health. available 24/7 for consultations.',
        gender: 'female',
        address: 'Virtual',
        isAvailable: true,
    },
    {
        name: 'Dr. Sangwoo Kim',
        specialty: 'Telemedicine',
        hospital: 'CallDoc Virtual Clinic',
        rating: 4.6,
        patients: 4200,
        imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
        bio: 'General practitioner specializing in online consultations for common ailments.',
        gender: 'male',
        address: 'Virtual',
        isAvailable: true,
    }
];

const PHARMACY_NAMES = [
    "Better Health Pharmacy", "City Center Chemists", "Sunshine Drugstore",
    "Community Care Pharmacy", "Quick Relief Meds", "MediPlus Pharmacy",
    "Wellness Corner", "Family First Pharmacy", "Urban Apothecary", "Green Cross Pharmacy"
];

const ADDRESSES = [
    "123 Gangnam-daero, Gangnam-gu, Seoul", "456 Teheran-ro, Gangnam-gu, Seoul",
    "789 Sejong-daero, Jongno-gu, Seoul", "101 Itaewon-ro, Yongsan-gu, Seoul",
    "202 Hongdae-ro, Mapo-gu, Seoul", "303 Yeouido-daero, Yeongdeungpo-gu, Seoul",
    "404 Jamsil-ro, Songpa-gu, Seoul", "505 Apgujeong-ro, Gangnam-gu, Seoul",
    "606 Cheongdam-ro, Gangnam-gu, Seoul", "707 Hannam-daero, Yongsan-gu, Seoul"
];

const POST_TITLES = [
    "10 Tips for a Healthy Heart", "Understanding Seasonal Allergies", "The Benefits of Regular Exercise",
    "Healthy Eating on a Budget", "Mental Health Awareness: Signs to Watch For", "How to Improve Your Sleep Quality",
    "Diabetes Management Strategies", "Staying Hydrated: Why It Matters", "Flu Prevention Guide", "Stress Management Techniques"
];

const CATEGORIES = ["Health", "Wellness", "Nutrition", "Disease", "Lifestyle"];

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
    console.log('Start seeding ...')

    // 1. Seed Test User (Patient)
    const email = 'test@test.com';
    const hashedPassword = await bcrypt.hash('password', 10);

    await prisma.user.upsert({
        where: { email },
        update: {
            name: 'Test User',
            password: hashedPassword,
            role: Role.PATIENT,
            phoneNumber: '010-1234-5678',
            residentNumber: '900101-1234567',
            age: 30,
            gender: 'male',
            emailVerified: new Date(),
        },
        create: {
            email,
            name: 'Test User',
            password: hashedPassword,
            role: Role.PATIENT,
            phoneNumber: '010-1234-5678',
            residentNumber: '900101-1234567',
            age: 30,
            gender: 'male',
            emailVerified: new Date(),
        }
    });
    console.log(`Upserted test user: ${email}`);

    // 2. Seed Admin User
    const adminEmail = 'admin@test.com';
    const hashedAdminPassword = await bcrypt.hash('password', 10);

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            name: 'System Admin',
            password: hashedAdminPassword,
            role: Role.ADMIN,
            phoneNumber: '010-0000-0000',
            emailVerified: new Date(),
        },
        create: {
            email: adminEmail,
            name: 'System Admin',
            password: hashedAdminPassword,
            role: Role.ADMIN,
            phoneNumber: '010-0000-0000',
            emailVerified: new Date(),
        }
    });
    console.log(`Upserted admin user: ${adminEmail}`);

    // 3. Seed Doctors
    for (const doc of doctors) {
        const existingDoctor = await prisma.doctor.findFirst({
            where: { name: doc.name }
        });

        if (existingDoctor) {
            await prisma.doctor.update({
                where: { id: existingDoctor.id },
                data: doc
            });
        } else {
            await prisma.doctor.create({ data: doc });
        }
    }
    console.log('Doctors seeded/renewed.');

    // 4. Seed Pharmacies
    for (let i = 0; i < 10; i++) {
        const name = PHARMACY_NAMES[i];
        const pharmacyData = {
            name,
            address: ADDRESSES[i],
            phone: `02-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
            fax: `02-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
            isDefault: i === 0
        };

        const existingPharmacy = await prisma.pharmacy.findFirst({
            where: { name }
        });

        if (existingPharmacy) {
            await prisma.pharmacy.update({
                where: { id: existingPharmacy.id },
                data: pharmacyData
            });
        } else {
            await prisma.pharmacy.create({ data: pharmacyData });
        }
    }
    console.log('Pharmacies seeded/renewed.');

    // 5. Seed Posts
    // Define the specific medical posts with local images
    const MEDICAL_POSTS = [
        {
            title: "Manage Your Diabetes with Modern Tech",
            content: "Continuous Glucose Monitors (CGMs) are revolutionizing diabetes care. Learn how real-time data can help you better manage your blood sugar levels and improve your quality of life. Our clinic offers consultation on the latest devices.",
            category: "News",
            imageUrl: "/images/posts/diabetes-tech.jpg",
            author: "Dr. Sarah Kim"
        },
        {
            title: "Recovery from Long COVID: A Guide",
            content: "Experiencing lingering symptoms after COVID-19? You're not alone. Our respiratory specialists have developed a comprehensive rehabilitation program to help improve lung function and energy levels.",
            category: "Health",
            imageUrl: "/images/posts/long-covid.jpg",
            author: "Dr. Olivia Choi"
        },
        {
            title: "Flu Season is Here: Get Vaccinated",
            content: "The best protection against the flu is the annual vaccine. We are now offering the quadrivalent flu shot for all ages. Protect yourself and your loved ones this winter.",
            category: "Vaccination",
            imageUrl: "/images/posts/flu-season.jpg",
            author: "Dr. James Lee"
        },
        {
            title: "Protect Yourself Against Shingles",
            content: "Shingles can be painful and debilitating, especially as we age. If you are over 50, talk to us about the shingles vaccine. It's a simple step to prevent a serious condition.",
            category: "Vaccination",
            imageUrl: "/images/posts/shingles-vaccine.jpg",
            author: "Dr. Michael Chen"
        },
        {
            title: "HPV Vaccine: Cancer Prevention",
            content: "The HPV vaccine is a critical tool in preventing certain cancers. We recommend it for pre-teens and young adults. Schedule a consultation to learn more about this life-saving vaccine.",
            category: "Vaccination",
            imageUrl: "/images/posts/hpv-vaccine.jpg",
            author: "Dr. James Lee"
        },
        {
            title: "Planning a Trip? Check Your Vaccines",
            content: "Don't let an illness ruin your vacation. From typhoid to yellow fever, make sure you're protected before you travel abroad. Visit our travel clinic at least 4 weeks before departure.",
            category: "Vaccination",
            imageUrl: "/images/posts/travel-vaccine.jpg",
            author: "Dr. Michael Chen"
        },
        {
            title: "Heart Health: Why Screening Matters",
            content: "Cardiovascular disease is a leading cause of death, but it's largely preventable. regular screenings for blood pressure and cholesterol are essential. Book your heart health checkup today.",
            category: "News",
            imageUrl: "/images/posts/heart-screening.jpg",
            author: "Dr. Junho Choi"
        },
        {
            title: "Brighten Your Smile with a Dental Checkup",
            content: "Oral health is linked to overall health. Regular cleanings and checkups prevent gum disease and tooth decay. Our dental clinic offers pain-free exams and cosmetic services.",
            category: "Promotion",
            imageUrl: "/images/posts/dental-checkup.jpg",
            author: "Dr. Minho Song"
        },
        {
            title: "Advanced Diagnostics: MRI Services",
            content: "Our center is equipped with state-of-the-art MRI technology for precise diagnosis of soft tissue injuries and neurological conditions. Fast, comfortable, and accurate scanning available.",
            category: "Promotion",
            imageUrl: "/images/posts/mri-scan.jpg",
            author: "Dr. Sarah Kim"
        },
        {
            title: "Bone Density Scans for Osteoporosis",
            content: "Strong bones are the foundation of a healthy active life. Early detection of osteoporosis can prevent fractures. We offer quick and non-invasive DEXA scans for at-risk patients.",
            category: "Promotion",
            imageUrl: "/images/posts/bone-density.jpg",
            author: "Dr. David Kim"
        }
    ];

    // Clear existing posts to avoid duplication/random data
    await prisma.post.deleteMany({});
    console.log('Existing posts cleared.');

    for (const post of MEDICAL_POSTS) {
        await prisma.post.create({
            data: {
                ...post,
                published: true
            }
        });
    }
    console.log('Medical posts seeded.');

    // 6. Seed Vaccinations
    for (const v of VACCINATIONS) {
        const vaccinationData = {
            ...v,
            description: `Protects against ${v.category}. Recommended for all ages.`
        };

        const existingVaccination = await prisma.vaccination.findFirst({
            where: { name: v.name }
        });

        if (existingVaccination) {
            await prisma.vaccination.update({
                where: { id: existingVaccination.id },
                data: vaccinationData as any // Use as any if needed, but strict types should be fine given schema
            });
        } else {
            await prisma.vaccination.create({ data: vaccinationData });
        }
    }
    console.log('Vaccinations seeded/renewed.');

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
