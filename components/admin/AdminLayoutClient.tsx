
"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

import AdminNotificationWatcher from "@/components/admin/appointments/AdminNotificationWatcher";

export default function AdminLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminNotificationWatcher />
            <AdminSidebar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
            <main
                className={`flex-1 p-8 transition-all duration-300 ease-in-out ${isCollapsed ? "ml-20" : "ml-64"
                    }`}
            >
                {children}
            </main>
        </div>
    );
}
