import React from 'react';
import { getAppointments } from '@/app/actions/appointment';
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import { Calendar, Clock, User, Plus, Search, Filter } from 'lucide-react';
import AppointmentActions from './AppointmentActions';
import AppointmentModal from '@/components/admin/AppointmentModal';
import ClientPage from './ClientPage';

export default async function AdminDashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await auth();
    if (!session?.user) {
        redirect('/login');
    }

    const { q: search, status } = await searchParams || {};
    const appointments = await getAppointments(search as string, status as string);

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                    <div className="text-sm text-gray-500">
                        {session.user.name || session.user.email}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 space-y-6">
                <ClientPage initialAppointments={appointments} search={search as string} status={status as string} />
            </main>
        </div>
    );
}
