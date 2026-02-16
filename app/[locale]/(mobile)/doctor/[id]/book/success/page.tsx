import React from 'react';
import Link from 'next/link';
import { Check, Calendar, Home } from 'lucide-react';
import { prisma } from "@/app/lib/prisma";
import { getTranslations } from 'next-intl/server';

export default async function BookingSuccessPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ appointmentId?: string }>
}) {
    const { id } = await params;
    const { appointmentId } = await searchParams;
    const t = await getTranslations('BookingSuccess');

    if (!appointmentId) {
        return <div>Invalid Request</div>;
    }

    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { doctor: true }
    });

    if (!appointment) {
        return <div>Appointment not found</div>;
    }

    const formattedDate = new Date(appointment.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
    });
    const formattedTime = new Date(appointment.date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">

            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <Check size={40} className="text-green-600 stroke-[3]" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                {t.rich('description', {
                    name: appointment.doctor.name,
                    span: (chunks) => <span className="font-semibold text-gray-800">{chunks}</span>
                })}
            </p>

            <div className="bg-gray-50 rounded-2xl p-6 w-full max-w-xs mb-8 border border-gray-100">
                <div className="flex items-center justify-center gap-2 text-primary-600 font-bold text-lg mb-1">
                    <Calendar size={20} />
                    {formattedDate}
                </div>
                <div className="text-gray-600 font-medium">
                    {formattedTime}
                </div>
            </div>

            <div className="w-full max-w-xs space-y-3">
                <Link
                    href="/myappointment"
                    className="block w-full py-3.5 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-600/30 hover:bg-primary-700 transition-all active:scale-95"
                >
                    {t('view_appointments')}
                </Link>
                <Link
                    href="/"
                    className="block w-full py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                    <Home size={18} />
                    {t('back_to_home')}
                </Link>
            </div>
        </div>
    );
}
