import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const doctors = [
    {
        name: 'Dr. Sarah Kim',
        specialty: 'Internal Medicine',
        hospital: 'Seoul National Univ. Hospital',
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
        isAvailable: true,
    },
    {
        name: 'Dr. James Lee',
        specialty: 'Pediatrics',
        hospital: 'Yonsei Kids Clinic',
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        isAvailable: true,
    },
    {
        name: 'Dr. Emily Park',
        specialty: 'Dermatology',
        hospital: 'Clear Skin Center',
        rating: 5.0,
        imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200',
        isAvailable: false,
    },
    {
        name: 'Dr. Michael Chen',
        specialty: 'Family Medicine',
        hospital: 'Gangnam Healthy Life',
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
        isAvailable: true,
    },
    {
        name: 'Dr. Olivia Choi',
        specialty: 'ENT Specialist',
        hospital: 'Breath Easy Clinic',
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1651008325506-71d3748d70fe?auto=format&fit=crop&q=80&w=200',
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
