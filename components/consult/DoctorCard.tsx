'use client';

import React from 'react';
import { Star, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface Doctor {
    id: string;
    name: string;
    specialty: string;
    clinic?: { name: string } | null;
    rating: number;
    imageUrl: string | null;
    isAvailable: boolean;
    bio?: string | null;
    patients: number;
}

export default function DoctorCard({ doctor }: { doctor: Doctor }) {
    const t = useTranslations('DoctorCard');
    return (
        <Link href={`/doctor/${doctor.id}`}>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 hover:border-primary-200 transition-colors cursor-pointer">
                <div className="relative flex-shrink-0">
                    <img
                        src={doctor.imageUrl || '/placeholder-doctor.jpg'}
                        alt={doctor.name}
                        className="w-20 h-20 rounded-xl object-cover bg-gray-100"
                    />
                    {doctor.isAvailable && (
                        <div className="absolute -bottom-2 -nav-right-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap border-2 border-white">
                            {t('avail')}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-900">{doctor.name}</h3>
                            <p className="text-primary-600 text-xs font-medium">{doctor.specialty}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded-md">
                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-bold text-yellow-700">{doctor.rating.toFixed(1)}</span>
                        </div>
                    </div>

                    <div className="mt-2 flex items-center gap-1 text-gray-500 text-xs">
                        <MapPin size={12} />
                        <span className="truncate">{doctor.clinic?.name || "Unknown Clinic"}</span>
                    </div>

                    <p className="mt-2 text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {doctor.bio || t('bio_default')}
                    </p>

                    <div className="mt-3 flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 text-gray-400">
                            <Clock size={12} />
                            <span>{t('next_available', { time: 'Today 2:00 PM' })}</span>
                        </div>
                        <div className="text-primary-500 font-medium">
                            {doctor.patients > 500 ? t('patients_k', { count: (doctor.patients / 1000).toFixed(1) }) : t('patients', { count: doctor.patients })}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
