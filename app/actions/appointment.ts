'use server'

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { AppointmentStatus } from "@prisma/client";

export async function getAppointments(search?: string, status?: AppointmentStatus | 'ALL', page = 1, limit = 10) {
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
                    user: {
                        include: {
                            pharmacy: true,
                            favoritePharmacies: {
                                include: {
                                    pharmacy: true
                                }
                            }
                        }
                    },
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
    status?: AppointmentStatus;
    price?: number;
}) {
    try {
        const appointment = await prisma.appointment.create({
            data: {
                userId: data.userId,
                doctorId: data.doctorId,
                date: data.date,
                status: data.status || AppointmentStatus.PENDING,
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
    status?: AppointmentStatus;
    price?: number;
}) {
    try {
        // If price is being set and status is PENDING, auto-promote to AWAITING_PAYMENT
        if (data.price && data.price > 0 && (!data.status || data.status === AppointmentStatus.PENDING)) {
            data.status = AppointmentStatus.AWAITING_PAYMENT;
        }

        const appointment = await prisma.appointment.update({
            where: { id },
            data,
        });
        revalidatePath('/admin/dashboard/appointments');
        revalidatePath('/myappointment');
        return appointment;
    } catch (error) {
        console.error("Error updating appointment:", error);
        throw new Error("Failed to update appointment");
    }
}

// ... existing code ...
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

import { createNotification } from "./notification";
import { getTranslations } from "next-intl/server";

export async function completeAppointment(id: string) {
    try {
        const appointment = await prisma.appointment.update({
            where: { id },
            data: { status: AppointmentStatus.COMPLETED },
            include: { doctor: true, user: true }
        });

        // Notify user
        if (appointment.userId) {
            await createNotification({
                userId: appointment.userId,
                type: 'APPOINTMENT_COMPLETED',
                message: `Your consultation with ${appointment.doctor.name} has been completed.`,
                key: 'Notifications.appointment_completed', // Ensure this key exists or fallback to message
                params: { doctor: appointment.doctor.name },
                link: `/myappointment`
            });
        }

        revalidatePath('/admin/dashboard/appointments');
        revalidatePath('/myappointment');
        revalidatePath('/[locale]/myappointment');

        return { success: true };
    } catch (error) {
        console.error("Error completing appointment:", error);
        return { success: false, error: "Failed to complete appointment" };
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
