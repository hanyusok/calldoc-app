"use server";

import { google } from 'googleapis';
import { format } from 'date-fns';

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

export async function createMeeting({
    appointmentId,
    startDateTime,
    endDateTime,
    summary,
    patientName
}: {
    appointmentId: string;
    startDateTime: Date;
    endDateTime: Date;
    summary?: string;
    patientName?: string;
}) {
    // 1. Check for Credentials
    const keyData = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!keyData || !calendarId) {
        console.warn("Missing Google Calendar credentials. Using mock meeting link.");
        // Return a mock link for development/testing
        return "https://meet.google.com/test-link-mock";
    }

    try {
        // 2. Auth
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(keyData),
            scopes: SCOPES,
        });

        const calendar = google.calendar({ version: 'v3', auth });

        // 3. Create Event with Conference Data
        const event = {
            summary: summary || (patientName
                ? `CallDoc: ${patientName} ${format(startDateTime, 'HH:mm')}~`
                : `CallDoc: ${appointmentId.slice(-6)}`),
            description: `CallDoc Appointment ${appointmentId}`,
            start: { dateTime: startDateTime.toISOString() },
            end: { dateTime: endDateTime.toISOString() },
            conferenceData: {
                createRequest: {
                    requestId: `${appointmentId}-${Date.now()}`,
                },
            },
        };

        const response = await calendar.events.insert({
            calendarId: calendarId,
            requestBody: event,
            conferenceDataVersion: 1, // Critical for generating the link
        });

        return response.data.hangoutLink;

    } catch (error) {
        console.error("Failed to create Google Meet:", error);
        return null; // Fail gracefully so payment isn't affected
    }
}

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function generateAndSaveMeetingLink(params: {
    appointmentId: string;
    startDateTime: Date;
    endDateTime: Date;
    summary?: string;
    patientName?: string;
}) {
    const link = await createMeeting(params);

    if (link) {
        await prisma.appointment.update({
            where: { id: params.appointmentId },
            data: { meetingLink: link }
        });

        revalidatePath('/myappointment');
        revalidatePath('/admin/dashboard/appointments');
        return link;
    }

    return null;
}
export async function saveMeetingLink(appointmentId: string, link: string) {
    try {
        await prisma.appointment.update({
            where: { id: appointmentId },
            data: { meetingLink: link }
        });

        revalidatePath('/myappointment');
        revalidatePath('/admin/dashboard/appointments');
        revalidatePath('/[locale]/myappointment');
        return true;
    } catch (error) {
        console.error("Error saving meeting link:", error);
        return false;
    }
}

// ===== MEET PRESETS =====

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
