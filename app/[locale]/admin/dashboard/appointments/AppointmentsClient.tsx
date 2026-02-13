"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Stethoscope, Syringe } from 'lucide-react';
import AppointmentModal from '@/components/admin/appointments/AppointmentModal';
import AppointmentRow from '@/components/admin/appointments/AppointmentRow';
import VaccinationReservationRow from '@/components/admin/appointments/VaccinationReservationRow';
import { useTranslations, useFormatter } from 'next-intl';

interface AppointmentsClientProps {
    initialAppointments: any[];
    initialTotal: number;
    initialVacReservations: any[];
    initialVacTotal: number;
    initialPage: number;
    search?: string;
    status?: string;
    initialTab?: string;
}

export default function AppointmentsClient({
    initialAppointments,
    initialTotal,
    initialVacReservations,
    initialVacTotal,
    initialPage,
    search,
    status,
    initialTab = 'consultations'
}: AppointmentsClientProps) {
    const t = useTranslations('Admin.nav');
    const tDash = useTranslations('Admin.dashboard');
    const tStatus = useTranslations('Admin.status');
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchTerm, setSearchTerm] = useState(search || '');
    const [statusFilter, setStatusFilter] = useState(status || 'ALL');
    const [activeTab, setActiveTab] = useState(initialTab);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Aliases for compatibility with existing code
    const appointments = initialAppointments || [];

    // Debounce search/filter updates
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            const currentQ = params.get('q') || '';
            const currentStatus = params.get('status') || 'ALL';
            const currentTab = params.get('tab') || 'consultations';

            // Only update if values actually changed
            if (currentQ !== searchTerm || currentStatus !== statusFilter || currentTab !== activeTab) {
                if (searchTerm) {
                    params.set('q', searchTerm);
                } else {
                    params.delete('q');
                }

                if (statusFilter && statusFilter !== 'ALL') {
                    params.set('status', statusFilter);
                } else {
                    params.delete('status');
                }

                params.set('tab', activeTab);

                // Reset to page 1 on new search/filter/tab
                params.set('page', '1');

                router.push(`?${params.toString()}`);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter, activeTab]);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`?${params.toString()}`);
    };

    const totalPages = activeTab === 'consultations'
        ? Math.ceil(initialTotal / 10)
        : Math.ceil(initialVacTotal / 10);

    const isConsultations = activeTab === 'consultations';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t('appointments')}</h1>
                {isConsultations && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                    >
                        <Plus size={20} />
                        {tDash('new_appointment')}
                    </button>
                )}
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('consultations')}
                    className={`px-6 py-3 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 ${isConsultations
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Stethoscope size={18} />
                    Consultations
                </button>
                <button
                    onClick={() => setActiveTab('vaccinations')}
                    className={`px-6 py-3 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 ${!isConsultations
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Syringe size={18} />
                    Vaccinations
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-2 w-full md:w-auto flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder={tDash('search_placeholder')}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select
                            className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">{tDash('all_status')}</option>
                            <option value="PENDING">{tStatus('PENDING')}</option>
                            {!isConsultations && <option value="CONFIRMED">{tStatus('CONFIRMED')}</option>}
                            {isConsultations && <option value="AWAITING_PAYMENT">{tStatus('AWAITING_PAYMENT')}</option>}
                            {isConsultations && <option value="CONFIRMED">{tStatus('CONFIRMED')}</option>}
                            <option value="COMPLETED">{tStatus('COMPLETED')}</option>
                            <option value="CANCELLED">{tStatus('CANCELLED')}</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="p-4">{tDash('table.patient')}</th>
                                <th className="p-4">{tDash('table.date')}</th>
                                <th className="p-4">{isConsultations ? tDash('table.doctor') : 'Vaccine'}</th>
                                <th className="p-4 text-center">{tDash('table.status')}</th>
                                <th className="p-4 text-right">{tDash('table.price')}</th>
                                <th className="p-4 text-center">{tDash('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isConsultations ? (
                                initialAppointments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-400">
                                            {tDash('empty_state')}
                                        </td>
                                    </tr>
                                ) : (
                                    initialAppointments.map((apt: any) => (
                                        <AppointmentRow key={apt.id} appointment={apt} />
                                    ))
                                )
                            ) : (
                                initialVacReservations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-400">
                                            {tDash('empty_state')}
                                        </td>
                                    </tr>
                                ) : (
                                    initialVacReservations.map((vac: any) => (
                                        <VaccinationReservationRow key={vac.id} reservation={vac} />
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 flex justify-end gap-2 items-center">
                    <span className="text-sm text-gray-500 mr-4">
                        Page {initialPage} of {totalPages || 1}
                    </span>
                    <button
                        onClick={() => handlePageChange(initialPage - 1)}
                        disabled={initialPage <= 1}
                        className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => handlePageChange(initialPage + 1)}
                        disabled={initialPage >= totalPages}
                        className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <AppointmentModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}
