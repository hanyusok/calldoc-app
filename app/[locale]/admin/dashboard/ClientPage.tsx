'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, Filter } from 'lucide-react';
import { useDebounce } from '@/app/lib/hooks';
import AppointmentActions from './AppointmentActions';
import AppointmentModal from '@/components/admin/AppointmentModal';

export default function ClientPage({ initialAppointments, search, status }: any) {
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
                <div className="flex items-center gap-2 w-full md:w-auto flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search patients, doctors..."
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
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="AWAITING_PAYMENT">Awaiting Payment</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                    <Plus size={20} />
                    New Appointment
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="p-4">Patient</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Doctor</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Price</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {initialAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-400">
                                        No appointments found.
                                    </td>
                                </tr>
                            ) : (
                                initialAppointments.map((apt: any) => (
                                    <tr key={apt.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">
                                            <div>{apt.user.name}</div>
                                            <div className="text-xs text-gray-500">{apt.user.email}</div>
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            <div suppressHydrationWarning>{new Date(apt.date).toLocaleDateString()}</div>
                                            <div className="text-xs text-gray-500" suppressHydrationWarning>
                                                {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            <div>{apt.doctor.name}</div>
                                            <div className="text-xs text-gray-500">{apt.doctor.specialty}</div>
                                        </td>
                                        <td className="p-4">
                                            <StatusBadge status={apt.status} />
                                        </td>
                                        <td className="p-4 text-right font-medium text-gray-900">
                                            {apt.price ? `$${apt.price}` : '-'}
                                        </td>
                                        <td className="p-4 flex justify-center">
                                            <AppointmentActions appointment={apt} />
                                        </td>
                                    </tr>
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

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
        AWAITING_PAYMENT: 'bg-blue-50 text-blue-700 border-blue-100',
        CONFIRMED: 'bg-green-50 text-green-700 border-green-100',
        COMPLETED: 'bg-gray-100 text-gray-700 border-gray-200',
        CANCELLED: 'bg-red-50 text-red-700 border-red-100',
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.PENDING}`}>
            {status.replace('_', ' ')}
        </span>
    );
}
