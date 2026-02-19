'use server'

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { getKSTDayRangeInUTC, formatKSTTime } from "@/app/lib/date";

export async function getDoctors(page = 1, limit = 10, search = "") {
    try {
        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { specialty: { contains: search, mode: 'insensitive' } },
                { clinic: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [doctors, total] = await Promise.all([
            prisma.doctor.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    clinic: true,
                    _count: {
                        select: { appointments: true }
                    }
                }
            }),
            prisma.doctor.count({ where })
        ]);

        return {
            doctors,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };

    } catch (error) {
        console.error("Error fetching doctors:", error);
        return { doctors: [], total: 0, totalPages: 0, currentPage: 1 };
    }
}

export async function createDoctor(data: any) {
    try {
        await prisma.doctor.create({
            data: {
                name: data.name,
                specialty: data.specialty,
                clinicId: data.clinicId,
                bio: data.bio,
                imageUrl: data.imageUrl,
                rating: data.rating ? parseFloat(data.rating) : 5.0,
                patients: data.patients ? parseInt(data.patients) : 0,
                consultationFee: data.consultationFee ? parseInt(data.consultationFee) : 5000,
                isAvailable: data.isAvailable
            }
        });

        revalidatePath('/admin/dashboard/doctors');
        return { success: true };
    } catch (error) {
        console.error("Error creating doctor:", error);
        return { success: false, error: "Failed to create doctor" };
    }
}

export async function updateDoctor(doctorId: string, data: any) {
    try {
        await prisma.doctor.update({
            where: { id: doctorId },
            data: {
                name: data.name,
                specialty: data.specialty,
                clinicId: data.clinicId,
                bio: data.bio,
                imageUrl: data.imageUrl,
                rating: data.rating ? parseFloat(data.rating) : undefined,
                patients: data.patients ? parseInt(data.patients) : undefined,
                consultationFee: data.consultationFee ? parseInt(data.consultationFee) : undefined,
                isAvailable: data.isAvailable
            }
        });

        revalidatePath('/admin/dashboard/doctors');
        return { success: true };
    } catch (error) {
        console.error("Error updating doctor:", error);
        return { success: false, error: "Failed to update doctor" };
    }
}

export async function deleteDoctor(doctorId: string) {
    try {
        await prisma.doctor.delete({
            where: { id: doctorId }
        });

        revalidatePath('/admin/dashboard/doctors');
        return { success: true };
    } catch (error) {
        console.error("Error deleting doctor:", error);
        return { success: false, error: "Failed to delete doctor" };
    }
}

export async function getClinicsForSelect() {
    try {
        return await prisma.clinic.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        console.error("Error fetching clinics:", error);
        return [];
    }
}

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

export async function getAvailableSlots(doctorId: string, dateInput: Date | string) {
    try {
        // Ensure we work with a Date object for dayOfWeek
        const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        const dayOfWeek = dateObj.getDay();

        // If it's a date object from client, it might be in local time (UTC if serialized)
        // We want the YYYY-MM-DD string representation that the user SELECTED.
        // If passed as string "2026-02-15", use it.
        // If passed as Date, convert to KST string or ISO date string part carefully.
        let dateStr: string;
        if (typeof dateInput === 'string') {
            // Expecting "YYYY-MM-DD" or ISO
            dateStr = dateInput.split('T')[0];
        } else {
            // It's a Date object. Assuming the client sends a date that represents 00:00 local time
            // We need to be careful. The safest is if the client sends YYYY-MM-DD string.
            const year = dateInput.getFullYear();
            const month = String(dateInput.getMonth() + 1).padStart(2, '0');
            const day = String(dateInput.getDate()).padStart(2, '0');
            dateStr = `${year}-${month}-${day}`;
        }

        // Check for exception on this date (KST Date)
        // Use the KST date string to query exceptions if you store them as YYYY-MM-DD or specific Dates
        // NOTE: Your DoctorException model stores `date` as DateTime @db.Date.
        // Prisma usually handles @db.Date by ignoring time, but checks against UTC? 
        // Let's stick to the range query just to be safe or use the string if Prisma adapter handles it.
        // Better: Query exception by range of that KST day.

        const { start: startOfDay, end: endOfDay } = getKSTDayRangeInUTC(dateStr);

        const exception = await prisma.doctorException.findFirst({
            where: {
                doctorId,
                date: {
                    gte: startOfDay,
                    lte: endOfDay
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
        // Convert DB UTC times to KST "HH:mm" to match the generated slots
        const bookedTimes = new Set(
            appointments.map(apt => formatKSTTime(apt.date))
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
