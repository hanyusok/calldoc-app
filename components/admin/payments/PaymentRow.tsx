"use client";

import { useTranslations, useFormatter } from 'next-intl';
import CancelPaymentButton from './CancelPaymentButton';

interface PaymentRowProps {
    payment: any;
}

export default function PaymentRow({ payment }: PaymentRowProps) {
    const t = useTranslations('Admin.payments');
    const tStatus = useTranslations('Admin.status');
    const format = useFormatter();

    const getStatusBadge = (status: string) => {
        let colorClass = 'bg-gray-100 text-gray-800';
        switch (status) {
            case 'PENDING':
                colorClass = 'bg-yellow-100 text-yellow-800';
                break;
            case 'COMPLETED':
                colorClass = 'bg-green-100 text-green-800';
                break;
            case 'CANCELLED':
                colorClass = 'bg-red-100 text-red-800';
                break;
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                {tStatus(status)}
            </span>
        );
    };

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="p-4">
                <div className="font-medium text-gray-900">{payment.appointment.user.name}</div>
                <div className="text-xs text-gray-500">{payment.appointment.user.email}</div>
            </td>
            <td className="p-4 text-gray-600" suppressHydrationWarning>
                {format.dateTime(new Date(payment.requestedAt), {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric'
                })}
            </td>
            <td className="p-4 text-gray-900 font-medium">
                {payment.appointment.doctor.name}
                <div className="text-xs text-gray-500">{payment.appointment.doctor.department}</div>
            </td>
            <td className="p-4">
                <div className="font-mono text-xs text-gray-500">{payment.paymentKey || '-'}</div>
                <div className="text-xs font-semibold text-gray-700">{payment.method}</div>
            </td>
            <td className="p-4 text-center">
                {getStatusBadge(payment.status)}
            </td>
            <td className="p-4 text-right font-bold text-gray-900">
                ${payment.amount.toLocaleString()}
            </td>
            <td className="p-4 text-center">
                {payment.status === 'COMPLETED' && (
                    <CancelPaymentButton
                        paymentId={payment.id}
                        amount={payment.amount}
                        label={t('actions.cancel')}
                        confirmMsg={t('actions.cancelConfirm')}
                    />
                )}
            </td>
        </tr>
    );
}
