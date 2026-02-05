'use server';

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAdminAppointments() {
    return await prisma.appointment.findMany({
        include: {
            user: true,
            doctor: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
}

export async function setAppointmentPrice(appointmentId: string, price: number) {
    await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
            price: price,
            status: "AWAITING_PAYMENT",
        },
    });
    revalidatePath('/admin/dashboard');
}
