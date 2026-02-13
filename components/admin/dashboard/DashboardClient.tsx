
"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Users, Calendar, Building2, Syringe, FileText, ChevronRight, Activity, Clock, CheckCircle } from "lucide-react";

interface DashboardStats {
    totalAppointments: number;
    pendingAppointments: number;
    todayAppointments: number;
}

export default function DashboardClient({
    stats
}: {
    stats: DashboardStats;
}) {
    const t = useTranslations('Admin.dashboard');

    const quickLinks = [
        {
            href: "/admin/dashboard/appointments",
            label: t('manage_appointment'),
            icon: Calendar,
            color: "bg-blue-500",
            description: t('desc_appointments')
        },
        {
            href: "/admin/dashboard/users",
            label: t('users'),
            icon: Users,
            color: "bg-green-500",
            description: t('desc_users')
        },
        {
            href: "/admin/dashboard/patients",
            label: t('patients'),
            icon: Users,
            color: "bg-orange-500",
            description: t('desc_patients')
        },
        {
            href: "/admin/dashboard/vaccinations",
            label: t('vaccinations'),
            icon: Syringe,
            color: "bg-yellow-500",
            description: t('desc_vaccinations')
        },
        {
            href: "/admin/dashboard/pharmacies",
            label: t('pharmacies'),
            icon: Building2,
            color: "bg-purple-500",
            description: t('desc_pharmacies')
        },
        {
            href: "/admin/dashboard/posts",
            label: t('posts'),
            icon: FileText,
            color: "bg-pink-500",
            description: t('desc_posts')
        }
    ];

    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('upcoming')}</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAppointments}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full">
                        <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('pending')}</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingAppointments}</h3>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-full">
                        <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('today_visits')}</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.todayAppointments}</h3>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">{t('quick_access')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quickLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 flex items-start gap-4"
                            >
                                <div className={`p-3 rounded-lg ${link.color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                                    <Icon className={`w-6 h-6 ${link.color.replace('bg-', 'text-')}`} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900">{link.label}</h3>
                                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{link.description}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
