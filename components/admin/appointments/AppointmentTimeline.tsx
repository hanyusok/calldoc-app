'use client';

import { Check, Circle, Clock, ArrowRight } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';

interface AppointmentTimelineProps {
    appointment: any;
}

export default function AppointmentTimeline({ appointment }: AppointmentTimelineProps) {
    const format = useFormatter();
    const t = useTranslations('Admin.timeline');

    // Define steps based on appointment state
    const steps = [
        {
            id: 'requested',
            label: t('requested'),
            date: appointment.createdAt,
            isCompleted: true, // Always true if it exists
            isCurrent: appointment.status === 'PENDING' && !appointment.price
        },
        {
            id: 'price_set',
            label: t('price_set'),
            // We don't track exact "price set" date in schema, so use updatedAt/createdAt or infer
            date: appointment.price ? appointment.updatedAt : null,
            isCompleted: !!appointment.price && appointment.price > 0,
            isCurrent: appointment.status === 'PENDING' || appointment.status === 'AWAITING_PAYMENT'
        },
        {
            id: 'paid',
            label: t('paid'),
            date: appointment.payment?.approvedAt || appointment.payment?.requestedAt,
            isCompleted: appointment.payment?.status === 'COMPLETED',
            isCurrent: appointment.status === 'CONFIRMED'
        },
        {
            id: 'consultation',
            label: t('consultation'),
            date: appointment.date,
            isCompleted: ['COMPLETED', 'CONFIRMED'].includes(appointment.status) && new Date(appointment.date) < new Date(),
            isCurrent: appointment.status === 'CONFIRMED' && new Date(appointment.date) >= new Date()
        },
        {
            id: 'script_requested',
            label: t('script_requested'),
            date: appointment.prescription?.createdAt,
            isCompleted: !!appointment.prescription,
            isCurrent: appointment.status === 'COMPLETED' && !appointment.prescription
        },
        {
            id: 'faxed',
            label: t('faxed'),
            date: appointment.prescription?.updatedAt,
            isCompleted: appointment.prescription?.status === 'ISSUED' || appointment.prescription?.status === 'SENT', // 'SENT' assumes future update
            isCurrent: appointment.prescription?.status === 'REQUESTED'
        }
    ];

    return (
        <div className="w-full py-4 overflow-x-auto">
            <div className="flex items-center min-w-[600px]">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center relative flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 
                                ${step.isCompleted ? 'bg-green-500 border-green-500 text-white' :
                                    step.isCurrent ? 'bg-blue-600 border-blue-600 text-white animate-pulse' :
                                        'bg-white border-gray-300 text-gray-300'}`}>
                                {step.isCompleted ? <Check size={16} /> :
                                    step.isCurrent ? <Clock size={16} /> :
                                        <Circle size={10} />}
                            </div>
                            <div className="mt-2 text-center w-24">
                                <p className={`text-xs font-bold ${step.isCurrent ? 'text-blue-600' : 'text-gray-700'}`}>
                                    {step.label}
                                </p>
                                {step.date && step.isCompleted && (
                                    <p className="text-[10px] text-gray-500">
                                        {new Date(step.date).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                                    </p>
                                )}
                            </div>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`h-1 w-full mx-2 -mt-6 
                                ${step.isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
