import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding hair loss post ...')

    const posts = [
        {
            title: "탈모 고민, 이제 비대면으로 해결하세요: 탈모처방 가이드",
            content: "탈모는 꾸준한 관리가 핵심입니다. 콜닥터에서는 병원에 직접 방문하지 않고도 전문의와의 비대면 진료를 통해 탈모 약을 처방받으실 수 있습니다. 남성형 탈모, 여성형 탈모 등 유형에 맞는 약제(피나스테리드, 두타스테리드 등)에 대해 알아보고, 안전하게 배송받는 방법을 확인해 보세요. 탈모 치료는 시기가 중요합니다. 지금 바로 상담받아보세요.",
            imageUrl: "/images/posts/hair_loss_treatment.png",
            author: "콜닥-마트의원",
            category: "건강 정보",
            locale: "ko",
            published: true
        },
        {
            title: "Solving Hair Loss Struggles: A Guide to Remote Prescriptions",
            content: "Managing hair loss requires consistent care. With CallDoctor, you can consult with specialists remotely and receive prescriptions for hair loss treatments (such as Finasteride or Dutasteride) without visiting a hospital in person. Learn about the right treatments for male and female pattern hair loss and how to get your medication delivered safely. Timing is critical in hair loss treatment. Start your consultation today.",
            imageUrl: "/images/posts/hair_loss_treatment.png",
            author: "콜닥-마트의원",
            category: "Health Info",
            locale: "en",
            published: true
        }
    ]

    for (const post of posts) {
        await prisma.post.upsert({
            where: {
                // Since there's no unique constraint on title+locale in schema, 
                // we'll find by title and locale first
                id: 'temp-id' // dummy
            },
            update: post,
            create: post
        }).catch(async (e) => {
            // Since upsert needs a unique field in where, let's use findFirst + create
            const existing = await prisma.post.findFirst({
                where: {
                    title: post.title,
                    locale: post.locale
                }
            });
            if (!existing) {
                await prisma.post.create({ data: post });
                console.log(`Created post: ${post.title} (${post.locale})`);
            } else {
                await prisma.post.update({
                    where: { id: existing.id },
                    data: post
                });
                console.log(`Updated post: ${post.title} (${post.locale})`);
            }
        });
    }

    console.log('Seeding hair loss post finished.')
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
