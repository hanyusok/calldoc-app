'use server'

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { hashPassword, validateUserUniqueness } from "@/app/lib/user-service";

export async function getUsers(page = 1, limit = 10, search = "", role?: Role | 'ALL') {
    try {
        const skip = (page - 1) * limit;

        const where: any = {};

        if (role && role !== 'ALL') {
            where.role = role;
        }

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

export async function createUser(data: any) {
    try {
        const { name, email, password, role, phoneNumber } = data;

        await validateUserUniqueness(email);

        const hashedPassword = await hashPassword(password);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role as Role,
                phoneNumber
            }
        });

        revalidatePath('/admin/dashboard/users');
        revalidatePath('/admin/dashboard/patients');
        return { success: true };
    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, error: "Failed to create user" };
    }
}

export async function updateUser(userId: string, data: any) {
    try {
        const { name, email, password, role, phoneNumber } = data;

        const updateData: any = {
            name,
            email,
            role: role as Role,
            phoneNumber
        };

        if (password) {
            updateData.password = await hashPassword(password);
        }

        await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        revalidatePath('/admin/dashboard/users');
        revalidatePath('/admin/dashboard/patients');
        return { success: true };
    } catch (error) {
        console.error("Error updating user:", error);
        return { success: false, error: "Failed to update user" };
    }
}

export async function deleteUser(userId: string) {
    try {
        // TODO: Verify admin privileges (middleware or session check)

        await prisma.user.delete({
            where: { id: userId }
        });

        revalidatePath('/admin/dashboard/users');
        revalidatePath('/admin/dashboard/patients');
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: "Failed to delete user" };
    }
}
