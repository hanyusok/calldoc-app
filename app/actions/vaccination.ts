
"use server";

import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getVaccinations({
    query,
    page = 1,
    limit = 10
}: {
    query?: string;
    page?: number;
    limit?: number;
}) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
            { manufacturer: { contains: query, mode: 'insensitive' } },
            { targetDisease: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
        ];
    }

    const [vaccinations, total] = await Promise.all([
        prisma.vaccination.findMany({
            where,
            orderBy: { name: 'asc' },
            skip,
            take: limit,
        }),
        prisma.vaccination.count({ where })
    ]);

    return {
        vaccinations: vaccinations as any[], // Casting to any[] to bypass strict type checking for now, or define a proper type
        total,
        totalPages: Math.ceil(total / limit)
    };
}

export async function createVaccination(formData: FormData) {
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const manufacturer = formData.get('manufacturer') as string;
    const targetDisease = formData.get('targetDisease') as string;
    const visitTime = formData.get('visitTime') as string;
    const location = formData.get('location') as string;
    const minAge = formData.get('minAge') ? parseInt(formData.get('minAge') as string) : null;
    const maxAge = formData.get('maxAge') ? parseInt(formData.get('maxAge') as string) : null;

    const nameEn = formData.get('nameEn') as string;
    const descriptionEn = formData.get('descriptionEn') as string;
    const categoryEn = formData.get('categoryEn') as string;
    const manufacturerEn = formData.get('manufacturerEn') as string;
    const targetDiseaseEn = formData.get('targetDiseaseEn') as string;
    const visitTimeEn = formData.get('visitTimeEn') as string;
    const locationEn = formData.get('locationEn') as string;

    if (!name || isNaN(price)) {
        throw new Error("Name and Price are required");
    }

    await prisma.vaccination.create({
        data: {
            name,
            nameEn,
            price,
            description,
            descriptionEn,
            category,
            categoryEn,
            manufacturer,
            manufacturerEn,
            targetDisease,
            targetDiseaseEn,
            visitTime,
            visitTimeEn,
            location,
            locationEn,
            minAge,
            maxAge
        }
    });

    revalidatePath('/admin/dashboard/vaccinations');
    revalidatePath('/myappointment');
}

export async function updateVaccination(id: string, formData: FormData) {
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const manufacturer = formData.get('manufacturer') as string;
    const targetDisease = formData.get('targetDisease') as string;
    const visitTime = formData.get('visitTime') as string;
    const location = formData.get('location') as string;
    const minAge = formData.get('minAge') ? parseInt(formData.get('minAge') as string) : null;
    const maxAge = formData.get('maxAge') ? parseInt(formData.get('maxAge') as string) : null;

    const nameEn = formData.get('nameEn') as string;
    const descriptionEn = formData.get('descriptionEn') as string;
    const categoryEn = formData.get('categoryEn') as string;
    const manufacturerEn = formData.get('manufacturerEn') as string;
    const targetDiseaseEn = formData.get('targetDiseaseEn') as string;
    const visitTimeEn = formData.get('visitTimeEn') as string;
    const locationEn = formData.get('locationEn') as string;

    if (!name || isNaN(price)) {
        throw new Error("Name and Price are required");
    }

    await prisma.vaccination.update({
        where: { id },
        data: {
            name,
            nameEn,
            price,
            description,
            descriptionEn,
            category,
            categoryEn,
            manufacturer,
            manufacturerEn,
            targetDisease,
            targetDiseaseEn,
            visitTime,
            visitTimeEn,
            location,
            locationEn,
            minAge,
            maxAge
        }
    });

    revalidatePath('/admin/dashboard/vaccinations');
    revalidatePath('/myappointment');
}

export async function deleteVaccination(id: string) {
    await prisma.vaccination.delete({
        where: { id }
    });
    revalidatePath('/admin/dashboard/vaccinations');
    revalidatePath('/consult');
}

// ===== RESERVATIONS =====

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
