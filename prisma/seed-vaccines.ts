import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding vaccines ...')

    const vaccines = [
        {
            name: "폐렴구균 (프리베나20)",
            nameEn: "Pneumococcal Vaccine (Prevnar 20)",
            price: 200000,
            category: "성인 예방접종",
            categoryEn: "Adult Vaccination",
            description: "폐렴 및 침습성 폐렴구균 감염증 예방",
            descriptionEn: "Prevention of pneumonia and invasive pneumococcal disease",
            targetDisease: "폐렴구균",
            targetDiseaseEn: "Pneumococcus",
            visitTime: "30분 내외",
            visitTimeEn: "Approx. 30 min",
            location: "원내 접종",
            locationEn: "In-clinic"
        },
        {
            name: "대상포진 (싱그릭스)",
            nameEn: "Varicella Zoster Vaccine (Shingrix)",
            price: 250000,
            category: "성인 예방접종",
            categoryEn: "Adult Vaccination",
            description: "대상포진 및 포진 후 신경통 예방",
            descriptionEn: "Prevention of shingles and post-herpetic neuralgia",
            targetDisease: "대상포진 바이러스",
            targetDiseaseEn: "Varicella Zoster Virus",
            visitTime: "30분 내외",
            visitTimeEn: "Approx. 30 min",
            location: "원내 접종",
            locationEn: "In-clinic"
        },
        {
            name: "파상풍/디프테리아/백일해 (Tdap)",
            nameEn: "Tdap Vaccine",
            price: 60000,
            category: "성인 예방접종",
            categoryEn: "Adult Vaccination",
            description: "파상풍, 디프테리아, 백일해 예방",
            descriptionEn: "Prevention of Tetanus, Diphtheria, and Pertussis",
            targetDisease: "파상풍, 디프테리아, 백일해",
            targetDiseaseEn: "Tetanus, Diphtheria, Pertussis",
            visitTime: "30분 내외",
            visitTimeEn: "Approx. 30 min",
            location: "원내 접종",
            locationEn: "In-clinic"
        }
    ]

    for (const v of vaccines) {
        await prisma.vaccination.upsert({
            where: { name: v.name },
            update: v,
            create: v
        })
        console.log(`Upserted vaccine: ${v.name}`)
    }

    console.log('Seeding vaccines finished.')
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
