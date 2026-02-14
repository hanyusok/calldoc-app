'use server';

import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";

export async function getUserAppointments() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await prisma.appointment.findMany({
        where: {
            userId: session.user.id
        },
        include: {
            doctor: true,
            prescription: true,
        },
        orderBy: {
            date: 'desc',
        },
    });
}

export async function checkAppointmentNotifications(knownIds: string[]) {
    const session = await auth();
    if (!session?.user?.id) return [];

    // 1. Check for Payment Required (Existing)
    const paymentRequired = await prisma.appointment.findMany({
        where: {
            userId: session.user.id,
            status: 'AWAITING_PAYMENT',
            id: { notIn: knownIds }
        },
        include: { doctor: true }
    });

    // 2. Check for Meeting Ready (New)
    const meetReady = await prisma.appointment.findMany({
        where: {
            userId: session.user.id,
            status: { in: ['CONFIRMED', 'COMPLETED'] },
            meetingLink: { not: null },
            id: { notIn: knownIds }
        },
        include: { doctor: true }
    });

    // 3. Check for Payment Cancelled (New)
    // We look for CANCELLED appointments that are NOT in knownIds
    // NOTE: This might need a time window check in a real app to avoid showing old cancellations
    const cancelled = await prisma.appointment.findMany({
        where: {
            userId: session.user.id,
            status: 'CANCELLED',
            id: { notIn: knownIds },
            updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Only show cancellations from last 24h
        },
        include: { doctor: true }
    });

    // Map to a common structure
    const notifications = [
        ...paymentRequired.map(apt => ({ ...apt, type: 'PAYMENT_REQUIRED' })),
        ...meetReady.map(apt => ({ ...apt, type: 'MEET_READY' })),
        ...cancelled.map(apt => ({ ...apt, type: 'PAYMENT_CANCELLED' }))
    ];

    return notifications;
}

export async function getMyVaccinationReservations() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return prisma.vaccinationReservation.findMany({
        where: { userId: session.user.id },
        include: { vaccination: true },
        orderBy: { createdAt: 'desc' }
    });
}
