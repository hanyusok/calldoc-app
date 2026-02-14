"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAdminPayments(page: number = 1, status?: string) {
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    try {
        const where: any = {};
        if (status && status !== 'ALL') {
            where.status = status;
        }

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                include: {
                    appointment: {
                        include: {
                            user: true,
                            doctor: true
                        }
                    }
                },
                orderBy: { requestedAt: 'desc' },
                skip,
                take: pageSize
            }),
            prisma.payment.count({ where })
        ]);

        return {
            success: true,
            data: payments,
            pagination: {
                current: page,
                total: Math.ceil(total / pageSize),
                totalRecords: total
            }
        };
    } catch (error) {
        console.error("Error fetching admin payments:", error);
        return { success: false, error: "Failed to fetch payments" };
    }
}

export async function checkNewPaidAppointments(knownPaymentIds: string[]) {
    try {
        // Find payments completed in the last hour (to avoid fetching old history on refresh)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const newPayments = await prisma.payment.findMany({
            where: {
                status: 'COMPLETED',
                approvedAt: { gte: oneHourAgo }, // Changed from updatedAt
                id: { notIn: knownPaymentIds }
            },
            include: {
                appointment: {
                    include: {
                        user: true,
                        doctor: true
                    }
                }
            },
            orderBy: { approvedAt: 'desc' }, // Changed from updatedAt
            take: 5 // Limit to recent ones
        });

        return newPayments;
    } catch (error) {
        console.error("Error checking new paid appointments:", error);
        return [];
    }
}
