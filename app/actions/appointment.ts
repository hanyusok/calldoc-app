'use server'

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAppointments(search?: string, status?: string, page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const whereClause: any = {};

        if (status && status !== 'ALL') {
            whereClause.status = status;
        }

        if (search) {
            whereClause.OR = [
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { doctor: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where: whereClause,
                include: {
                    user: true,
                    doctor: true,
                    payment: true,
                    prescription: true,
                },
                orderBy: {
                    date: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.appointment.count({ where: whereClause })
        ]);

        return {
            appointments,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
    } catch (error) {
        console.error("Error fetching appointments:", error);
        throw new Error("Failed to fetch appointments");
    }
}

export async function createAppointment(data: {
    userId: string;
    doctorId: string;
    date: Date;
    status?: string;
    price?: number;
}) {
    try {
        const appointment = await prisma.appointment.create({
            data: {
                userId: data.userId,
                doctorId: data.doctorId,
                date: data.date,
                status: data.status || 'PENDING',
                price: data.price,
            },
        });
        revalidatePath('/admin/dashboard/appointments');
        return appointment;
    } catch (error) {
        console.error("Error creating appointment:", error);
        throw new Error("Failed to create appointment");
    }
}

export async function updateAppointment(id: string, data: {
    date?: Date;
    status?: string;
    price?: number;
}) {
    try {
        const appointment = await prisma.appointment.update({
            where: { id },
            data,
        });
        revalidatePath('/admin/dashboard/appointments');
        return appointment;
    } catch (error) {
        console.error("Error updating appointment:", error);
        throw new Error("Failed to update appointment");
    }
}

export async function deleteAppointment(id: string) {
    try {
        await prisma.appointment.delete({
            where: { id },
        });
        revalidatePath('/admin/dashboard/appointments');
        return { success: true };
    } catch (error) {
        console.error("Error deleting appointment:", error);
        throw new Error("Failed to delete appointment");
    }
}

// Fetch lists for the create modal
export async function getUsersAndDoctors() {
    try {
        const [users, doctors] = await Promise.all([
            prisma.user.findMany({ select: { id: true, name: true, email: true } }),
            prisma.doctor.findMany({ select: { id: true, name: true, specialty: true } }),
        ]);
        return { users, doctors };
    } catch (error) {
        console.error("Error fetching users and doctors:", error);
        throw new Error("Failed to fetch data");
    }
}
