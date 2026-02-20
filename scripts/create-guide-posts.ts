
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start creating guide posts...');

    const posts = [
        {
            title: "비대면 진료 이용 가이드: 집에서 편하게 의사를 만나보세요",
            content: `
# 콜닥 비대면 진료 이용 방법

병원에 직접 가지 않고도 전문의에게 진료를 받을 수 있는 콜닥의 비대면 진료 서비스를 소개합니다.

## 1. 진료 신청하기
홈 화면에서 **'비대면 진료'** 아이콘을 누르거나 배너의 **'지금 의사 만나기'** 버튼을 클릭하세요. 원하는 진료 과목이나 의사 선생님을 선택할 수 있습니다.

## 2. 예약 및 문진표 작성
의사 선생님의 진료 가능한 시간을 확인하고 예약을 신청하세요. 현재 겪고 있는 증상이나 진료가 필요한 이유를 자세히 적어주시면 더 정확한 진료가 가능합니다.

## 3. 진료실 입장
예약된 시간이 되면 알림이 발송됩니다. 알림을 클릭하거나 예약 내역에서 **'진료실 입장'** 버튼을 눌러 화상 진료를 시작하세요.

## 4. 처방전 발급 및 약 수령
진료가 끝나면 앱 내에서 전자 처방전이 발급됩니다. **'약국 선택'** 기능을 통해 가까운 약국이나 자주 가는 약국으로 처방전을 전송하고 약을 수령하세요.

지금 바로 콜닥과 함께 스마트한 건강 관리를 시작해보세요!
            `,
            imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1000",
            category: "이용 가이드",
            author: "CallDoctor Team",
            locale: "ko"
        },
        {
            title: "How to Use CallDoctor: Remote Consultation Guide",
            content: `
# Getting Started with Remote Consultation

Experience professional medical care from the comfort of your home with CallDoctor.

## 1. Request a Consultation
Tap the **'Telemedicine'** icon or **'See a Doctor Now'** button on the home screen. You can browse by specialty or choose a specific doctor.

## 2. Book & Describe Symptoms
Check the doctor's availability and book a slot. Please describe your symptoms in detail to help the doctor provide the best care.

## 3. Enter Consultation Room
You will receive a notification when it's time. Click the notification or the **'Enter Room'** button in your appointment details to start the video call.

## 4. Get Prescription
After the consultation, an electronic prescription will be issued within the app. Select a nearby pharmacy to send your prescription and pick up your medication.

Start your smart healthcare journey with CallDoctor today!
            `,
            imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1000",
            category: "User Guide",
            author: "CallDoctor Team",
            locale: "en"
        }
    ];

    for (const post of posts) {
        const existing = await prisma.post.findFirst({
            where: {
                title: post.title,
                locale: post.locale
            }
        });

        if (existing) {
            console.log(`Post already exists: ${post.title} (${post.locale})`);
            // Optional: Update content if needed
            await prisma.post.update({
                where: { id: existing.id },
                data: post
            });
            console.log(`Updated post: ${post.title}`);
        } else {
            await prisma.post.create({
                data: post
            });
            console.log(`Created post: ${post.title} (${post.locale})`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
