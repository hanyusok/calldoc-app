import React from 'react';
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { Bell, History, Settings, ChevronRight, User } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function DashboardPage() {
    const session = await auth();
    const t = await getTranslations('Dashboard');

    if (!session?.user) {
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
                {/* User Profile Summary */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
                        <User size={32} />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-gray-900">{session.user.name}</h2>
                        <p className="text-sm text-gray-500">{session.user.email}</p>
                    </div>
                </div>

                {/* Notifications Section */}
                <section>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Bell size={16} />
                            {t('notifications')}
                        </h2>
                        <button className="text-xs font-bold text-primary-600">{t('view_all')}</button>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
                        <div className="p-4 flex items-start gap-3">
                            <div className="bg-blue-50 text-blue-500 p-2 rounded-xl mt-0.5">
                                <Bell size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Appointment Confirmed</p>
                                <p className="text-xs text-gray-500 mt-0.5">Your appointment with Dr. Smith is confirmed for tomorrow at 2:00 PM.</p>
                                <p className="text-[10px] text-gray-400 mt-1.5">2 hours ago</p>
                            </div>
                        </div>
                        <div className="p-4 flex items-start gap-3">
                            <div className="bg-green-50 text-green-500 p-2 rounded-xl mt-0.5">
                                <History size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Prescription Ready</p>
                                <p className="text-xs text-gray-500 mt-0.5">Your medical prescription has been sent to the pharmacy.</p>
                                <p className="text-[10px] text-gray-400 mt-1.5">Yesterday</p>
                            </div>
                        </div>
                    </div>
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

                    <Link href="/profile" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.98] transition-all">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-50 text-amber-600 p-2.5 rounded-xl">
                                <Settings size={20} />
                            </div>
                            <span className="font-bold text-gray-800">{t('preferences')}</span>
                        </div>
                        <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
                    </Link>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
