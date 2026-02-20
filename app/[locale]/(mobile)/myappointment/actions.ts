'use server';

import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { AppointmentStatus } from "@prisma/client";

export async function getUserAppointments() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await prisma.appointment.findMany({
        where: {
            userId: session.user.id
        },
        include: {
            doctor: {
                include: { clinic: true }
            },
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
            status: AppointmentStatus.AWAITING_PAYMENT,
            id: { notIn: knownIds }
        },
        include: {
            doctor: {
                include: { clinic: true }
            }
        }
    });

    // 2. Check for Meeting Ready (or just Confirmed)
    // We want to notify/refresh even if link is missing, so the UI updates to "Confirmed" status
    const meetReady = await prisma.appointment.findMany({
        where: {
            userId: session.user.id,
            status: { in: [AppointmentStatus.CONFIRMED] }, // Only check CONFIRMED, COMPLETED is history
            // meetingLink: { not: null }, // REMOVED: Allow triggering refresh even without link
            id: { notIn: knownIds },
            updatedAt: { gte: new Date(Date.now() - 1 * 60 * 60 * 1000) } // Only from last 1 hour
        },
        include: {
            doctor: {
                include: { clinic: true }
            }
        }
    });

    // 3. Check for Payment Cancelled (New)
    // We look for CANCELLED appointments that are NOT in knownIds
    // NOTE: This might need a time window check in a real app to avoid showing old cancellations
    const cancelled = await prisma.appointment.findMany({
        where: {
            userId: session.user.id,
            status: AppointmentStatus.CANCELLED,
            id: { notIn: knownIds },
            updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Only show cancellations from last 24h
        },
        include: {
            doctor: {
                include: { clinic: true }
            }
        }
    });

    // Map to a common structure
    const notifications = [
        ...paymentRequired.map(apt => ({ ...apt, type: 'PAYMENT_REQUIRED', key: 'Notifications.payment_required_msg' })),
        ...meetReady.map(apt => ({ ...apt, type: 'MEET_READY', key: 'Notifications.meet_ready_msg' })),
        ...cancelled.map(apt => ({ ...apt, type: 'PAYMENT_CANCELLED', key: 'Notifications.payment_cancelled' }))
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
