"use client";

import { useState } from "react";
import { updateAppointment } from "@/app/actions/appointment";
import { Loader2, DollarSign, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { AppointmentStatus } from "@prisma/client";

export default function PriceManager({
    appointmentId,
    currentPrice
}: {
    appointmentId: string,
    currentPrice?: number | null
}) {
    // using 'Admin.price_manager' namespace
    const t = useTranslations('Admin.price_manager');
    const [price, setPrice] = useState(currentPrice || 0);
    const [loading, setLoading] = useState(false);

    const handleRequestPayment = async () => {
        if (!price || price <= 0) {
            alert(t('invalid_price'));
            return;
        }

        if (!confirm(t('confirm_request', { price }))) return;

        setLoading(true);
        try {
            // Updating price and setting status to AWAITING_PAYMENT
            await updateAppointment(appointmentId, {
                price: Number(price),
                status: AppointmentStatus.AWAITING_PAYMENT
            });
            alert(t('success_request'));
        } catch (error) {
            console.error(error);
            alert(t('error_request'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-white shadow-sm h-full">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-800">
                <DollarSign size={18} />
                {t('title')}
            </h3>

            <div className="flex flex-col gap-3">
                <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg border border-amber-100">
                    {t('description')}
                </div>

                <div className="relative">
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={price === 0 && !loading ? '' : price}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setPrice(isNaN(val) ? 0 : val);
                        }}
                        className="block w-full pl-3 pr-12 py-2 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 border"
                        placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">(원)</span>
                    </div>
                </div>

                <button
                    onClick={handleRequestPayment}
                    disabled={loading || price <= 0}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors font-medium"
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    {t('request_payment')}
                </button>
            </div>
        </div>
    );
}
