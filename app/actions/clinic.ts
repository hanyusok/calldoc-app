'use server'

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getClinics(page = 1, limit = 10, search = "") {
    try {
        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [clinics, total] = await Promise.all([
            prisma.clinic.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    _count: {
                        select: { doctors: true }
                    }
                }
            }),
            prisma.clinic.count({ where })
        ]);

        return {
            clinics,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };

    } catch (error) {
        console.error("Error fetching clinics:", error);
        return { clinics: [], total: 0, totalPages: 0, currentPage: 1 };
    }
}

export async function createClinic(data: any) {
    try {
        await prisma.clinic.create({
            data: {
                name: data.name,
                address: data.address,
                city: data.city,
                description: data.description,
                phoneNumber: data.phoneNumber,
                website: data.website,
                latitude: data.latitude ? parseFloat(data.latitude) : undefined,
                longitude: data.longitude ? parseFloat(data.longitude) : undefined,
                rating: data.rating ? parseFloat(data.rating) : 0,
                isVisible: data.isVisible !== undefined ? data.isVisible : true,
                images: data.images ? [data.images] : [] // Simple handling for now
            }
        });

        revalidatePath('/admin/dashboard/clinics');
        return { success: true };
    } catch (error) {
        console.error("Error creating clinic:", error);
        return { success: false, error: "Failed to create clinic" };
    }
}

export async function updateClinic(clinicId: string, data: any) {
    try {
        await prisma.clinic.update({
            where: { id: clinicId },
            data: {
                name: data.name,
                address: data.address,
                city: data.city,
                description: data.description,
                phoneNumber: data.phoneNumber,
                website: data.website,
                latitude: data.latitude ? parseFloat(data.latitude) : undefined,
                longitude: data.longitude ? parseFloat(data.longitude) : undefined,
                rating: data.rating ? parseFloat(data.rating) : undefined,
                isVisible: data.isVisible,
                images: data.images ? [data.images] : undefined
            }
        });

        revalidatePath('/admin/dashboard/clinics');
        return { success: true };
    } catch (error) {
        console.error("Error updating clinic:", error);
        return { success: false, error: "Failed to update clinic" };
    }
}

export async function deleteClinic(clinicId: string) {
    try {
        await prisma.clinic.delete({
            where: { id: clinicId }
        });

        revalidatePath('/admin/dashboard/clinics');
        return { success: true };
    } catch (error) {
        console.error("Error deleting clinic:", error);
        return { success: false, error: "Failed to delete clinic" };
    }
}

export async function toggleClinicVisibility(clinicId: string, isVisible: boolean) {
    try {
        await prisma.clinic.update({
            where: { id: clinicId },
            data: { isVisible }
        });
        revalidatePath('/admin/dashboard/clinics');
        return { success: true };
    } catch (error) {
        console.error("Error toggling clinic visibility:", error);
        return { success: false, error: "Failed to toggle visibility" };
    }
}
