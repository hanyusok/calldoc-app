"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LayoutDashboard, Calendar, Building2, Settings, LogOut, Users } from "lucide-react";

export default function AdminNavbar() {
    const t = useTranslations('Admin.nav');
    const pathname = usePathname();

    const isActive = (path: string) => pathname?.includes(path);

    const navItems = [
        { href: "/admin/dashboard", label: t('dashboard'), icon: LayoutDashboard },
        { href: "/admin/users", label: t('users'), icon: Users },
        { href: "/admin/appointments", label: t('appointments'), icon: Calendar },
        { href: "/admin/patients", label: t('patients'), icon: Users },
        { href: "/admin/pharmacies", label: t('pharmacies'), icon: Building2 },
        { href: "/admin/posts", label: "Posts", icon: LayoutDashboard }, // TODO: Add translation
        { href: "/admin/settings", label: t('settings'), icon: Settings },
    ];

    return (
        <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0 left-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/admin/dashboard" className="text-xl font-bold text-blue-600">
                                CallDoc Admin
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${active
                                            ? "border-blue-500 text-gray-900"
                                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                            }`}
                                    >
                                        <Icon className="mr-2 h-4 w-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                            <span className="sr-only">{t('logout')}</span>
                            <LogOut className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
