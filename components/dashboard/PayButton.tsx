'use client';

import { useState } from 'react';
import { getPaymentLink } from '@/app/[locale]/(mobile)/dashboard/payment.actions';
import { ArrowRight, CreditCard, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PayButtonProps {
    appointmentId: string;
    price: number;
}

export default function PayButton({ appointmentId, price }: PayButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handlePayment = async () => {
        try {
            setLoading(true);

            // 1. Get Payment Link from Server
            const paymentUrl = await getPaymentLink(appointmentId);
            console.log("Redirecting to:", paymentUrl);

            // 2. Redirect User
            // window.open(paymentUrl, '_blank') // Optional: Open in new tab?
            // Usually, mobile payments redirect the current window
            window.location.href = paymentUrl;

        } catch (error) {
            console.error("Payment Error:", error);
            alert("Failed to initialize payment.");
            setLoading(false);
        }
    };

    // DEBUG: Force Success Button
    const handleSimulateSuccess = async () => {
        if (!confirm("Simulate successful payment for testing?")) return;

        setLoading(true);
        try {
            const res = await fetch('/api/payment/callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appointmentId: appointmentId,
                    result: 'SUCCESS'
                })
            });

            if (res.ok) {
                alert("Payment Confirmed (Simulated)");
                // Refresh to show status update
                router.refresh();
            } else {
                alert("Simulation failed");
            }
        } catch (e) {
            console.error(e);
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
                Pay Now
            </button>

            <button
                onClick={handleSimulateSuccess}
                className="px-2 py-1 text-[10px] text-gray-300 hover:text-green-600 border border-transparent hover:border-green-200 rounded"
                title="Simulate Success (Dev Mode)"
            >
                [Dev]
            </button>
        </div>
    );
}
