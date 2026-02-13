
"use server";

import { prisma } from "@/app/lib/prisma";
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
        vaccinations,
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

    if (!name || isNaN(price)) {
        throw new Error("Name and Price are required");
    }

    await prisma.vaccination.create({
        data: {
            name,
            price,
            description,
            category,
            manufacturer,
            targetDisease,
            visitTime,
            location,
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

    if (!name || isNaN(price)) {
        throw new Error("Name and Price are required");
    }

    await prisma.vaccination.update({
        where: { id },
        data: {
            name,
            price,
            description,
            category,
            manufacturer,
            targetDisease,
            visitTime,
            location,
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
