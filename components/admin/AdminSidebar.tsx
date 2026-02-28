"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LayoutDashboard, Calendar, Building2, Settings, LogOut, Users, FileText, ChevronLeft, ChevronRight, Syringe, CreditCard, Video, Stethoscope, Printer } from "lucide-react";
import NotificationBell from "@/components/admin/NotificationBell";

interface AdminSidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    role?: string;
}

export default function AdminSidebar({ isCollapsed, toggleSidebar, role }: AdminSidebarProps) {
    const t = useTranslations('Admin.nav');
    const pathname = usePathname();

    const isActive = (path: string) => pathname?.includes(path);

    const allNavItems = [
        { href: "/admin/dashboard", label: t('dashboard'), icon: LayoutDashboard },
        { type: 'divider' },
        { href: "/admin/dashboard/appointments", label: t('appointments'), icon: Calendar },
        { href: "/admin/dashboard/meet", label: t('meet'), icon: Video },
        { href: "/admin/dashboard/vaccinations", label: t('vaccinations'), icon: Syringe },
        { href: "/admin/dashboard/fax", label: t('fax'), icon: Printer },
        { href: "/admin/dashboard/payments", label: t('payments'), icon: CreditCard },
        { type: 'divider' },
        { href: "/admin/dashboard/users", label: t('users'), icon: Users },
        { href: "/admin/dashboard/patients", label: t('patients'), icon: Users },
        { href: "/admin/dashboard/doctors", label: t('doctors'), icon: Stethoscope },
        { href: "/admin/dashboard/clinics", label: t('clinics') || "Clinics", icon: Building2 },
        { href: "/admin/dashboard/pharmacies", label: t('pharmacies'), icon: Building2 },
        { href: "/admin/dashboard/posts", label: t('posts'), icon: FileText },
        { type: 'divider' },
        { href: "/admin/dashboard/settings", label: t('settings'), icon: Settings },
    ];

    const navItems = role === 'STAFF'
        ? allNavItems.filter(item =>
            // Keep dividers or the appointments link
            (item as any).type === 'divider' || (item as any).href === "/admin/dashboard/appointments"
        ).filter((item, index, array) => {
            // Clean up consecutive dividers
            if ((item as any).type === 'divider') {
                const isFirst = index === 0;
                const isLast = index === array.length - 1;
                const isConsecutive = index > 0 && (array[index - 1] as any).type === 'divider';
                return !isFirst && !isLast && !isConsecutive;
            }
            return true;
        })
        : allNavItems;

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
                <div className="flex items-center gap-2">
                    <NotificationBell />
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>
            </div>

            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item, index) => {
                    if ('type' in item && item.type === 'divider') {
                        return <hr key={`divider-${index}`} className="my-4 border-gray-100" />;
                    }

                    const navItem = item as { href: string; label: string; icon: any };
                    const Icon = navItem.icon;
                    const active = isActive(navItem.href);
                    return (
                        <Link
                            key={navItem.href}
                            href={navItem.href}
                            title={isCollapsed ? navItem.label : undefined}
                            className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${active
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                } ${isCollapsed ? "justify-center" : ""}`}
                        >
                            <Icon className={`h-5 w-5 ${active ? "text-blue-700" : "text-gray-400"} ${isCollapsed ? "" : "mr-3"}`} />
                            {!isCollapsed && <span className="truncate">{navItem.label}</span>}
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
