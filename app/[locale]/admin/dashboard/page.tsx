import React from 'react';
import { getAppointments } from '@/app/actions/appointment';
import { getTranslations } from 'next-intl/server';
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import AppointmentsClient from '../appointments/AppointmentsClient';

export default async function AdminDashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await auth();
    const t = await getTranslations('Admin.dashboard');

    if (!session?.user) {
        redirect('/login');
    }

    const { q: search, status } = await searchParams || {};
    const { appointments } = await getAppointments(search as string, status as string);

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header removed as it's now in AdminNavbar/Layout, or we can keep a sub-header */}
            <header className="bg-white shadow-sm p-4 sticky top-16 z-10">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
                    <div className="text-sm text-gray-500">
                        {t('welcome', { name: session.user.name || session.user.email || 'Admin' })}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 space-y-6">
                <AppointmentsClient
                    initialAppointments={appointments}
                    initialTotal={0} // Dashboard might not need pagination or we need to fetch count
                    initialPage={1}
                    search={search as string}
                    status={status as string}
                />
            </main>
        </div>
    );
}
