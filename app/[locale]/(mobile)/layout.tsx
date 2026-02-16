import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import NotificationWatcher from '@/components/dashboard/NotificationWatcher';
import { getTranslations } from 'next-intl/server';

export default async function MobileLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();
    const t = await getTranslations('MyAppointmentPage');

    let initialConfirmedIds: string[] = [];
    if (session?.user?.id) {
        // Fetch existing active appointments to prevent re-alerting on page load
        // This mirrors the logic previously in MyAppointmentPage
        const activeAppointments = await prisma.appointment.findMany({
            where: {
                userId: session.user.id,
                status: { in: ['AWAITING_PAYMENT', 'CONFIRMED'] }
            },
            select: { id: true }
        });
        initialConfirmedIds = activeAppointments.map(a => a.id);
    }

    return (
        <main className="max-w-md mx-auto min-h-screen bg-white shadow-xl overflow-hidden relative">
            <NotificationWatcher
                initialConfirmedIds={initialConfirmedIds}
                messages={{
                    payment_required: t('status.payment_required'),
                    confirmed: t('status.confirmed'),
                    cancelled: t('status.CANCELLED'),
                    completed: t('status.completed'),
                    price_confirmed_msg: t('card.price_confirmed_msg', { doctor: '{doctor}', price: '{price}' }),
                    enter_room: t('card.enter_room'),
                    action_required: t('action_required')
                }}
            />
            {children}
        </main>
    );
}
