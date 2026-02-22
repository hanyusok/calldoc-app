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
                    maintenanceMode: false,
                    homePostsCount: 5,
                    heroBannerTitle: "지금 바로 진료 예약",
                    heroBannerSubtitle: "전문의와 비대면으로 빠르고 편리하게",
                }
            });
        }

        return settings;
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return {
            id: 1,
            siteName: "CallDoc",
            maintenanceMode: false,
            homePostsCount: 5,
            heroBannerTitle: "지금 바로 진료 예약",
            heroBannerSubtitle: "전문의와 비대면으로 빠르고 편리하게",
        };
    }
}

export async function updateSettings(data: {
    siteName: string;
    maintenanceMode: boolean;
    homePostsCount: number;
    heroBannerTitle: string;
    heroBannerSubtitle: string;
}) {
    try {
        const homePostsCount = parseInt(data.homePostsCount?.toString()) || 5;

        await prisma.appSettings.upsert({
            where: { id: 1 },
            update: {
                siteName: data.siteName,
                maintenanceMode: data.maintenanceMode,
                homePostsCount,
                heroBannerTitle: data.heroBannerTitle,
                heroBannerSubtitle: data.heroBannerSubtitle,
            },
            create: {
                id: 1,
                siteName: data.siteName,
                maintenanceMode: data.maintenanceMode,
                homePostsCount,
                heroBannerTitle: data.heroBannerTitle,
                heroBannerSubtitle: data.heroBannerSubtitle,
            }
        });

        try {
            revalidatePath('/admin/dashboard/settings');
            revalidatePath('/');
        } catch (e) {
            console.error("Revalidation error:", e);
        }
        return { success: true };
    } catch (error) {
        console.error("Failed to update settings:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to update settings" };
    }
}
