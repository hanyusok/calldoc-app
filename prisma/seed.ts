import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    // 0. Seed Admin User
    const adminEmail = 'admin@test.com';
    const adminPassword = await bcrypt.hash('password', 10);

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            role: Role.ADMIN, // Ensure role is ADMIN if user exists
        },
        create: {
            email: adminEmail,
            name: 'Admin User',
            password: adminPassword,
            role: Role.ADMIN,
            phoneNumber: '010-0000-0000',
            residentNumber: '800101-1000000',
            age: 40,
            gender: 'male',
            emailVerified: new Date(),
        }
    });

    // 1. Seed Test User (Patient)
    const email = 'test@test.com';
    const hashedPassword = await bcrypt.hash('password', 10);

    await prisma.user.upsert({
        where: { email },
        update: {
            name: 'Test User',
            role: Role.PATIENT,
            password: hashedPassword,
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

    // 2. Seed Clinics (Manual Test Data)
    const seoulHospital = await prisma.clinic.upsert({
        where: { id: 'seoul-hospital-manual-id' },
        update: {},
        create: {
            id: 'seoul-hospital-manual-id',
            name: "Seoul National University Hospital",
            address: "101 Daehak-ro, Jongno-gu, Seoul",
            city: "Seoul",
            latitude: 37.5796,
            longitude: 126.9990,
            phoneNumber: "02-2072-2114",
            website: "https://www.snuh.org",
            rating: 4.8,
            images: ["https://images.unsplash.com/photo-1587351021759-3e566b9af9ef?auto=format&fit=crop&q=80&w=1000"]
        }
    });

    const gangnamClinic = await prisma.clinic.upsert({
        where: { id: 'gangnam-smile-manual-id' },
        update: {},
        create: {
            id: 'gangnam-smile-manual-id',
            name: "Gangnam Smile Clinic",
            address: "123 Gangnam-daero, Seoul",
            city: "Seoul",
            latitude: 37.4979,
            longitude: 127.0276,
            phoneNumber: "02-555-1234",
            rating: 4.9,
            images: ["https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1000"]
        }
    });

    // 2.1 Seed Clinics from CSV
    try {
        const csvPath = path.join(process.cwd(), 'public/raw/clinic_an_py_os.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = csvContent.split('\n');

        console.log(`Found ${lines.length} lines in CSV.`);

        let count = 0;
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Regex/Split to handle quoted fields with commas
            const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

            // Expected columns based on header: 
            // 0: 병원이름 (Name)
            // 1: Region (e.g. 경기)
            // 2: City (e.g. 평택시)
            // 3: 주소 (Address) - quoted
            // 4: 전화번호 (Phone)
            // 5: X (Longitude)
            // 6: Y (Latitude)

            const name = columns[0]?.trim();
            const city = columns[2]?.trim();
            const rawAddress = columns[3]?.trim() || "";
            const address = rawAddress.replace(/^"|"$/g, ''); // Remove quotes
            const phoneNumber = columns[4]?.trim() || null;
            const longitude = parseFloat(columns[5] || '0');
            const latitude = parseFloat(columns[6] || '0');

            if (name && address) {
                // Upsert based on name + address to avoid excessive duplication if run multiple times
                // Since we don't have a unique constraint on name+address, we use findFirst then update/create
                // Or just create if simpler. For seed idempotency, let's try to check existing.

                const existing = await prisma.clinic.findFirst({
                    where: {
                        name: name,
                        address: address
                    }
                });

                if (!existing) {
                    await prisma.clinic.create({
                        data: {
                            name,
                            address,
                            city,
                            phoneNumber,
                            latitude,
                            longitude,
                            rating: 0, // Default
                            images: []
                        }
                    });
                    count++;
                }
            }
        }
        console.log(`Imported ${count} clinics from CSV.`);
    } catch (error) {
        console.error("Error importing CSV:", error);
    }

    // 3. Seed Doctors
    const doctorsData = [
        {
            name: 'Dr. Sarah Kim',
            specialty: 'Internal Medicine',
            clinicId: seoulHospital.id,
            rating: 4.9,
            patients: 1500,
            imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
            bio: 'Specialist in digestive disorders with 10 years of experience at SNUH.',
            gender: 'female',
            address: 'Seoul, Korea',
            isAvailable: true,
        },
        {
            name: 'Dr. James Lee',
            specialty: 'Pediatrics',
            clinicId: seoulHospital.id,
            rating: 4.8,
            patients: 2300,
            imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
            bio: 'Friendly pediatrician loved by kids.',
            gender: 'male',
            address: 'Seoul, Korea',
            isAvailable: true,
        },
        {
            name: 'Dr. Emily Park',
            specialty: 'Dermatology',
            clinicId: gangnamClinic.id,
            rating: 5.0,
            patients: 3100,
            imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200',
            bio: 'Renowned dermatologist.',
            gender: 'female',
            address: 'Seoul, Korea',
            isAvailable: false,
        }
    ];

    for (const doc of doctorsData) {
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

    // 4. Seed Posts
    const postsData = [
        {
            title: "겨울철 독감 예방 가이드",
            content: "겨울철 독감을 예방하기 위해서는 손 씻기와 마스크 착용이 필수입니다...",
            imageUrl: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&q=80&w=1000",
            category: "건강 정보",
            author: "Dr. Kim",
            locale: "ko"
        },
        {
            title: "Flu Prevention Guide",
            content: "To prevent flu in winter, washing hands and wearing masks are essential...",
            imageUrl: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&q=80&w=1000",
            category: "Health Tips",
            author: "Dr. Kim",
            locale: "en"
        },
        {
            title: "스트레스 관리법",
            content: "현대인의 만성 질환, 스트레스를 관리하는 5가지 방법을 소개합니다.",
            imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000",
            category: "정신 건강",
            author: "Dr. Lee",
            locale: "ko"
        },
        {
            title: "Stress Management Tips",
            content: "Here are 5 ways to manage stress, the chronic disease of modern people.",
            imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000",
            category: "Mental Health",
            author: "Dr. Lee",
            locale: "en"
        },
        {
            title: "올바른 영양제 섭취법",
            content: "영양제, 언제 어떻게 먹어야 가장 효과적일까요?",
            imageUrl: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd0?auto=format&fit=crop&q=80&w=1000",
            category: "영양 관리",
            author: "Dr. Park",
            locale: "ko"
        },
        {
            title: "How to Take Supplements Correctly",
            content: "When and how should you take supplements for maximum effect?",
            imageUrl: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd0?auto=format&fit=crop&q=80&w=1000",
            category: "Nutrition",
            author: "Dr. Park",
            locale: "en"
        }
    ];

    for (const post of postsData) {
        // Check duplication by title AND locale
        const existingPost = await prisma.post.findFirst({
            where: {
                title: post.title,
                locale: post.locale
            }
        });

        if (!existingPost) {
            await prisma.post.create({ data: post });
        }
    }

    // 5. Seed Pharmacies (from JSON)
    try {
        const pharmacyFiles = ['anseong_pharm.json', 'pyt.json'];
        let pharmacyCount = 0;

        for (const file of pharmacyFiles) {
            const filePath = path.join(process.cwd(), 'public/raw', file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                const pharmacies = JSON.parse(content);

                for (const p of pharmacies) {
                    const name = p['약국이름'];
                    const address = p['주소'];
                    const phone = p['전화번호'];

                    if (name && address) {
                        // Check for existing pharmacy by name and address to avoid duplicates
                        const existingPharmacy = await prisma.pharmacy.findFirst({
                            where: {
                                name: name,
                                address: address
                            }
                        });

                        if (!existingPharmacy) {
                            await prisma.pharmacy.create({
                                data: {
                                    name,
                                    address,
                                    phone,
                                    isDefault: false
                                }
                            });
                            pharmacyCount++;
                        }
                    }
                }
                console.log(`Imported pharmacies from ${file}.`);
            } else {
                console.warn(`Pharmacy file not found: ${filePath}`);
            }
        }
        console.log(`Total new pharmacies seeded: ${pharmacyCount}`);

    } catch (error) {
        console.error("Error seeding pharmacies:", error);
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
