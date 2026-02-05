import React from 'react';
import { getDoctorById } from '@/app/[locale]/(mobile)/consult/actions';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import DateTimeSelection from '@/components/booking/DateTimeSelection';

export default async function BookingDatePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const doctor = await getDoctorById(id);

    if (!doctor) {
        notFound();
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 px-4 py-3 flex items-center gap-3 shadow-sm mb-6">
                <Link href={`/doctor/${id}`} className="text-gray-600 hover:text-gray-900">
                    <ChevronLeft size={24} />
                </Link>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-gray-900 leading-tight">Select Schedule</h1>
                    <p className="text-xs text-gray-500">Step 1 of 3</p>
                </div>
            </div>

            <div className="px-4 space-y-4">
                {/* Doctor Summary */}
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                        <img
                            src={doctor.imageUrl || '/placeholder-doctor.jpg'}
                            alt={doctor.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm">{doctor.name}</h3>
                        <p className="text-xs text-primary-600">{doctor.specialty}</p>
                    </div>
                </div>

                {/* Calendar & Time Selection */}
                <DateTimeSelection doctorId={id} />
            </div>
        </div>
    );
}
