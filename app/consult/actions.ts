'use server';

import { prisma } from "@/app/lib/prisma";
import type { Doctor } from "@prisma/client";

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
            { hospital: { contains: query, mode: 'insensitive' } },
            { bio: { contains: query, mode: 'insensitive' } },
        ];
    }

    // Category (Specialty) Match
    if (category) {
        // Handle "symptoms", "health check" etc mapping to specialties if needed
        // For now, assume category matches specialty loosely or strict
        // Simple mapping for demo:
        const categoryMap: Record<string, string> = {
            'telemedicine': 'Telemedicine',
            'hospital': '', // Show all?
            'pharmacy': '', // Maybe show Pharmacists if added?
            'symptoms': '',
            'health-check': 'Family Medicine',
            'supplements': '',
            'lab-test': '',
            'events': '',
        };

        const mappedSpecialty = categoryMap[category] || category; // Fallback to exact string
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

    const doctors = await prisma.doctor.findMany({
        where,
        orderBy,
    });

    return doctors;
}
