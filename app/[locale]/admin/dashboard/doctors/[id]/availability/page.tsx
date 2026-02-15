import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';
import { getTranslations } from 'next-intl/server';
import AvailabilityClient from './AvailabilityClient';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default async function DoctorAvailabilityPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const t = await getTranslations('Admin.doctors.availability');

    const doctor = await prisma.doctor.findUnique({
        where: { id },
        include: {
            schedules: {
                orderBy: { dayOfWeek: 'asc' }
            },
            exceptions: {
                orderBy: { date: 'asc' },
                where: {
                    date: {
                        gte: new Date()
                    }
                }
            }
        }
    });

    if (!doctor) {
        notFound();
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/admin/dashboard/doctors" className="text-gray-600 hover:text-gray-900">
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-sm text-gray-600">{doctor.name} - {doctor.specialty}</p>
                </div>
            </div>

            <AvailabilityClient
                doctorId={id}
                initialSchedules={doctor.schedules}
                initialExceptions={doctor.exceptions}
            />
        </div>
    );
}
