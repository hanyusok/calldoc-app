"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSettings() {
    try {
        let settings = await prisma.appSettings.findUnique({
            where: { id: 1 }
        });

        // Initialize if not exists
        if (!settings) {
            settings = await prisma.appSettings.create({
                data: {
                    id: 1,
                    siteName: "CallDoc",
                    maintenanceMode: false
                }
            });
        }

        return settings;
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        // Return default values in case of error to prevent UI crash
        return {
            id: 1,
            siteName: "CallDoc",
            maintenanceMode: false
        };
    }
}

export async function updateSettings(data: { siteName: string; maintenanceMode: boolean }) {
    try {
        // TODO: Auth check (Admin only)

        await prisma.appSettings.upsert({
            where: { id: 1 },
            update: {
                siteName: data.siteName,
                maintenanceMode: data.maintenanceMode
            },
            create: {
                id: 1,
                siteName: data.siteName,
                maintenanceMode: data.maintenanceMode
            }
        });

        revalidatePath('/admin/dashboard/settings');
        return { success: true };
    } catch (error) {
        console.error("Failed to update settings:", error);
        return { success: false, error: "Failed to update settings" };
    }
}
