"use client";

import React, { useState } from 'react';
import { Syringe, MapPin, Clock, Check } from 'lucide-react';
import { reserveVaccination } from '@/app/actions/vaccination';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

interface Vaccination {
    id: string;
    name: string;
    nameEn?: string | null;
    price: number;
    description: string | null;
    descriptionEn?: string | null;
    visitTime: string | null;
    visitTimeEn?: string | null;
    location: string | null;
    locationEn?: string | null;
    category: string | null;
    categoryEn?: string | null;
    manufacturer: string | null;
    manufacturerEn?: string | null;
    targetDisease: string | null;
    targetDiseaseEn?: string | null;
    minAge: number | null;
    maxAge: number | null;
}

const VaccinationCard = ({ vaccination }: { vaccination: Vaccination }) => {
    const [isReserving, setIsReserving] = useState(false);
    const [isReserved, setIsReserved] = useState(false);
    const router = useRouter();
    const t = useTranslations('VaccinationCard');
    const locale = useLocale();
    const isEn = locale === 'en';

    const displayData = {
        name: isEn ? (vaccination.nameEn || vaccination.name) : vaccination.name,
        description: isEn ? (vaccination.descriptionEn || vaccination.description) : vaccination.description,
        visitTime: isEn ? (vaccination.visitTimeEn || vaccination.visitTime) : vaccination.visitTime,
        location: isEn ? (vaccination.locationEn || vaccination.location) : vaccination.location,
        category: isEn ? (vaccination.categoryEn || vaccination.category) : vaccination.category,
        manufacturer: isEn ? (vaccination.manufacturerEn || vaccination.manufacturer) : vaccination.manufacturer,
        targetDisease: isEn ? (vaccination.targetDiseaseEn || vaccination.targetDisease) : vaccination.targetDisease,
    };

    const handleReserve = () => {
        router.push(`/${locale}/vaccination/${vaccination.id}/book`);
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                            {displayData.category || t('category_fallback')}
                        </span>
                        {vaccination.minAge !== null && (
                            <span className="inline-flex items-center text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                {t('age_label', { age: vaccination.minAge })}
                            </span>
                        )}
                    </div>
                    <h3 className="font-bold text-gray-900">{displayData.name}</h3>
                    {displayData.manufacturer && (
                        <p className="text-xs text-blue-600 font-medium">{displayData.manufacturer}</p>
                    )}
                </div>
                <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                    <Syringe size={20} />
                </div>
            </div>

            <p className="text-xs text-gray-500 line-clamp-2">{displayData.description}</p>

            {displayData.targetDisease && (
                <p className="text-xs text-gray-400 mt-1">
                    {t('target_label', { disease: displayData.targetDisease })}
                </p>
            )}

            <div className="flex flex-col gap-1 mt-2 text-xs text-gray-600">
                {displayData.location && (
                    <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-gray-400" />
                        <span>{displayData.location}</span>
                    </div>
                )}
                {displayData.visitTime && (
                    <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-gray-400" />
                        <span>{t('visit_label', { time: displayData.visitTime })}</span>
                    </div>
                )}
            </div>

            <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between items-center">
                <span className="font-bold text-blue-600">
                    {vaccination.price === 0 ? t('free') : `₩${vaccination.price.toLocaleString()}`}
                </span>
                <button
                    onClick={handleReserve}
                    disabled={isReserving || isReserved}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${isReserved
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        }`}
                >
                    {isReserved ? (
                        <>
                            <Check size={14} />
                            {t('reserved')}
                        </>
                    ) : (
                        isReserving ? t('reserving') : t('reserve_button')
                    )}
                </button>
            </div>
        </div>
    );
};

export default VaccinationCard;
