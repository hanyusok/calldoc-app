'use client';

import React, { useState } from 'react';
import { Edit2, DollarSign, CheckCircle } from 'lucide-react';
import { Appointment, AppointmentStatus } from '@prisma/client';
import AppointmentModal from '@/components/admin/appointments/AppointmentModal';
import { useTranslations } from 'next-intl';

interface AppointmentActionsProps {
    appointment: any; // Using any for simplicity as it includes relations
}

export default function AppointmentActions({ appointment }: AppointmentActionsProps) {
    const t = useTranslations('Admin.dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="flex gap-2">

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                >
                    <Edit2 size={16} />
                    {t('edit')}
                </button>
            </div>

            <AppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                appointment={appointment}
            />
        </>
    );
}
