"use client";

import { useEffect, useState } from 'react';
import { checkNewNotifications } from '@/app/actions/notification';
import { checkAppointmentNotifications } from '@/app/[locale]/(mobile)/myappointment/actions'; // Keep for legacy/immediate checks if needed
import { useRouter } from 'next/navigation';
import { Bell, Video, CreditCard, Building2, FileText, AlertCircle, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface NotificationWatcherProps {
    initialConfirmedIds?: string[];
    messages?: Record<string, string>;
}

export default function NotificationWatcher({ initialConfirmedIds = [], messages }: NotificationWatcherProps) {
    const router = useRouter();
    const t = useTranslations('Notifications');
    const [knownIds, setKnownIds] = useState<string[]>(initialConfirmedIds);
    const [notification, setNotification] = useState<{
        message?: string;
        key?: string;
        params?: string; // serialized JSON
        id: string;
        type: string;
    } | null>(null);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                // 1. Check Unified Notifications (Persistent DB)
                const newNotices = await checkNewNotifications();

                // 2. Check Appointment Status (Legacy Polling for real-time status changes not via notification table yet)
                // Note: We might want to move fully to DB notifications eventually
                const appointmentNotices = await checkAppointmentNotifications(knownIds);

                // Combine
                const allNotices = [...newNotices, ...appointmentNotices];

                if (allNotices.length > 0) {
                    const latest = allNotices[0] as any;

                    setNotification({
                        message: latest.message,
                        key: latest.key,
                        params: latest.params,
                        id: latest.id,
                        type: latest.type
                    });

                    // Update known IDs for appointment polling to avoid loops
                    // For DB notifications, they are marked read by the action, so won't reappear
                    if (latest.type.includes('PAYMENT') || latest.type.includes('MEET')) {
                        setKnownIds(prev => [...prev, latest.id]);
                    }

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
    }, [knownIds, router]);

    if (!notification) return null;

    // Determine styles based on type
    let borderColor = 'border-blue-500';
    let iconBg = 'bg-blue-50 text-blue-500';
    let Icon = Bell;
    let title = t('notification'); // Default title

    switch (notification.type) {
        case 'PAYMENT_REQUIRED':
        case 'PAYMENT_CONFIRMED':
            borderColor = 'border-blue-500';
            iconBg = 'bg-blue-50 text-blue-500';
            Icon = Bell;
            title = t('payment_confirmed_title');
            break;
        case 'PAYMENT_CANCELLED':
        case 'CANCELLED':
            borderColor = 'border-red-500';
            iconBg = 'bg-red-50 text-red-500';
            Icon = CreditCard;
            title = t('payment_cancelled_title');
            break;
        case 'MEET_READY':
        case 'APPOINTMENT_CONFIRMED':
            borderColor = 'border-green-500';
            iconBg = 'bg-green-50 text-green-500';
            Icon = Video;
            title = t('meet_ready'); // Ensure key exists or use fallback
            break;
        case 'APPOINTMENT_COMPLETED':
            borderColor = 'border-gray-500';
            iconBg = 'bg-gray-50 text-gray-500';
            Icon = FileText;
            title = t('appointment_completed_title');
            break;
        case 'PHARMACY_UPDATED':
            borderColor = 'border-purple-500';
            iconBg = 'bg-purple-50 text-purple-500';
            Icon = Building2;
            title = t('pharmacy_updated_title');
            break;
        case 'FAX_SENT':
            borderColor = 'border-indigo-500';
            iconBg = 'bg-indigo-50 text-indigo-500';
            Icon = Send;
            title = t('fax_sent_title');
            break;
        case 'FAX_FAILED':
            borderColor = 'border-red-500';
            iconBg = 'bg-red-50 text-red-500';
            Icon = AlertCircle;
            title = t('fax_failed_title');
            break;
        default:
            borderColor = 'border-blue-500';
            iconBg = 'bg-blue-50 text-blue-500';
            Icon = Bell;
    }

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
            console.error("Failed to parse notification params", e);
        }
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


