"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMeetPresets() {
    try {
        return await prisma.meetPreset.findMany({
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Error fetching meet presets:", error);
        return [];
    }
}

export async function createMeetPreset(data: {
    name: string;
    link: string;
    description?: string;
    isDefault?: boolean;
}) {
    try {
        if (data.isDefault) {
            // Unset other defaults
            await prisma.meetPreset.updateMany({
                where: { isDefault: true },
                data: { isDefault: false }
            });
        }

        const preset = await prisma.meetPreset.create({
            data
        });

        revalidatePath('/admin/dashboard/meet');
        return { success: true, preset };
    } catch (error) {
        console.error("Error creating meet preset:", error);
        return { success: false, error: "Failed to create preset" };
    }
}

export async function deleteMeetPreset(id: string) {
    try {
        await prisma.meetPreset.delete({
            where: { id }
        });
        revalidatePath('/admin/dashboard/meet');
        return { success: true };
    } catch (error) {
        console.error("Error deleting meet preset:", error);
        return { success: false, error: "Failed to delete preset" };
    }
}

export async function toggleDefaultPreset(id: string) {
    try {
        // Unset all defaults first
        await prisma.meetPreset.updateMany({
            where: { isDefault: true },
            data: { isDefault: false }
        });

        // Set new default
        await prisma.meetPreset.update({
            where: { id },
            data: { isDefault: true }
        });

        revalidatePath('/admin/dashboard/meet');
        return { success: true };
    } catch (error) {
        console.error("Error toggling default preset:", error);
        return { success: false, error: "Failed to update default" };
    }
}
