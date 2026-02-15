'use server'

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

// ===== SCHEDULE MANAGEMENT =====

export async function getDoctorSchedules(doctorId: string) {
    try {
        const schedules = await prisma.doctorSchedule.findMany({
            where: { doctorId },
            orderBy: { dayOfWeek: 'asc' }
        });
        return { success: true, schedules };
    } catch (error) {
        console.error("Error fetching doctor schedules:", error);
        return { success: false, schedules: [] };
    }
}

export async function updateDoctorSchedule(
    doctorId: string,
    dayOfWeek: number,
    data: {
        startTime: string;
        endTime: string;
        slotDuration: number;
        breakStartTime?: string;
        breakEndTime?: string;
        isActive: boolean;
    }
) {
    try {
        await prisma.doctorSchedule.upsert({
            where: {
                doctorId_dayOfWeek: {
                    doctorId,
                    dayOfWeek
                }
            },
            create: {
                doctorId,
                dayOfWeek,
                ...data
            },
            update: data
        });

        revalidatePath(`/admin/dashboard/doctors/${doctorId}/availability`);
        return { success: true };
    } catch (error) {
        console.error("Error updating doctor schedule:", error);
        return { success: false, error: "Failed to update schedule" };
    }
}

export async function deleteDoctorSchedule(doctorId: string, dayOfWeek: number) {
    try {
        await prisma.doctorSchedule.delete({
            where: {
                doctorId_dayOfWeek: {
                    doctorId,
                    dayOfWeek
                }
            }
        });

        revalidatePath(`/admin/dashboard/doctors/${doctorId}/availability`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting doctor schedule:", error);
        return { success: false, error: "Failed to delete schedule" };
    }
}

// ===== EXCEPTION MANAGEMENT =====

export async function getDoctorExceptions(doctorId: string) {
    try {
        const exceptions = await prisma.doctorException.findMany({
            where: { doctorId },
            orderBy: { date: 'asc' }
        });
        return { success: true, exceptions };
    } catch (error) {
        console.error("Error fetching doctor exceptions:", error);
        return { success: false, exceptions: [] };
    }
}

export async function createDoctorException(
    doctorId: string,
    data: {
        date: Date;
        isAvailable: boolean;
        startTime?: string;
        endTime?: string;
        reason?: string;
    }
) {
    try {
        await prisma.doctorException.create({
            data: {
                doctorId,
                ...data
            }
        });

        revalidatePath(`/admin/dashboard/doctors/${doctorId}/availability`);
        return { success: true };
    } catch (error) {
        console.error("Error creating doctor exception:", error);
        return { success: false, error: "Failed to create exception" };
    }
}

export async function updateDoctorException(
    exceptionId: string,
    data: {
        isAvailable: boolean;
        startTime?: string;
        endTime?: string;
        reason?: string;
    }
) {
    try {
        await prisma.doctorException.update({
            where: { id: exceptionId },
            data
        });

        revalidatePath(`/admin/dashboard/doctors`);
        return { success: true };
    } catch (error) {
        console.error("Error updating doctor exception:", error);
        return { success: false, error: "Failed to update exception" };
    }
}

export async function deleteDoctorException(exceptionId: string) {
    try {
        await prisma.doctorException.delete({
            where: { id: exceptionId }
        });

        revalidatePath(`/admin/dashboard/doctors`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting doctor exception:", error);
        return { success: false, error: "Failed to delete exception" };
    }
}

// ===== AVAILABLE SLOTS CALCULATION =====

export async function getAvailableSlots(doctorId: string, date: Date) {
    try {
        const dayOfWeek = date.getDay();
        const dateStr = date.toISOString().split('T')[0];

        // Check for exception on this date
        const exception = await prisma.doctorException.findUnique({
            where: {
                doctorId_date: {
                    doctorId,
                    date: new Date(dateStr)
                }
            }
        });

        // If exception exists and doctor is unavailable, return empty slots
        if (exception && !exception.isAvailable) {
            return { success: true, slots: [], reason: exception.reason };
        }

        // Get schedule for this day of week
        const schedule = await prisma.doctorSchedule.findUnique({
            where: {
                doctorId_dayOfWeek: {
                    doctorId,
                    dayOfWeek
                }
            }
        });

        // If no schedule or inactive, return empty slots
        if (!schedule || !schedule.isActive) {
            return { success: true, slots: [] };
        }

        // Use exception times if available, otherwise use schedule times
        const startTime = exception?.startTime || schedule.startTime;
        const endTime = exception?.endTime || schedule.endTime;
        const slotDuration = schedule.slotDuration;

        // Generate time slots (with break time if configured)
        const slots = generateTimeSlots(
            startTime,
            endTime,
            slotDuration,
            schedule.breakStartTime || undefined,
            schedule.breakEndTime || undefined
        );

        // Get existing appointments for this date
        const startOfDay = new Date(dateStr);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateStr);
        endOfDay.setHours(23, 59, 59, 999);

        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId,
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: {
                    notIn: ['CANCELLED']
                }
            },
            select: {
                date: true
            }
        });

        // Filter out booked slots
        const bookedTimes = new Set(
            appointments.map(apt => {
                const time = apt.date.toTimeString().slice(0, 5);
                return time;
            })
        );

        const availableSlots = slots.filter(slot => !bookedTimes.has(slot));

        return { success: true, slots: availableSlots };
    } catch (error) {
        console.error("Error getting available slots:", error);
        return { success: false, slots: [] };
    }
}

// Helper function to generate time slots
function generateTimeSlots(
    startTime: string,
    endTime: string,
    duration: number,
    breakStart?: string,
    breakEnd?: string
): string[] {
    const slots: string[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Parse break times if provided
    let breakStartMinutes: number | null = null;
    let breakEndMinutes: number | null = null;
    if (breakStart && breakEnd) {
        const [bsHour, bsMin] = breakStart.split(':').map(Number);
        const [beHour, beMin] = breakEnd.split(':').map(Number);
        breakStartMinutes = bsHour * 60 + bsMin;
        breakEndMinutes = beHour * 60 + beMin;
    }

    while (currentMinutes + duration <= endMinutes) {
        // Skip if slot falls within break time
        if (breakStartMinutes !== null && breakEndMinutes !== null) {
            if (currentMinutes >= breakStartMinutes && currentMinutes < breakEndMinutes) {
                currentMinutes += duration;
                continue;
            }
        }

        const hours = Math.floor(currentMinutes / 60);
        const mins = currentMinutes % 60;
        const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        slots.push(timeStr);
        currentMinutes += duration;
    }

    return slots;
}

