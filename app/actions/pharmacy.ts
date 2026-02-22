"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const pharmacySchema = z.object({
    name: z.string().min(1, "Name is required"),
    fax: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
});

export async function getPharmacies(page: number = 1, limit: number = 10, query: string = "", filter: string = "") {
    // No auth check for listing in this demo/context, or add if needed

    const skip = (page - 1) * limit;

    const where: any = {};

    if (query) {
        const terms = query.trim().split(/[\s,]+/).filter(Boolean);
        if (terms.length > 0) {
            where.AND = where.AND || [];
            terms.forEach(term => {
                where.AND.push({
                    OR: [
                        { name: { contains: term, mode: 'insensitive' as const } },
                        { address: { contains: term, mode: 'insensitive' as const } },
                    ]
                });
            });
        }
    }

    if (filter && filter !== 'all') {
        where.AND = where.AND || [];
        where.AND.push({ address: { contains: filter, mode: 'insensitive' as const } });
    }

    const [pharmacies, total] = await Promise.all([
        prisma.pharmacy.findMany({
            where,
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' }
            ],
            skip,
            take: limit,
        }),
        prisma.pharmacy.count({ where })
    ]);

    return {
        pharmacies,
        total,
        totalPages: Math.ceil(total / limit)
    };
}

export async function createPharmacy(data: z.infer<typeof pharmacySchema>) {
    // TODO: Add Auth check (Admin only)
    const validated = pharmacySchema.safeParse(data);
    if (!validated.success) return { error: "Invalid data" };

    try {
        const pharmacy = await prisma.pharmacy.create({
            data: validated.data
        });
        revalidatePath('/admin/dashboard/pharmacies');
        return { success: true, pharmacy };
    } catch (error) {
        console.error(error);
        return { error: "Failed to create pharmacy" };
    }
}

export async function updatePharmacy(id: string, data: z.infer<typeof pharmacySchema>) {
    // TODO: Auth check
    const validated = pharmacySchema.safeParse(data);
    if (!validated.success) return { error: "Invalid data" };

    try {
        await prisma.pharmacy.update({
            where: { id },
            data: validated.data
        });
        revalidatePath('/admin/dashboard/pharmacies');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to update pharmacy" };
    }
}

export async function deletePharmacy(id: string) {
    // TODO: Auth check
    try {
        await prisma.pharmacy.delete({
            where: { id }
        });
        revalidatePath('/admin/dashboard/pharmacies');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to delete pharmacy" };
    }
}

export async function setPharmacyDefault(pharmacyId: string) {
    // TODO: Add Auth check (Admin only)
    try {
        await prisma.$transaction([
            prisma.pharmacy.updateMany({
                where: { isDefault: true },
                data: { isDefault: false }
            }),
            prisma.pharmacy.update({
                where: { id: pharmacyId },
                data: { isDefault: true }
            })
        ]);

        revalidatePath('/admin/dashboard/pharmacies');
        return { success: true };
    } catch (error) {
        console.error("Failed to set default pharmacy", error);
        return { error: "Failed to set default pharmacy" };
    }
}

export async function updatePharmacyFax(pharmacyId: string, fax: string) {
    const trimmed = fax.trim();
    if (!trimmed) return { error: "Fax number cannot be empty" };

    try {
        await prisma.pharmacy.update({
            where: { id: pharmacyId },
            data: { fax: trimmed },
        });
        revalidatePath('/consult');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to update fax" };
    }
}

// Admin-only: lock/unlock fax to prevent client edits
export async function togglePharmacyFaxLock(pharmacyId: string) {
    const { auth } = await import("@/auth");
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

    const pharmacy = await prisma.pharmacy.findUnique({ where: { id: pharmacyId }, select: { faxLocked: true } });
    if (!pharmacy) return { error: "Not found" };

    const updated = await prisma.pharmacy.update({
        where: { id: pharmacyId },
        data: { faxLocked: !pharmacy.faxLocked },
    });
    revalidatePath('/consult');
    revalidatePath('/admin/dashboard/pharmacies');
    return { success: true, faxLocked: updated.faxLocked };
}

// Admin-only: mark fax as verified/unverified
export async function togglePharmacyFaxVerified(pharmacyId: string) {
    const { auth } = await import("@/auth");
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

    const pharmacy = await prisma.pharmacy.findUnique({ where: { id: pharmacyId }, select: { faxVerified: true } });
    if (!pharmacy) return { error: "Not found" };

    const updated = await prisma.pharmacy.update({
        where: { id: pharmacyId },
        data: { faxVerified: !pharmacy.faxVerified },
    });
    revalidatePath('/consult');
    revalidatePath('/admin/dashboard/pharmacies');
    return { success: true, faxVerified: updated.faxVerified };
}
