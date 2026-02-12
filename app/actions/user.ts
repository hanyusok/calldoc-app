'use server'

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUsers(page = 1, limit = 10, search = "") {
    try {
        const skip = (page - 1) * limit;

        const where: any = {
            role: 'PATIENT', // Only fetch patients, not admins or doctors(if role exists)
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    _count: {
                        select: { appointments: true }
                    }
                }
            }),
            prisma.user.count({ where })
        ]);

        return {
            users,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };

    } catch (error) {
        console.error("Error fetching users:", error);
        return { users: [], total: 0, totalPages: 0, currentPage: 1 };
    }
}

export async function deleteUser(userId: string) {
    try {
        // TODO: Verify admin privileges (middleware or session check)

        await prisma.user.delete({
            where: { id: userId }
        });

        revalidatePath('/admin/patients');
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: "Failed to delete user" };
    }
}
