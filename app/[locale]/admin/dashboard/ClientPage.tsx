'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, Filter } from 'lucide-react';
import AppointmentActions from './AppointmentActions';
import AppointmentModal from '@/components/admin/AppointmentModal';
import AppointmentRow from './AppointmentRow';
import { useTranslations } from 'next-intl';

export default function ClientPage({ initialAppointments, search, status }: any) {
    const t = useTranslations('Admin.nav'); // Using nav keys or common ones
    const tDash = useTranslations('Admin.dashboard');
    const tStatus = useTranslations('Admin.status');
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(search || '');
    const [statusFilter, setStatusFilter] = useState(status || 'ALL');

    // Simple debounce implementation if hook doesn't exist
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const currentParams = new URLSearchParams(searchParams.toString());
            const params = new URLSearchParams(searchParams.toString());

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

            // Only push if params have changed
            if (currentParams.toString() !== params.toString()) {
                router.push(`?${params.toString()}`);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter, router, searchParams]);

    return (
        <>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                {/* ... Keep Search/Filter UI ... */}
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
                            {initialAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-400">
                                        {tDash('empty_state')}
                                    </td>
                                </tr>
                            ) : (
                                initialAppointments.map((apt: any) => (
                                    <AppointmentRow key={apt.id} appointment={apt} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AppointmentModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </>
    );
}
