"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import PopupCloseHandler from "@/components/payment/PopupCloseHandler";
import { useEffect, useState } from "react";
import { getPaymentStatus } from "@/app/actions/payment";

export default function PaymentSuccessPage() {
    const t = useTranslations('PaymentSuccess');
    const locale = useLocale();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId') || searchParams.get('ORDERNO');
    const amount = searchParams.get('amount') || searchParams.get('AMOUNT');

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [dots, setDots] = useState('');
    const redirectUrl = `/${locale}/myappointment`;

    // Polling Logic
    useEffect(() => {
        if (!orderId) {
            setStatus('error');
            return;
        }

        let attempts = 0;
        const maxAttempts = 20; // 2 seconds * 20 = 40 seconds max wait
        const intervalTime = 2000;

        const checkStatus = async () => {
            try {
                const result = await getPaymentStatus(orderId);

                if (result.success && result.status === 'COMPLETED') {
                    setStatus('success');
                    return true; // Stop polling
                } else if (result.success && result.status === 'CANCELLED') {
                    setStatus('error');
                    return true;
                }
            } catch (error) {
                console.error("Error checking payment status", error);
            }
            return false;
        };

        // Initial check immediately
        checkStatus().then(done => {
            if (done) return;

            const interval = setInterval(async () => {
                attempts++;
                const isDone = await checkStatus();

                if (isDone) {
                    clearInterval(interval);
                } else if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    // Time out handling: Assume success or ask user to check manually? 
                    // Better to stay on verifying or show a "taking longer than expected" message.
                    // For now, let's keep it simple: if it times out, we can't confirm success here.
                    // But in many cases the callback might just be slow. 
                    // Let's show a specific timeout state or just Error.
                    setStatus('error');
                }
            }, intervalTime);

            return () => clearInterval(interval);
        });

    }, [orderId]);

    // Simple dot animation for loading state
    useEffect(() => {
        if (status !== 'verifying') return;
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);
        return () => clearInterval(interval);
    }, [status]);


    // Loading / Verifying State
    if (status === 'verifying') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
                    <div className="flex justify-center">
                        <Loader2 className="w-16 h-16 text-primary-500 animate-spin" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-gray-900">{t('verifying_title')}</h1>
                        <p className="text-gray-500">{t('verifying_desc')}{dots}</p>
                    </div>
                    <div className="text-sm text-gray-400 pt-4">
                        (Order ID: {orderId})
                    </div>
                </div>
            </div>
        );
    }

    // Success State
    if (status === 'success') {
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

    // Error State
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
                <div className="space-y-2">
                    <h1 className="text-xl font-bold text-red-600">Verification Failed</h1>
                    <p className="text-gray-500">
                        The payment could not be verified automatically. <br />
                        Please check "My Appointments" to see the status.
                    </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-left space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{t('order_id')}</span>
                        <span className="font-medium">{orderId}</span>
                    </div>
                </div>
                <Link
                    href={redirectUrl}
                    className="block w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
                >
                    {t('return_button')}
                </Link>
            </div>
        </div>
    );
}
