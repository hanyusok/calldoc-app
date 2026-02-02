import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import ServiceGrid from "@/components/ServiceGrid";
import HealthFeed from "@/components/HealthFeed";
import BottomNav from "@/components/BottomNav";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";

export default async function Home() {
    const session = await auth();
    let userProfile = null;

    if (session?.user?.email) {
        userProfile = await prisma.user.findUnique({
            where: { email: session.user.email },
        });
        console.log("Profile Check Result:", userProfile ? "Exists" : "Not Found", session.user.email);
    }

    return (
        <div className="bg-white min-h-screen pb-20">
            <Header />
            {session?.user && (
                <div className="bg-green-100 p-4 text-center text-green-800">
                    Welcome back, {session.user.name || "User"}!
                    {userProfile ? " (Profile Verified)" : " (Profile Pending)"}
                </div>
            )}
            <HeroBanner />
            <ServiceGrid />
            <div className="h-2 bg-gray-50 my-2" />
            <HealthFeed />
            <BottomNav />
        </div>
    );
}
