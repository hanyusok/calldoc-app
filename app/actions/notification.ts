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

export async function checkNewNotifications() {
    const session = await auth();
    if (!session?.user?.id) return [];

    // 1. Fetch unread persistent notifications
    const unread = await prisma.notification.findMany({
        where: {
            userId: session.user.id,
            isRead: false
        },
        orderBy: { createdAt: 'desc' }
    });

    // Mark as read immediately to avoid re-notifying in this simple polling setup
    // In a more complex app, we might wait for explicit dismissal
    if (unread.length > 0) {
        await prisma.notification.updateMany({
            where: { id: { in: unread.map(n => n.id) } },
            data: { isRead: true }
        });
    }

    // 2. Map to common structure
    return unread.map(n => ({
        id: n.id,
        type: n.type,
        message: n.message,
        key: n.key,
        params: n.params,
        link: n.link,
        createdAt: n.createdAt
    }));
}
export async function getUserNotifications(limit = 20) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const notifications = await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: limit
    });

    return notifications;
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
