"use client";

import { useTranslations } from "next-intl";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentFailPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-12 h-12 text-red-600" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">Payment Failed</h1>
                    <p className="text-gray-500">Something went wrong with the payment processing.</p>
                </div>

                <div className="pt-4">
                    <Link
                        href="/dashboard"
                        className="block w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition"
                    >
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
