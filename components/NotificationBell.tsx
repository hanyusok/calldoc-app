"use client";

import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getUnreadNotifications } from '@/app/actions/notification';

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const notifications = await getUnreadNotifications();
            setUnreadCount(notifications.length);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Link href="/dashboard" className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <Bell size={20} />
            {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
        </Link>
    );
}
