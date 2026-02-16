'use server';

import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";

export async function getUnreadNotifications() {
    const session = await auth();
    if (!session?.user?.email) return [];

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) return [];

    return await prisma.notification.findMany({
        where: {
            userId: user.id,
            isRead: false
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}

export async function markNotificationAsRead(id: string) {
    const session = await auth();
    if (!session?.user?.email) return;

    await prisma.notification.update({
        where: { id },
        data: { isRead: true }
    });
}
