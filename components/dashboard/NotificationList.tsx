"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Bell, Video, CreditCard, Building2, FileText, AlertCircle, Send, CheckCircle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ko } from 'date-fns/locale';
import { useLocale } from 'next-intl';

interface Notification {
    id: string;
    type: string;
    message: string;
    key?: string | null;
    params?: string | null;
    createdAt: Date;
    isRead: boolean;
}

export default function NotificationList({ notifications }: { notifications: Notification[] }) {
    const t = useTranslations('Notifications');
    const locale = useLocale();
    const dateLocale = locale === 'ko' ? ko : enUS;

    if (notifications.length === 0) {
        return (
            <div className="p-8 text-center text-gray-400 bg-white rounded-2xl border border-gray-100 border-dashed">
                <Bell size={24} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">{t('no_notifications')}</p>
            </div>
        );
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'PAYMENT_REQUIRED':
            case 'PAYMENT_CONFIRMED':
                return { icon: CreditCard, bg: 'bg-blue-50', text: 'text-blue-500' };
            case 'PAYMENT_CANCELLED':
            case 'CANCELLED':
                return { icon: CreditCard, bg: 'bg-red-50', text: 'text-red-500' };
            case 'MEET_READY':
            case 'APPOINTMENT_CONFIRMED':
                return { icon: Video, bg: 'bg-green-50', text: 'text-green-500' };
            case 'APPOINTMENT_COMPLETED':
                return { icon: CheckCircle, bg: 'bg-gray-50', text: 'text-gray-500' };
            case 'PHARMACY_UPDATED':
                return { icon: Building2, bg: 'bg-purple-50', text: 'text-purple-500' };
            case 'FAX_SENT':
                return { icon: Send, bg: 'bg-indigo-50', text: 'text-indigo-500' };
            case 'FAX_FAILED':
                return { icon: AlertCircle, bg: 'bg-red-50', text: 'text-red-500' };
            default:
                return { icon: Bell, bg: 'bg-gray-50', text: 'text-gray-500' };
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {notifications.map((notification) => {
                const style = getIcon(notification.type);
                const Icon = style.icon;

                let title = t('notification');
                if (notification.type.includes('PAYMENT')) title = t('action_required'); // Simplified mapping, customize as needed
                else if (notification.type.includes('MEET')) title = t('meet_ready');
                else if (notification.type.includes('FAX')) title = "Fax";

                // Resolve Message
                let displayMessage = notification.message;
                if (notification.key) {
                    try {
                        const params = notification.params ? (typeof notification.params === 'string' ? JSON.parse(notification.params) : notification.params) : {};
                        // Check if translation exists, otherwise fallback to message
                        // Note: useTranslations will return the key if missing in some setups, or we can catch error
                        // Here we assume key exists if provided.
                        let key = notification.key;
                        if (key && key.startsWith('Notifications.')) {
                            key = key.replace('Notifications.', '');
                        }
                        displayMessage = t(key as any, params);
                    } catch (e) {
                        // Fallback to raw message if parsing fails
                    }
                }

                return (
                    <div key={notification.id} className="p-4 flex items-start gap-3 hover:bg-gray-50/50 transition-colors">
                        <div className={`${style.bg} ${style.text} p-2 rounded-xl mt-0.5`}>
                            <Icon size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{displayMessage}</p>
                            <p className="text-[10px] text-gray-400 mt-1.5">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: dateLocale })}
                            </p>
                        </div>
                        {!notification.isRead && (
                            <span className="w-2 h-2 bg-red-500 rounded-full mt-2"></span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
