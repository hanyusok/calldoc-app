"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import AppointmentModal from '@/components/admin/appointments/AppointmentModal';
import AppointmentRow from '@/components/admin/appointments/AppointmentRow';
import { useTranslations, useFormatter } from 'next-intl';

interface AppointmentsClientProps {
    initialAppointments: any[];
    initialTotal: number;
    initialPage: number;
    search?: string;
    status?: string;
}

export default function AppointmentsClient({ initialAppointments, initialTotal, initialPage, search, status }: AppointmentsClientProps) {
    const t = useTranslations('Admin.nav');
    const tDash = useTranslations('Admin.dashboard');
    const tStatus = useTranslations('Admin.status');
    const router = useRouter();
    const searchParams = useSearchParams();

    // Check if initialAppointments is undefined or null, and default to empty array
    const appointments = initialAppointments || [];

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(search || '');
    const [statusFilter, setStatusFilter] = useState(status || 'ALL');

    // Debounce search/filter updates
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            const currentQ = params.get('q') || '';
            const currentStatus = params.get('status') || 'ALL';

            // Only update if values actually changed
            if (currentQ !== searchTerm || currentStatus !== statusFilter) {
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

                // Reset to page 1 on new search/filter
                params.set('page', '1');

                router.push(`?${params.toString()}`);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter]); // Removed router, searchParams to avoid loop

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`?${params.toString()}`);
    };

    const totalPages = Math.ceil(initialTotal / 10);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t('appointments')}</h1>
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
                            <option value="AWAITING_PAYMENT">{tStatus('AWAITING_PAYMENT')}</option>
                            <option value="CONFIRMED">{tStatus('CONFIRMED')}</option>
                            <option value="COMPLETED">{tStatus('COMPLETED')}</option>
                            <option value="CANCELLED">{tStatus('CANCELLED')}</option>
                        </select>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                    <Plus size={20} />
                    {tDash('new_appointment')}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="p-4">{tDash('table.patient')}</th>
                                <th className="p-4">{tDash('table.date')}</th>
                                <th className="p-4">{tDash('table.doctor')}</th>
                                <th className="p-4">{tDash('table.status')}</th>
                                <th className="p-4 text-right">{tDash('table.price')}</th>
                                <th className="p-4 text-center">{tDash('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {appointments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-400">
                                        {tDash('empty_state')}
                                    </td>
                                </tr>
                            ) : (
                                appointments.map((apt: any) => (
                                    <AppointmentRow key={apt.id} appointment={apt} />
                                ))
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
