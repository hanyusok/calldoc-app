"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LayoutDashboard, Calendar, Building2, Settings, LogOut, Users, FileText, ChevronLeft, ChevronRight } from "lucide-react";

interface AdminSidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

export default function AdminSidebar({ isCollapsed, toggleSidebar }: AdminSidebarProps) {
    const t = useTranslations('Admin.nav');
    const pathname = usePathname();

    const isActive = (path: string) => pathname?.includes(path);

    const navItems = [
        { href: "/admin/dashboard", label: t('dashboard'), icon: LayoutDashboard },
        { href: "/admin/users", label: t('users'), icon: Users },
        { href: "/admin/appointments", label: t('appointments'), icon: Calendar },
        { href: "/admin/patients", label: t('patients'), icon: Users },
        { href: "/admin/pharmacies", label: t('pharmacies'), icon: Building2 },
        { href: "/admin/posts", label: t('posts'), icon: FileText },
        { href: "/admin/settings", label: t('settings'), icon: Settings },
    ];

    return (
        <aside
            className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 z-30 flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-64"
                }`}
        >
            <div className={`flex items-center h-16 px-4 border-b border-gray-200 ${isCollapsed ? "justify-center" : "justify-between"}`}>
                {!isCollapsed && (
                    <Link href="/admin/dashboard" className="text-xl font-bold text-blue-600 flex items-center gap-2 truncate">
                        <LayoutDashboard className="h-6 w-6 flex-shrink-0" />
                        CallDoc
                    </Link>
                )}
                {isCollapsed && (
                    <Link href="/admin/dashboard" className="text-blue-600">
                        <LayoutDashboard className="h-8 w-8" />
                    </Link>
                )}
                <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={isCollapsed ? item.label : undefined}
                            className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${active
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                } ${isCollapsed ? "justify-center" : ""}`}
                        >
                            <Icon className={`h-5 w-5 ${active ? "text-blue-700" : "text-gray-400"} ${isCollapsed ? "" : "mr-3"}`} />
                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-200">
                <button
                    className={`flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors ${isCollapsed ? "justify-center px-2" : ""
                        }`}
                    title={isCollapsed ? t('logout') : undefined}
                >
                    <LogOut className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
                    {!isCollapsed && t('logout')}
                </button>
            </div>
        </aside>
    );
}
