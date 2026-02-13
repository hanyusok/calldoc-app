
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const POST_TITLES = [
    "10 Tips for a Healthy Heart",
    "Understanding Seasonal Allergies",
    "The Benefits of Regular Exercise",
    "Healthy Eating on a Budget",
    "Mental Health Awareness: Signs to Watch For",
    "How to Improve Your Sleep Quality",
    "Diabetes Management Strategies",
    "Staying Hydrated: Why It Matters",
    "Flu Prevention Guide",
    "Stress Management Techniques"
];

const CATEGORIES = ["Health", "Wellness", "Nutrition", "Disease", "Lifestyle"];

async function main() {
    console.log("Seeding posts...");

    // Clear existing posts
    await prisma.post.deleteMany({});

    for (let i = 0; i < 10; i++) {
        const title = POST_TITLES[i];
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        const seed = `post-${i + 1}`; // Consistent seed

        await prisma.post.create({
            data: {
                title,
                content: `This is the content for ${title}. It contains valuable health information and tips for users.`,
                category,
                author: "Dr. Smith",
                imageUrl: `https://picsum.photos/seed/${seed}/300/300`,
                published: true,
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
