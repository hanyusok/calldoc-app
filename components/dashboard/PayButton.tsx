'use client';

import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { initiatePayment } from '@/app/actions/payment';
import { getKiwoomHash } from '@/app/actions/kiwoom';

interface PayButtonProps {
    appointmentId: string;
    price: number;
}

export default function PayButton({ appointmentId, price }: PayButtonProps) {
    const t = useTranslations('Dashboard');
    const [loading, setLoading] = useState(false);
    const locale = useLocale();
    const router = useRouter();

    const handlePayment = async () => {
        try {
            setLoading(true);

            // 1. Initiate Payment (Create DB Record)
            const initResult = await initiatePayment(appointmentId);
            if (!initResult.success || !initResult.paymentId) {
                throw new Error(initResult.error || "Failed to initiate payment");
            }

            const { paymentId, amount, customerName } = initResult;

            // 2. Prepare Kiwoom Data
            const mid = process.env.NEXT_PUBLIC_KIWOOM_MID || "CTS11027";
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const payType = isMobile ? "M" : "P"; // M: Mobile, P: Popup

            const hashParams = {
                CPID: mid,
                PAYMETHOD: "CARD",
                ORDERNO: paymentId,
                TYPE: payType,
                AMOUNT: amount.toString()
            };

            const hashResult = await getKiwoomHash(hashParams);

            if (!hashResult.success || !hashResult.KIWOOM_ENC) {
                throw new Error(hashResult.error || "Failed to generate payment signature");
            }

            // 3. Create and Submit Form
            const form = document.createElement("form");
            form.method = "POST";
            form.action = process.env.NEXT_PUBLIC_KIWOOM_PAY_ACTION_URL || "https://apitest.kiwoompay.co.kr/pay/linkEnc";
            form.acceptCharset = "euc-kr";

            if (isMobile) {
                form.target = "_self";
            } else {
                form.target = "KiwoomPayPopup";
                window.open("", "KiwoomPayPopup", "width=468,height=750");
            }

            const addField = (name: string, value: string) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = name;
                input.value = value;
                form.appendChild(input);
            };

            addField("CPID", hashParams.CPID);
            addField("PAYMETHOD", hashParams.PAYMETHOD);
            addField("ORDERNO", hashParams.ORDERNO);
            addField("TYPE", hashParams.TYPE);
            addField("AMOUNT", hashParams.AMOUNT);
            addField("KIWOOM_ENC", hashResult.KIWOOM_ENC);

            // Additional required fields
            addField("PRODUCTNAME", initResult.productName || "Medical Consultation");
            addField("PRODUCTTYPE", "2"); // Service
            addField("USERID", customerName);

            const baseUrl = window.location.origin;
            const successUrl = `${baseUrl}/${locale}/payment/success?orderId=${paymentId}&amount=${amount}`;
            const failUrl = `${baseUrl}/${locale}/payment/fail`;

            addField("ReturnUrl", successUrl);
            addField("Ret_URL", successUrl);
            addField("HOMEURL", successUrl);
            addField("StopUrl", failUrl);

            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);

            // For PC, we stop loading after popup opens. For Mobile, page redirects.
            if (!isMobile) setLoading(false);

        } catch (error: any) {
            console.error("Payment Error:", error);
            alert(`Payment initialization failed: ${error?.message || "Unknown error"}`);
            setLoading(false);
        }
    };

    // DEBUG: Force Success Button (Keep existing dev tool)
    const handleSimulateSuccess = async () => {
        if (!confirm("Simulate successful payment for testing?")) return;

        setLoading(true);
        try {
            // Initiate first to ensure record exists
            const init = await initiatePayment(appointmentId);
            if (!init.success) throw new Error(init.error);

            const res = await fetch('/api/payment/callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ORDERNO: init.paymentId!,
                    AMOUNT: (init.amount || 0).toString(),
                    RES_CD: '0000',
                    PAYMETHOD: 'CARD',
                    AUTHNO: 'SIMULATED_AUTH',
                    DAOUTRX: `SIM-${Date.now()}`
                })
            });

            if (res.ok) {
                alert("Payment Confirmed (Simulated)");
                router.refresh();
            } else {
                alert("Simulation failed");
            }
        } catch (e) {
            console.error(e);
            alert("Simulation Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={handlePayment}
                disabled={loading}
                className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary-600/30 hover:bg-primary-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <CreditCard size={16} />}
                {t('card.pay_now')}
            </button>

            {process.env.NODE_ENV === 'development' && (
                <button
                    onClick={handleSimulateSuccess}
                    className="px-2 py-1 text-[10px] text-gray-300 hover:text-green-600 border border-transparent hover:border-green-200 rounded"
                    title="Simulate Success (Dev Mode)"
                >
                    [Dev]
                </button>
            )}
        </div>
    );
}
