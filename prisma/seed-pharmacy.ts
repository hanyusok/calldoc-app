import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface PharmacyData {
    약국이름: string;
    주소: string;
    전화번호: string;
}

async function seedPharmacies() {
    console.log('🏥 Starting pharmacy data import...');

    try {
        // Read the JSON file
        const jsonPath = path.join(process.cwd(), 'public', 'raw', 'anseong_pharm.json');
        const fileContent = fs.readFileSync(jsonPath, 'utf-8');
        const pharmacies: PharmacyData[] = JSON.parse(fileContent);

        console.log(`📋 Found ${pharmacies.length} pharmacies in JSON file`);

        // Clear existing pharmacy data (optional - remove if you want to keep existing data)
        const deleteCount = await prisma.pharmacy.deleteMany({});
        console.log(`🗑️  Deleted ${deleteCount.count} existing pharmacies`);

        // Import pharmacies
        let successCount = 0;
        let errorCount = 0;

        for (const pharmacy of pharmacies) {
            try {
                await prisma.pharmacy.create({
                    data: {
                        name: pharmacy.약국이름,
                        address: pharmacy.주소 || null,
                        phone: pharmacy.전화번호 || null,
                        fax: null,
                        isDefault: false,
                    },
                });
                successCount++;
            } catch (error) {
                console.error(`❌ Error importing ${pharmacy.약국이름}:`, error);
                errorCount++;
            }
        }

        console.log(`✅ Successfully imported ${successCount} pharmacies`);
        if (errorCount > 0) {
            console.log(`⚠️  Failed to import ${errorCount} pharmacies`);
        }

        // Display sample data
        const samplePharmacies = await prisma.pharmacy.findMany({
            take: 5,
            orderBy: { name: 'asc' },
        });

        console.log('\n📊 Sample pharmacies in database:');
        samplePharmacies.forEach((p, index) => {
            console.log(`${index + 1}. ${p.name}`);
            console.log(`   Address: ${p.address || 'N/A'}`);
            console.log(`   Phone: ${p.phone || 'N/A'}`);
        });

        console.log('\n🎉 Pharmacy import completed!');
    } catch (error) {
        console.error('❌ Error during pharmacy import:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the seed function
seedPharmacies()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
