'use client';

import { useEffect, useState } from 'react';
import { checkAppointmentNotifications } from '@/app/[locale]/(mobile)/myappointment/actions';
import { useRouter } from 'next/navigation';
import { Bell, Video, CreditCard } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function NotificationWatcher({ initialConfirmedIds }: { initialConfirmedIds: string[] }) {
    const t = useTranslations('MyAppointmentPage');
    const router = useRouter();
    const [knownIds, setKnownIds] = useState<string[]>(initialConfirmedIds);
    const [notification, setNotification] = useState<{
        message: string;
        id: string;
        type: 'PAYMENT' | 'MEET' | 'CANCELLED';
    } | null>(null);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const notifications = await checkAppointmentNotifications(knownIds);

                if (notifications.length > 0) {
                    const latest = notifications[0] as any;
                    const isPayment = latest.type === 'PAYMENT_REQUIRED';
                    const isCancelled = latest.type === 'PAYMENT_CANCELLED';

                    let message = '';
                    if (isPayment) {
                        message = t('card.price_confirmed_msg', { doctor: latest.doctor.name, price: latest.price });
                    } else if (isCancelled) {
                        message = t('status.CANCELLED'); // Use existing status translation or add explicit one
                    } else {
                        message = t('card.enter_room'); // "Enter Room" or similar as proxy for meeting ready
                    }

                    setNotification({
                        message,
                        id: latest.id,
                        type: isPayment ? 'PAYMENT' : (isCancelled ? 'CANCELLED' : 'MEET')
                    });

                    // Update known IDs so we don't notify again
                    const newIds = notifications.map((a: any) => a.id);
                    setKnownIds(prev => [...prev, ...newIds]);

                    // Refresh the page data
                    router.refresh();

                    // Hide notification after 5 seconds
                    setTimeout(() => setNotification(null), 5000);
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [knownIds, router, t]);

    if (!notification) return null;

    const isPayment = notification.type === 'PAYMENT';
    const isCancelled = notification.type === 'CANCELLED';

    // Determine styles based on type
    let borderColor = 'border-green-500';
    let iconBg = 'bg-green-50 text-green-500';
    let Icon = Video;
    let title = "Ready to Join";

    if (isPayment) {
        borderColor = 'border-blue-500';
        iconBg = 'bg-blue-50 text-blue-500';
        Icon = Bell;
        title = t('action_required');
    } else if (isCancelled) {
        borderColor = 'border-red-500';
        iconBg = 'bg-red-50 text-red-500';
        Icon = CreditCard; // Or XCircle
        title = t('status.CANCELLED');
    }

    return (
        <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className={`bg-white border-l-4 ${borderColor} shadow-lg rounded-r-lg p-4 flex items-start gap-3`}>
                <div className={`${iconBg} p-2 rounded-full`}>
                    <Icon size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                        {title}
                    </h3>
                    <p className="text-gray-600 text-xs">{notification.message}</p>
                </div>
                <button
                    onClick={() => setNotification(null)}
                    className="ml-auto text-gray-400 hover:text-gray-600"
                >
                    &times;
                </button>
            </div>
        </div>
    );
}
