"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
import PaymentRow from '@/components/admin/payments/PaymentRow';
import { useTranslations } from 'next-intl';

interface PaymentsClientProps {
    initialPayments: any[];
    initialTotal: number;
    initialPage: number;
    status?: string;
}

export default function PaymentsClient({
    initialPayments,
    initialTotal,
    initialPage,
    status
}: PaymentsClientProps) {
    const t = useTranslations('Admin.payments');
    const tStatus = useTranslations('Admin.status');
    const router = useRouter();
    const searchParams = useSearchParams();

    const [statusFilter, setStatusFilter] = useState(status || 'ALL');

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`?${params.toString()}`);
    };

    const handleStatusChange = (newStatus: string) => {
        setStatusFilter(newStatus);
        const params = new URLSearchParams(searchParams.toString());
        if (newStatus !== 'ALL') {
            params.set('status', newStatus);
        } else {
            params.delete('status');
        }
        params.set('page', '1');
        router.push(`?${params.toString()}`);
    };

    const totalPages = Math.ceil(initialTotal / 10);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t('title')}</h1>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-2 w-full md:w-auto flex-1">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select
                            className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                            value={statusFilter}
                            onChange={(e) => handleStatusChange(e.target.value)}
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">{tStatus('PENDING')}</option>
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
                                <th className="p-4">{t('table.patient')}</th>
                                <th className="p-4">{t('table.date')}</th>
                                <th className="p-4">{t('table.doctor')}</th>
                                <th className="p-4">{t('table.transaction')}</th>
                                <th className="p-4 text-center">{t('table.status')}</th>
                                <th className="p-4 text-right">{t('table.amount')}</th>
                                <th className="p-4 text-center">{t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {initialPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-400">
                                        {t('empty')}
                                    </td>
                                </tr>
                            ) : (
                                initialPayments.map((payment: any) => (
                                    <PaymentRow key={payment.id} payment={payment} />
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
        </div>
    );
}
