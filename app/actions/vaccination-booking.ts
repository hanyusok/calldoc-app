"use server";

import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function reserveVaccination(vaccinationId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Authentication required");
    }

    try {
        const reservation = await prisma.vaccinationReservation.create({
            data: {
                userId: session.user.id,
                vaccinationId: vaccinationId,
                status: "PENDING",
            }
        });

        revalidatePath("/myappointment");
        revalidatePath("/dashboard");

        return { success: true, reservationId: reservation.id };
    } catch (error) {
        console.error("Failed to reserve vaccination:", error);
        return { success: false, error: "Failed to create reservation" };
    }
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

export async function getVaccinationReservations(search?: string, status?: string, page = 1, limit = 10) {
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
                { vaccination: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [reservations, total] = await Promise.all([
            prisma.vaccinationReservation.findMany({
                where: whereClause,
                include: {
                    user: true,
                    vaccination: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.vaccinationReservation.count({ where: whereClause })
        ]);

        return {
            reservations,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
    } catch (error) {
        console.error("Error fetching vaccination reservations:", error);
        throw new Error("Failed to fetch reservations");
    }
}

export async function updateVaccinationReservationStatus(id: string, status: string) {
    try {
        const reservation = await prisma.vaccinationReservation.update({
            where: { id },
            data: { status },
        });
        revalidatePath('/admin/dashboard/appointments');
        revalidatePath('/myappointment');
        return reservation;
    } catch (error) {
        console.error("Error updating vaccination reservation:", error);
        throw new Error("Failed to update reservation");
    }
}
