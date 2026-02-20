import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import ServiceGrid from "@/components/ServiceGrid";
import HealthFeed from "@/components/HealthFeed";
import BottomNav from "@/components/BottomNav";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";

import { getTranslations } from "next-intl/server";

import HomeWelcome from "@/components/HomeWelcome";

export default async function Home() {
    const session = await auth();
    const t = await getTranslations('HomePage');
    let userProfile = null;

    if (session?.user?.email) {
        userProfile = await prisma.user.findUnique({
            where: { email: session.user.email },
        });
    }

    // Fetch recommended content (limit to 3 for homepage)
    const posts = await prisma.post.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        where: { published: true }
    });

    return (
        <div className="bg-white min-h-screen pb-20">
            <Header />
            {session?.user && (
                <HomeWelcome
                    user={{
                        name: session.user.name || null,
                        isVerified: !!userProfile?.phoneNumber && !!userProfile?.residentNumber
                    }}
                />
            )}
            <HeroBanner />
            <ServiceGrid />
            <div className="h-2 bg-gray-50 my-2" />
            <HealthFeed posts={posts} />
            <BottomNav />
        </div>
    );
}
