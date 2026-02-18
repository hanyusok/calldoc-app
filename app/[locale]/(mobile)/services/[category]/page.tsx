import React from 'react';
import { ChevronLeft, Search } from 'lucide-react';
import Link from 'next/link';
import FilterBar from '@/components/FilterBar';
import DoctorCard from '@/components/consult/DoctorCard';
import { prisma } from '@/app/lib/prisma';

export default async function ServiceCategoryPage({
    params,
}: {
    params: Promise<{ category: string }>
}) {
    const { category } = await params;

    // Format category name (e.g., "telemedicine" -> "Telemedicine")
    const title = category.charAt(0).toUpperCase() + category.slice(1);

    // Fetch doctors from database
    // Note: In a real app we'd filter by category, but for now we fetch all to demonstrate DB connection
    const doctors = await prisma.doctor.findMany({
        include: { clinic: true }
    });

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
                <div className="flex items-center gap-3 px-4 py-3">
                    <Link href="/" className="p-1 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-lg font-bold flex-1">{title} Doctors</h1>
                    <button className="p-2 text-gray-800 hover:bg-gray-100 rounded-full">
                        <Search size={20} />
                    </button>
                </div>
                <FilterBar />
            </div>

            {/* List */}
            <div className="p-4">
                <p className="text-xs text-gray-500 mb-3 font-medium">
                    Found {doctors.length} specialists available
                </p>

                <div className="space-y-4">
                    {doctors.map((doctor) => (
                        <DoctorCard
                            key={doctor.id}
                            doctor={doctor}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
