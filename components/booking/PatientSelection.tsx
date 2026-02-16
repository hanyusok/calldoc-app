'use client';

import React, { useState } from 'react';
import { User as UserIcon, Users, Check, ChevronRight, UserPlus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface FamilyMember {
    id: string;
    name: string;
    relation: string;
    age: number;
    gender: string;
}

interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    familyMembers: FamilyMember[];
}

interface PatientSelectionProps {
    user: User;
    doctorId: string;
}

export default function PatientSelection({ user, doctorId }: PatientSelectionProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations('BookingPatient');
    const [selectedPatientId, setSelectedPatientId] = useState<string>(user.id);
    const [patientType, setPatientType] = useState<'myself' | 'family'>('myself');

    const handleSelect = (id: string, type: 'myself' | 'family') => {
        setSelectedPatientId(id);
        setPatientType(type);
    };

    const handleNext = () => {
        // Carry over previous params
        const params = new URLSearchParams(searchParams.toString());
        params.set('patientId', selectedPatientId);
        params.set('patientType', patientType);

        // If family member, we might want their name too for easier display later
        if (patientType === 'family') {
            const member = user.familyMembers.find(m => m.id === selectedPatientId);
            if (member) {
                params.set('patientName', member.name);
            }
        } else {
            params.set('patientName', user.name || 'Myself');
        }

        router.push(`/doctor/${doctorId}/book/review?${params.toString()}`);
    };

    return (
        <div className="space-y-4">
            {/* Myself Option */}
            <div
                onClick={() => handleSelect(user.id, 'myself')}
                className={`
                    p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all
                    ${patientType === 'myself'
                        ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                        : 'border-gray-200 bg-white hover:border-primary-200'}
                `}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${patientType === 'myself' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                        <UserIcon size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm">{t('myself')}</h3>
                        <p className="text-xs text-gray-500">{user.name}</p>
                    </div>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${patientType === 'myself' ? 'border-primary-500 bg-primary-600 text-white' : 'border-gray-300'}`}>
                    {patientType === 'myself' && <Check size={12} />}
                </div>
            </div>

            {/* Family Members Header */}
            <div className="flex items-center justify-between pt-2">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Users size={16} /> {t('family_members')}
                </h3>
                {/* Link to profile for adding members since we are keeping this simple for now */}
                <button
                    onClick={() => router.push('/profile')}
                    className="text-xs text-primary-600 font-medium flex items-center gap-1"
                >
                    <UserPlus size={14} /> {t('add_new')}
                </button>
            </div>

            {/* Family Members List */}
            <div className="space-y-3">
                {user.familyMembers.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                        {t('no_family')}
                    </div>
                ) : (
                    user.familyMembers.map((member) => (
                        <div
                            key={member.id}
                            onClick={() => handleSelect(member.id, 'family')}
                            className={`
                                p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all
                                ${patientType === 'family' && selectedPatientId === member.id
                                    ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                                    : 'border-gray-200 bg-white hover:border-primary-200'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full bg-orange-100 text-orange-600`}>
                                    <span className="font-bold text-sm">{member.name[0]}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">{member.name}</h3>
                                    <p className="text-xs text-gray-500 capitalize">{member.relation} • {member.age} yrs</p>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${patientType === 'family' && selectedPatientId === member.id ? 'border-primary-500 bg-primary-600 text-white' : 'border-gray-300'}`}>
                                {patientType === 'family' && selectedPatientId === member.id && <Check size={12} />}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Next Button */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 border-t border-gray-100 bg-white z-20">
                <button
                    onClick={handleNext}
                    className="w-full py-3.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/30 active:scale-95 transition-all"
                >
                    {t('review_confirm')}
                </button>
            </div>
        </div>
    );
}
