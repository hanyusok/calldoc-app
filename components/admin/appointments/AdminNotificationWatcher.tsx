'use client';

import { useEffect, useState } from 'react';
import { checkNewPaidAppointments } from '@/app/actions/payment';
import { useRouter } from 'next/navigation';
import { Bell, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AdminNotificationWatcher() {
    const t = useTranslations('Notifications');
    const router = useRouter();
    const [knownPaymentIds, setKnownPaymentIds] = useState<string[]>([]);
    const [notification, setNotification] = useState<{
        message: string;
        id: string;
        type: string;
        key?: string;
        params?: string;
    } | null>(null);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const newPayments = await checkNewPaidAppointments(knownPaymentIds);

                if (newPayments.length > 0) {
                    const latest = newPayments[0] as any;

                    setNotification({
                        message: latest.message || `New Payment: ${latest.appointment.user.name} - ${latest.amount.toLocaleString()} KRW`,
                        id: latest.id,
                        type: 'PAYMENT_CONFIRMED',
                        key: latest.key || 'Notifications.payment_confirmed_admin',
                        params: latest.params || JSON.stringify({
                            user: latest.appointment.user.name,
                            doctor: latest.appointment.doctor.name
                        })
                    });

                    // Update known IDs
                    const newIds = newPayments.map(p => p.id);
                    setKnownPaymentIds(prev => [...prev, ...newIds]);

                    // Refresh page
                    router.refresh();

                    // Hide after 5 sec
                    setTimeout(() => setNotification(null), 5000);
                }
            } catch (error) {
                console.error("Admin Polling error:", error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [knownPaymentIds, router]);

    if (!notification) return null;

    // Resolve Style & Title
    let title = t('notification');
    if (notification.type === 'PAYMENT_CONFIRMED') title = t('payment_confirmed_title');
    else if (notification.type === 'APPOINTMENT_REQUEST') title = t('appointment_request_title');

    // Resolve Message
    let displayMessage = notification.message;
    if (notification.key) {
        try {
            const params = notification.params ? (typeof notification.params === 'string' ? JSON.parse(notification.params) : notification.params) : {};
            let key = notification.key;
            if (key.startsWith('Notifications.')) {
                key = key.replace('Notifications.', '');
            }
            displayMessage = t(key as any, params);
        } catch (e) {
            console.error("Failed to parse admin notification params", e);
        }
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="bg-white border-l-4 border-green-500 shadow-lg rounded-r-lg p-4 flex items-start gap-3 w-80">
                <div className="bg-green-50 text-green-500 p-2 rounded-full">
                    <CheckCircle size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
                    <p className="text-gray-600 text-xs text-left">{displayMessage}</p>
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
