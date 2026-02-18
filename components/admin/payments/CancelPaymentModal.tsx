"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cancelPayment } from "@/app/actions/payment";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

interface CancelPaymentModalProps {
    paymentId: string;
    amount: number;
    refundedAmount: number;
    status: string;
    onClose: () => void;
}

export default function CancelPaymentModal({
    paymentId,
    amount,
    refundedAmount,
    status,
    onClose
}: CancelPaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [cancelType, setCancelType] = useState<'FULL' | 'PARTIAL'>('FULL');
    const [partialAmount, setPartialAmount] = useState<string>('');
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const t = useTranslations('Admin.payments.actions');

    useEffect(() => {
        setMounted(true);
        // Prevent scrolling when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
            console.log("Modal unmounting, resetting overflow");
        };
    }, []);

    const remainingAmount = amount - refundedAmount;
    const isPending = status === 'PENDING';

    const handleCancel = async (e: React.FormEvent) => {
        e.preventDefault();

        let requestAmount = remainingAmount;
        if (!isPending) {
            requestAmount = cancelType === 'FULL' ? remainingAmount : parseInt(partialAmount);

            if (cancelType === 'PARTIAL') {
                if (!requestAmount || requestAmount <= 0) {
                    alert(t('invalidAmount'));
                    return;
                }
                if (requestAmount > remainingAmount) {
                    alert(t('exceedsAmount'));
                    return;
                }
            }
        }

        const confirmMessage = isPending
            ? t('cancelPendingConfirm')
            : (cancelType === 'FULL' ? t('cancelConfirm') : t('partialCancelConfirm', { amount: requestAmount }));

        if (!confirm(confirmMessage)) return;

        setLoading(true);
        try {
            // For PENDING, backend handles logic to just void
            const result = await cancelPayment(paymentId, "Admin Manual Cancel", isPending ? undefined : requestAmount);

            if (result.success) {
                alert(t('cancelSuccess'));
                router.refresh();
                onClose();
            } else {
                const isErrorCode = /^[A-Z_]+$/.test(result.error || "");
                const errorMessage = isErrorCode
                    ? t(`errors.${result.error}`)
                    : (result.error || t('error'));

                alert(t('cancelFailed') + ": " + errorMessage);
            }
        } catch (e) {
            console.error(e);
            alert(t('error'));
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-lg">{isPending ? t('cancelPendingTitle') : t('cancelPayment')}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleCancel} className="p-4 space-y-4">
                    {isPending ? (
                        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800 text-sm">
                            {t('cancelPendingDescription')}
                        </div>
                    ) : (
                        <>
                            <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t('totalAmount')}</span>
                                    <span className="font-medium">{amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t('refundedAmount')}</span>
                                    <span className="text-red-600 font-medium">-{refundedAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 mt-2">
                                    <span className="font-medium">{t('refundableAmount')}</span>
                                    <span className="font-bold text-blue-600">{remainingAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setCancelType('FULL')}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${cancelType === 'FULL' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {t('fullRefund')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCancelType('PARTIAL')}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${cancelType === 'PARTIAL' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {t('partialRefund')}
                                </button>
                            </div>

                            {cancelType === 'PARTIAL' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('refundAmount')}
                                    </label>
                                    <input
                                        type="number"
                                        value={partialAmount}
                                        onChange={(e) => setPartialAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        max={remainingAmount}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>
                            )}
                        </>
                    )}

                    <div className="pt-2 flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                        >
                            {loading ? t('processing') : (isPending ? t('confirmCancel') : t('confirmRefund'))}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
