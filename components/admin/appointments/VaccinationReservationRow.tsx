"use client";

import React, { useState } from 'react';
import { Syringe, User, Calendar, MapPin, MoreHorizontal, Edit, CheckCircle, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { updateVaccinationReservationStatus } from '@/app/actions/vaccination';

interface VaccinationReservationRowProps {
    reservation: any;
}

export default function VaccinationReservationRow({ reservation }: VaccinationReservationRowProps) {
    const tStatus = useTranslations('Admin.status');
    const [status, setStatus] = useState(reservation.status);
    const [loading, setLoading] = useState(false);

    const handleStatusUpdate = async (newStatus: string) => {
        setLoading(true);
        try {
            await updateVaccinationReservationStatus(reservation.id, newStatus);
            setStatus(newStatus);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (s: string) => {
        switch (s) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED': return 'bg-green-100 text-green-800';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <User size={16} />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{reservation.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{reservation.user?.email}</p>
                    </div>
                </div>
            </td>
            <td className="p-4 text-gray-600">
                <div className="flex flex-col">
                    <span className="font-medium">{new Date(reservation.createdAt).toLocaleDateString()}</span>
                    <span className="text-xs opacity-60">{new Date(reservation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </td>
            <td className="p-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Syringe size={14} />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{reservation.vaccination?.name}</p>
                        <p className="text-xs text-gray-500">{reservation.vaccination?.location || 'General Clinic'}</p>
                    </div>
                </div>
            </td>
            <td className="p-4 text-center">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold leading-none ${getStatusStyle(status)}`}>
                    {tStatus(status)}
                </span>
            </td>
            <td className="p-4 text-right font-bold text-gray-900">
                -
            </td>
            <td className="p-4">
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => handleStatusUpdate('CONFIRMED')}
                        disabled={loading || status === 'CONFIRMED'}
                        className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-30"
                        title="Confirm"
                    >
                        <CheckCircle size={18} />
                    </button>
                    <button
                        onClick={() => handleStatusUpdate('COMPLETED')}
                        disabled={loading || status === 'COMPLETED'}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 disabled:opacity-30"
                        title="Complete"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => handleStatusUpdate('CANCELLED')}
                        disabled={loading || status === 'CANCELLED'}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-30"
                        title="Cancel"
                    >
                        <XCircle size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
}
