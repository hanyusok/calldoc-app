import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import ServiceGrid from "@/components/ServiceGrid";
import HealthFeed from "@/components/HealthFeed";
import BottomNav from "@/components/BottomNav";

export default function Home() {
    return (
        <div className="bg-white min-h-screen pb-20">
            <Header />
            <HeroBanner />
            <ServiceGrid />
            <div className="h-2 bg-gray-50 my-2" />
            <HealthFeed />
            <BottomNav />
        </div>
    );
}
