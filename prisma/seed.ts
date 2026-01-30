import { PrismaClient } from '@prisma/client'

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
        imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200', // Reusing placeholder
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
        imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200', // Reusing placeholder
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
        imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200', // Reusing placeholder
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
        imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200', // Reusing placeholder
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
        imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200', // Reusing placeholder
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
        imageUrl: 'https://images.unsplash.com/photo-1651008325506-71d3748d70fe?auto=format&fit=crop&q=80&w=200', // Reusing placeholder
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
        imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200', // Reusing placeholder
        bio: 'General practitioner specializing in online consultations for common ailments.',
        gender: 'male',
        address: 'Virtual',
        isAvailable: true,
    }
];

async function main() {
    console.log('Start seeding ...')

    // Clear existing data (optional, but good for idempotent runs during dev)
    await prisma.doctor.deleteMany({});

    for (const doc of doctors) {
        const doctor = await prisma.doctor.create({
            data: doc,
        })
        console.log(`Created doctor with id: ${doctor.id}`)
    }
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
