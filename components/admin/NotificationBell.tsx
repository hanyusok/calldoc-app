'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { getUnreadNotifications, markNotificationAsRead } from '@/app/actions/notification';
import { useRouter } from 'next/navigation';

interface Notification {
    id: string;
    message: string;
    isRead: boolean;
    link?: string | null;
    createdAt: Date;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Simple click outside handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const fetchNotifications = async () => {
        try {
            const data = await getUnreadNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const handleNotificationClick = async (notification: Notification) => {
        await markNotificationAsRead(notification.id);
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        setIsOpen(false);
        if (notification.link) {
            router.push(notification.link);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100"
            >
                <Bell size={20} />
                {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
                        <span className="text-xs text-gray-500">{notifications.length} new</span>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                No new notifications
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-50">
                                {notifications.map((notification) => (
                                    <li key={notification.id}>
                                        <button
                                            onClick={() => handleNotificationClick(notification)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3"
                                        >
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-800 line-clamp-2">{notification.message}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
