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
            date: 'desc', // Most recent first
        },
    });
}

export async function checkNewConfirmations(knownIds: string[]) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const newConfirmations = await prisma.appointment.findMany({
        where: {
            userId: session.user.id,
            status: 'AWAITING_PAYMENT',
            id: {
                notIn: knownIds
            }
        },
        include: {
            doctor: true
        }
    });

    return newConfirmations;
}
