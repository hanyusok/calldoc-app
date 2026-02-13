import React from 'react';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

type Status = 'PENDING' | 'AWAITING_PAYMENT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

interface StatusProgressBarProps {
    status: string;
}

const StatusProgressBar = ({ status }: StatusProgressBarProps) => {
    const t = useTranslations('MyAppointmentPage.status');

    const steps = [
        { id: 'PENDING', label: t('requested'), key: 'requested' },
        { id: 'AWAITING_PAYMENT', label: t('payment_required'), key: 'payment_required' },
        { id: 'CONFIRMED', label: t('confirmed'), key: 'confirmed' },
        { id: 'COMPLETED', label: t('completed'), key: 'completed' },
    ];

    if (status === 'CANCELLED') {
        return (
            <div className="w-full bg-red-50 py-2 px-4 rounded-lg border border-red-100 mt-2">
                <p className="text-xs font-bold text-red-600 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Cancelled
                </p>
            </div>
        );
    }

    // Determine current index
    const currentIndex = steps.findIndex(s => s.id === status);
    // If it's a vaccine that skips payment, we might need to handle it. 
    // But for now, let's assume the status maps to these steps.

    return (
        <div className="w-full mt-4 flex flex-col gap-2">
            <div className="relative flex justify-between w-full">
                {/* Connector Line Base */}
                <div
                    className="absolute top-[11px] left-0 right-0 h-[2px] bg-gray-100 -z-0"
                    style={{ left: '12%', right: '12%' }}
                />

                {/* Active Connector Line */}
                <div
                    className="absolute top-[11px] left-0 h-[2px] bg-primary-500 transition-all duration-500 -z-0"
                    style={{
                        left: '12%',
                        width: currentIndex < 0 ? '0%' : `${(currentIndex / (steps.length - 1)) * 76}%`
                    }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index < currentIndex;
                    const isActive = index === currentIndex;
                    const isPending = index > currentIndex;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 relative z-10 w-1/4">
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted ? 'bg-primary-500 border-primary-500 text-white' :
                                        isActive ? 'bg-white border-primary-500 ring-4 ring-primary-50' :
                                            'bg-white border-gray-100 text-gray-300'
                                    }`}
                            >
                                {isCompleted ? (
                                    <Check size={12} strokeWidth={4} />
                                ) : (
                                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary-500 animate-pulse' : 'bg-transparent'}`} />
                                )}
                            </div>
                            <span
                                className={`text-[10px] font-bold text-center leading-tight transition-colors duration-300 ${isActive ? 'text-primary-600' :
                                        isCompleted ? 'text-gray-900' :
                                            'text-gray-300'
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatusProgressBar;
