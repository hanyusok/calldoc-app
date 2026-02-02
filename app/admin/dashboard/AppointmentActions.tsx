'use client';

import React, { useState } from 'react';
import { setAppointmentPrice } from '@/app/admin/actions';
import { DollarSign } from 'lucide-react';

export default function AppointmentActions({ appointmentId }: { appointmentId: string }) {
    const [price, setPrice] = useState('50'); // Default suggestion
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!price) return;
        setLoading(true);
        try {
            await setAppointmentPrice(appointmentId, parseFloat(price));
        } catch (error) {
            console.error("Failed to set price", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <div className="relative flex-1">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium text-gray-900"
                    placeholder="0.00"
                />
            </div>
            <button
                onClick={handleConfirm}
                disabled={loading}
                className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
                {loading ? 'Saving...' : 'Set Price'}
            </button>
        </div>
    );
}
