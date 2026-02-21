import React from 'react';
import { getVaccinationById } from '@/app/actions/vaccination';
import { notFound } from 'next/navigation';
import { ChevronLeft, Syringe } from 'lucide-react';
import Link from 'next/link';
import VaccinationScheduling from '@/components/vaccination/VaccinationScheduling';
import { getTranslations } from 'next-intl/server';

export default async function VaccinationBookingPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
    const { id, locale } = await params;
    const t = await getTranslations('Booking');
    const vaccination = await getVaccinationById(id);

    if (!vaccination) {
        notFound();
    }

    const isEn = locale === 'en';
    const displayName = isEn ? (vaccination.nameEn || vaccination.name) : vaccination.name;

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 px-4 py-4 flex items-center gap-3 shadow-sm mb-6">
                <Link href={`/consult?category=vaccination`} className="text-gray-600 hover:text-gray-900">
                    <ChevronLeft size={24} />
                </Link>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-gray-900 leading-tight">{t('select_schedule')}</h1>
                    <p className="text-xs text-gray-500">{displayName}</p>
                </div>
            </div>

            <div className="px-4 space-y-4">
                {/* Vaccine Summary */}
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <Syringe size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{displayName}</h3>
                        <p className="text-xs text-gray-500">{vaccination.manufacturer || 'General Medicine'}</p>
                    </div>
                </div>

                {/* Scheduling Component */}
                <VaccinationScheduling vaccinationId={id} />
            </div>
        </div>
    );
}
