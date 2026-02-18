'use server'

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDoctors(page = 1, limit = 10, search = "") {
    try {
        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { specialty: { contains: search, mode: 'insensitive' } },
                { clinic: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [doctors, total] = await Promise.all([
            prisma.doctor.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    clinic: true,
                    _count: {
                        select: { appointments: true }
                    }
                }
            }),
            prisma.doctor.count({ where })
        ]);

        return {
            doctors,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };

    } catch (error) {
        console.error("Error fetching doctors:", error);
        return { doctors: [], total: 0, totalPages: 0, currentPage: 1 };
    }
}

export async function createDoctor(data: any) {
    try {
        await prisma.doctor.create({
            data: {
                name: data.name,
                specialty: data.specialty,
                clinicId: data.clinicId,
                bio: data.bio,
                imageUrl: data.imageUrl,
                rating: data.rating ? parseFloat(data.rating) : 5.0,
                patients: data.patients ? parseInt(data.patients) : 0,
                consultationFee: data.consultationFee ? parseInt(data.consultationFee) : 5000,
                isAvailable: data.isAvailable
            }
        });

        revalidatePath('/admin/dashboard/doctors');
        return { success: true };
    } catch (error) {
        console.error("Error creating doctor:", error);
        return { success: false, error: "Failed to create doctor" };
    }
}

export async function updateDoctor(doctorId: string, data: any) {
    try {
        await prisma.doctor.update({
            where: { id: doctorId },
            data: {
                name: data.name,
                specialty: data.specialty,
                clinicId: data.clinicId,
                bio: data.bio,
                imageUrl: data.imageUrl,
                rating: data.rating ? parseFloat(data.rating) : undefined,
                patients: data.patients ? parseInt(data.patients) : undefined,
                consultationFee: data.consultationFee ? parseInt(data.consultationFee) : undefined,
                isAvailable: data.isAvailable
            }
        });

        revalidatePath('/admin/dashboard/doctors');
        return { success: true };
    } catch (error) {
        console.error("Error updating doctor:", error);
        return { success: false, error: "Failed to update doctor" };
    }
}

export async function deleteDoctor(doctorId: string) {
    try {
        await prisma.doctor.delete({
            where: { id: doctorId }
        });

        revalidatePath('/admin/dashboard/doctors');
        return { success: true };
    } catch (error) {
        console.error("Error deleting doctor:", error);
        return { success: false, error: "Failed to delete doctor" };
    }
}

export async function getClinicsForSelect() {
    try {
        return await prisma.clinic.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        console.error("Error fetching clinics:", error);
        return [];
    }
}
