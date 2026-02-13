
"use client";

import React, { useState } from 'react';
import { Syringe, MapPin, Clock, Check } from 'lucide-react';
import { reserveVaccination } from '@/app/actions/vaccination-booking';
import { useRouter } from 'next/navigation';

interface Vaccination {
    id: string;
    name: string;
    price: number;
    description: string | null;
    visitTime: string | null;
    location: string | null;
    category: string | null;
    manufacturer: string | null;
    targetDisease: string | null;
    minAge: number | null;
    maxAge: number | null;
}

const VaccinationCard = ({ vaccination }: { vaccination: Vaccination }) => {
    const [isReserving, setIsReserving] = useState(false);
    const [isReserved, setIsReserved] = useState(false);
    const router = useRouter();

    const handleReserve = async () => {
        setIsReserving(true);
        try {
            const result = await reserveVaccination(vaccination.id);
            if (result.success) {
                setIsReserved(true);
                // Redirect to dashboard after success
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500);
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert("An error occurred while reserving.");
        } finally {
            setIsReserving(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                            {vaccination.category || "Vaccine"}
                        </span>
                        {vaccination.minAge !== null && (
                            <span className="inline-flex items-center text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                Age: {vaccination.minAge}+
                            </span>
                        )}
                    </div>
                    <h3 className="font-bold text-gray-900">{vaccination.name}</h3>
                    {vaccination.manufacturer && (
                        <p className="text-xs text-blue-600 font-medium">{vaccination.manufacturer}</p>
                    )}
                </div>
                <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                    <Syringe size={20} />
                </div>
            </div>

            <p className="text-xs text-gray-500 line-clamp-2">{vaccination.description}</p>

            {vaccination.targetDisease && (
                <p className="text-xs text-gray-400 mt-1">Target: {vaccination.targetDisease}</p>
            )}

            <div className="flex flex-col gap-1 mt-2 text-xs text-gray-600">
                {vaccination.location && (
                    <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-gray-400" />
                        <span>{vaccination.location}</span>
                    </div>
                )}
                {vaccination.visitTime && (
                    <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-gray-400" />
                        <span>Rec. Visit: {vaccination.visitTime}</span>
                    </div>
                )}
            </div>

            <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between items-center">
                <span className="font-bold text-blue-600">
                    {vaccination.price === 0 ? "Free" : `₩${vaccination.price.toLocaleString()}`}
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
                            Reserved
                        </>
                    ) : (
                        isReserving ? "Reserving..." : "Reserve"
                    )}
                </button>
            </div>
        </div>
    );
};

export default VaccinationCard;
