'use client';

import { useEffect, useState } from 'react';
import { checkNewConfirmations } from '@/app/[locale]/(mobile)/dashboard/actions';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';

export default function NotificationWatcher({ initialConfirmedIds }: { initialConfirmedIds: string[] }) {
    const router = useRouter();
    const [knownIds, setKnownIds] = useState<string[]>(initialConfirmedIds);
    const [notification, setNotification] = useState<{ message: string, id: string } | null>(null);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const newConfirmations = await checkNewConfirmations(knownIds);

                if (newConfirmations.length > 0) {
                    const latest = newConfirmations[0] as any;
                    setNotification({
                        message: `${latest.doctor.name} has confirmed the price ($${latest.price}).`,
                        id: latest.id
                    });

                    // Update known IDs so we don't notify again
                    const newIds = newConfirmations.map(a => a.id);
                    setKnownIds(prev => [...prev, ...newIds]);

                    // Refresh the page data to show the "Pay Now" button
                    router.refresh();

                    // Hide notification after 5 seconds
                    setTimeout(() => setNotification(null), 5000);
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [knownIds, router]);

    if (!notification) return null;

    return (
        <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="bg-white border-l-4 border-blue-500 shadow-lg rounded-r-lg p-4 flex items-start gap-3">
                <div className="bg-blue-50 text-blue-500 p-2 rounded-full">
                    <Bell size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">Action Required</h3>
                    <p className="text-gray-600 text-xs">{notification.message}</p>
                </div>
                <button
                    onClick={() => setNotification(null)}
                    className="ml-auto text-gray-400 hover:text-gray-600"
                >
                    &times;
                </button>
            </div>
        </div>
    );
}
