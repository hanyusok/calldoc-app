"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import PopupCloseHandler from "@/components/payment/PopupCloseHandler";

export default function PaymentSuccessPage() {
    const t = useTranslations('PaymentSuccess');
    const locale = useLocale();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    const redirectUrl = `/${locale}/myappointment`;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <PopupCloseHandler redirectUrl={redirectUrl} />

            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                    <p className="text-gray-500">{t('description')}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl text-left space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{t('order_id')}</span>
                        <span className="font-medium">{orderId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{t('amount')}</span>
                        <span className="font-medium">{parseInt(amount || '0').toLocaleString()} KRW</span>
                    </div>
                </div>

                <div className="pt-4">
                    <Link
                        href={redirectUrl}
                        className="block w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition"
                    >
                        {t('return_button')}
                    </Link>
                    <p className="text-xs text-gray-400 mt-4">
                        {t('redirecting')}
                    </p>
                </div>
            </div>
        </div>
    );
}
