'use server';

import { prisma } from "@/app/lib/prisma";
import type { Doctor } from "@prisma/client";
import { AppointmentStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createKSTDate } from "@/app/lib/date";

export async function getDoctors({
    query,
    category,
    filter
}: {
    query?: string;
    category?: string;
    filter?: string;
}): Promise<Doctor[]> {
    const where: any = {};

    // Text Search
    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { specialty: { contains: query, mode: 'insensitive' } },
            // Search in Clinic name as well
            { clinic: { name: { contains: query, mode: 'insensitive' } } },
            // Legacy fallback removed
            { bio: { contains: query, mode: 'insensitive' } },
        ];
    }

    // Category (Specialty) Match
    if (category) {
        // Handle "symptoms", "health check" etc mapping to specialties if needed
        // For now, assume category matches specialty loosely or strict
        // Simple mapping for demo:
        const categoryMap: Record<string, string> = {
            'telemedicine': '', // Show all specialties for Telemedicine (or filter by specific logic if needed)
            'clinic': '', // Show all clinics
            'hospital': '', // Legacy support
            'pharmacy': '', // Maybe show Pharmacists if added?
            'symptoms': '',
            'health-check': 'Family Medicine',
            'vaccination': '', // Handled separately via getVaccinations
            'lab-test': '',
            'events': '',
        };

        let mappedSpecialty = category;
        if (Object.prototype.hasOwnProperty.call(categoryMap, category)) {
            mappedSpecialty = categoryMap[category];
        }

        if (mappedSpecialty) {
            where.specialty = { contains: mappedSpecialty, mode: 'insensitive' };
        }
    }

    // Filter Logic
    if (filter === 'available') {
        where.isAvailable = true;
    } else if (filter === 'female') {
        where.gender = 'female';
    }
    // 'nearest' and 'rating' are sort orders, not where clauses usually, but let's see.

    let orderBy: any = {};
    if (filter === 'rating') {
        orderBy = { rating: 'desc' }; // High ratings first
    } else if (filter === 'nearest') {
        // In a real app, use PostGIS or Haversine. 
        // For mock, maybe sort by id logic or just random? 
        // Let's just default to rating for now as "nearest" mock isn't easy without coords.
        orderBy = { id: 'asc' };
    } else {
        // Default sort
        orderBy = { isAvailable: 'desc' }; // Available first
    }

    // If filter is 'popularity' or something similar implies sort by patients
    if (filter === 'popular') {
        orderBy = { patients: 'desc' };
    }

    // Filter out doctors from hidden clinics (if clinic exists)
    // We need to handle cases where doctor has no clinic (clinicId is null) if that's allowed, 
    // but usually they belong to one. 
    // If strict: where.clinic = { isVisible: true };
    // If loose (allow no clinic): AND not hidden clinic.
    // Based on schema, clinicId is nullable.
    // But requirement is "hide invisible clinics", implies doctors of those clinics.
    // Let's enforce: Only show if clinic is visible OR if they have no clinic (dependent on business logic).
    // Safest for "hide hidden" is:

    // However, prisma where clause:
    // where: { ...where, clinic: { isVisible: true } } might filter out doctors with NO clinic if it does an inner join equivalent?
    // Actually, distinct filter:
    if (!where.clinic) where.clinic = {};
    where.clinic.isVisible = true;

    const doctors = await prisma.doctor.findMany({
        where,
        orderBy,
        include: { clinic: true } // Include clinic details
    });

    return doctors;
}

export async function getClinics({
    query,
}: {
    query?: string;
}) {
    const where: any = {
        isVisible: true, // Only show visible clinics
    };

    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { address: { contains: query, mode: 'insensitive' } },
        ];
    }

    return await prisma.clinic.findMany({
        where,
        orderBy: { name: 'asc' },
    });
}


export async function getPharmacies({
    query,
    filter
}: {
    query?: string;
    filter?: string;
}) {
    const where: any = {};

    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { address: { contains: query, mode: 'insensitive' } },
        ];
    }

    if (filter && filter !== 'all') {
        if (filter === 'at_front') {
            where.atFront = true;
        } else {
            // Map filter ID to Korean city name or part of address
            const cityMap: Record<string, string> = {
                'anseong': '안성',
                'pyeongtaek': '평택',
                'osan': '오산',
            };
            const searchTerm = cityMap[filter] || filter;
            where.address = { contains: searchTerm };
        }
    }

    return await prisma.pharmacy.findMany({
        where,
        orderBy: { isDefault: 'desc' }, // Default ones first, then others
    });
}

export async function getDoctorById(id: string) {
    return await prisma.doctor.findUnique({
        where: { id },
        include: { clinic: true }
    });
}

export async function createAppointment(formData: FormData) {
    'use server';

    const userId = formData.get('userId') as string; // Main User ID (Requester)
    const doctorId = formData.get('doctorId') as string;
    const patientId = formData.get('patientId') as string; // Can be userId or familyMemberId
    const dateStr = formData.get('date') as string;
    const timeStr = formData.get('time') as string;
    const symptoms = formData.get('symptoms') as string;

    if (!userId || !doctorId || !dateStr || !timeStr) {
        throw new Error("Missing required fields");
    }

    // Combine date and time into a single DateTime object (KST -> UTC)
    // dateStr is "YYYY-MM-DD", timeStr is "HH:mm"
    const date = createKSTDate(dateStr, timeStr);

    // Determine if booking is for a family member
    const familyMemberId = patientId !== userId ? patientId : null;

    // Essential check for doctor existence
    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) {
        console.error("DEBUG: DOCTOR NOT FOUND IN DB:", doctorId);
        throw new Error(`Doctor with ID ${doctorId} not found`);
    }

    const appointment = await prisma.appointment.create({
        data: {
            userId,
            doctorId,
            familyMemberId,
            date: date,
            status: AppointmentStatus.PENDING, // Wait for doctor to set price,
            symptoms: symptoms || null,
        },
        include: { user: true } // Include user to get name for notification
    });

    // Notify Admins (For now, we notify the doctor if they have a user account, or all admins)
    // Finding admin users
    const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' }
    });

    if (admins.length > 0) {
        await prisma.notification.createMany({
            data: admins.map(admin => ({
                userId: admin.id,
                type: 'APPOINTMENT_REQUEST',
                message: `New appointment request from ${appointment.user.name || 'User'}`,
                key: 'Notifications.appointment_request_admin',
                params: JSON.stringify({ user: appointment.user.name || 'User' }),
                link: `/admin/dashboard/appointments?highlight=${appointment.id}`,
            }))
        });
    }

    revalidatePath('/myappointment');

    // Redirect to success page
    redirect(`/doctor/${doctorId}/book/success?appointmentId=${appointment.id}`);
}

export async function getVaccinations({
    query,
}: {
    query?: string;
}) {
    const where: any = {};

    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
        ];
    }

    return await prisma.vaccination.findMany({
        where,
        orderBy: { name: 'asc' },
    });
}
