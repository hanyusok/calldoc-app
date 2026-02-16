'use client';

import { useState, useEffect, useRef } from 'react';
import { getUnreadNotifications, markNotificationAsRead } from '@/app/actions/notification';
import { useRouter } from 'next/navigation';
import { Bell, X, CheckCircle, ExternalLink } from 'lucide-react';

interface Notification {
    id: string;
    message: string;
    isRead: boolean;
    link?: string | null;
    createdAt: Date;
    type?: string;
}

export default function NotificationToast() {
    const [visible, setVisible] = useState(false);
    const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
    const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
    const [isInitialized, setIsInitialized] = useState(false);
    const router = useRouter();

    const fetchNotifications = async () => {
        try {
            const data = await getUnreadNotifications();

            // On first load, just record the IDs so we don't popup for old stuff
            if (!isInitialized) {
                const ids = new Set(data.map(n => n.id));
                setKnownIds(ids);
                setIsInitialized(true);
                return;
            }

            // Check for new IDs
            const newItems = data.filter(n => !knownIds.has(n.id));

            if (newItems.length > 0) {
                // Show the most recent new one
                const latest = newItems[0];
                setCurrentNotification(latest);
                setVisible(true);

                // Update known IDs
                const updatedIds = new Set(knownIds);
                newItems.forEach(n => updatedIds.add(n.id));
                setKnownIds(updatedIds);

                // Auto hide after 6 seconds
                setTimeout(() => {
                    setVisible(false);
                }, 6000);
            }
        } catch (error) {
            console.error("Toast Polling error:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [isInitialized, knownIds]);

    const handleClick = async () => {
        if (!currentNotification) return;

        setVisible(false);
        await markNotificationAsRead(currentNotification.id);

        if (currentNotification.link) {
            router.push(currentNotification.link);
        }
    };

    const handleDismiss = (e: React.MouseEvent) => {
        e.stopPropagation();
        setVisible(false);
    };

    if (!visible || !currentNotification) return null;

    return (
        <div
            className="fixed top-4 right-4 z-[100] animate-in slide-in-from-right-full duration-500 fade-in cursor-pointer group"
            onClick={handleClick}
        >
            <div className="bg-white border-l-4 border-blue-600 shadow-2xl rounded-r-xl p-4 flex items-start gap-4 w-96 transform transition-all hover:scale-102 hover:shadow-blue-900/10">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-full flex-shrink-0 animate-pulse">
                    <Bell size={24} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">
                            New Request
                        </h4>
                        <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded">
                            Just now
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {currentNotification.message}
                    </p>
                    {currentNotification.link && (
                        <div className="mt-2 text-xs font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                            View Details <ExternalLink size={10} />
                        </div>
                    )}
                </div>
                <button
                    onClick={handleDismiss}
                    className="text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-full p-1 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
