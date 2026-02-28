
"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

import AdminNotificationWatcher from "@/components/admin/appointments/AdminNotificationWatcher";
import NotificationToast from "@/components/admin/NotificationToast";

export default function AdminLayoutClient({
    children,
    role,
}: {
    children: React.ReactNode;
    role?: string;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminNotificationWatcher />
            <NotificationToast />
            <AdminSidebar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} role={role} />
            <main
                className={`flex-1 p-8 transition-all duration-300 ease-in-out ${isCollapsed ? "ml-20" : "ml-64"
                    }`}
            >
                {children}
            </main>
        </div>
    );
}
