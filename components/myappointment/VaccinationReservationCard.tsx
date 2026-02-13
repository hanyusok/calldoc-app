import React from 'react';
import { Syringe, MapPin, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import StatusProgressBar from '@/components/myappointment/StatusProgressBar';

interface Vaccination {
    id: string;
    name: string;
    location: string | null;
}

interface Reservation {
    id: string;
    status: string;
    createdAt: Date;
    vaccination: Vaccination;
}

const VaccinationReservationCard = ({ reservation }: { reservation: Reservation }) => {
    const tCommon = useTranslations('MyAppointmentPage');

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 text-yellow-600 p-2 rounded-xl">
                        <Syringe size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 leading-none">{reservation.vaccination.name}</h3>
                        <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-tight mt-1">{tCommon('card.vaccination_subtitle') || 'Vaccination Reservation'}</p>
                    </div>
                </div>
            </div>

            <StatusProgressBar status={reservation.status} />

            <div className="space-y-1.5 mt-4">
                {reservation.vaccination.location && (
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                        <MapPin size={12} className="text-gray-300" />
                        <span>{reservation.vaccination.location}</span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <Calendar size={12} className="text-gray-300" />
                    <span>Requested: {new Date(reservation.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-50">
                <button className="w-full py-2.5 rounded-xl bg-gray-50 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors">
                    {tCommon('card.details')}
                </button>
            </div>
        </div>
    );
};

export default VaccinationReservationCard;
