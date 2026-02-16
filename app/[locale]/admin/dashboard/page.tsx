
import React from 'react';
import { getTranslations } from 'next-intl/server';
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/admin/dashboard/DashboardClient';
import { prisma } from "@/app/lib/prisma";
import PageContainer from "@/components/admin/shared/PageContainer";
import PageHeader from "@/components/admin/shared/PageHeader";

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
            <PageContainer>
                <PageHeader
                    title={t('title')}
                    description={t('welcome', { name: session.user.name || session.user.email || 'Admin' })}
                />
                <DashboardClient stats={{ totalAppointments, pendingAppointments, todayAppointments }} />
            </PageContainer>
        </div>
    );
}
