
import React from 'react';
import { getTranslations } from 'next-intl/server';
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/admin/dashboard/DashboardClient';
import { prisma } from "@/app/lib/prisma";

export default async function AdminDashboardPage() {
    const session = await auth();
    const t = await getTranslations('Admin.dashboard');

    if (!session?.user) {
        redirect('/login');
    }

    // Fetch simple stats
    const [totalAppointments, pendingAppointments, todayAppointments] = await Promise.all([
        prisma.appointment.count(),
        prisma.appointment.count({ where: { status: 'PENDING' } }),
        prisma.appointment.count({
            where: {
                date: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    lt: new Date(new Date().setHours(23, 59, 59, 999))
                }
            }
        })
    ]);

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <header className="bg-white shadow-sm p-4 sticky top-16 z-10">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
                    <div className="text-sm text-gray-500">
                        {t('welcome', { name: session.user.name || session.user.email || 'Admin' })}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 space-y-6">
                <DashboardClient stats={{ totalAppointments, pendingAppointments, todayAppointments }} />
            </main>
        </div>
    );
}
