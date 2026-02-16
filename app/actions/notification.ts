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

export async function createNotification({
    userId,
    type,
    message,
    key,
    params,
    link
}: {
    userId: string;
    type: string;
    message: string;
    key?: string;
    params?: any;
    link?: string;
}) {
    // If no session, internal system action (allowed)
    // or verify admin if needed. For now, open internal usage.

    return await prisma.notification.create({
        data: {
            userId,
            type,
            message,
            key,
            params: params ? JSON.stringify(params) : undefined,
            link
        }
    });
}
