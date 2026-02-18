import React from 'react';
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { Bell, History, ChevronRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import PharmacySelector from "@/components/profile/PharmacySelector";
import { updatePharmacy } from "@/app/[locale]/(mobile)/profile/actions";
import { prisma } from "@/app/lib/prisma";
import { getUserNotifications } from "@/app/actions/notification";
import NotificationList from "@/components/dashboard/NotificationList";

export default async function DashboardPage() {
    const session = await auth();
    const t = await getTranslations('Dashboard');

    if (!session?.user?.email) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { pharmacy: true }
    });

    const notifications = await getUserNotifications(5); // Fetch latest 5 for dashboard

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 px-4 py-4 shadow-sm flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
                <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <Bell size={22} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            </div>

            <div className="px-4 py-6 space-y-6">


                {/* Notifications Section */}
                <section>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Bell size={16} />
                            {t('notifications')}
                        </h2>
                        {/* <button className="text-xs font-bold text-primary-600">{t('view_all')}</button> */}
                    </div>

                    <NotificationList notifications={notifications} />
                </section>

                {/* Quick Shortcuts */}
                <div className="grid grid-cols-1 gap-3">
                    <Link href="/myappointment" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.98] transition-all">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-50 text-purple-600 p-2.5 rounded-xl">
                                <History size={20} />
                            </div>
                            <span className="font-bold text-gray-800">{t('activity')}</span>
                        </div>
                        <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
                    </Link>


                </div>

                {/* Nearby Pharmacy Section */}
                <section>
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
                        {t('nearby_pharmacy')}
                    </h2>
                    <PharmacySelector
                        selectedPharmacy={user.pharmacy}
                        onSelect={updatePharmacy}
                    />
                </section>
            </div>

            <BottomNav />
        </div>
    );
}
