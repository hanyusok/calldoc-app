import React from 'react';
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import PatientSelection from '@/components/booking/PatientSelection';

export default async function BookingPatientPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.email) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { familyMembers: true }
    });

    if (!user) {
        return <div>User not found</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 px-4 py-3 flex items-center gap-3 shadow-sm mb-6">
                <Link href={`/doctor/${id}/book`} className="text-gray-600 hover:text-gray-900">
                    <ChevronLeft size={24} />
                </Link>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-gray-900 leading-tight">Select Patient</h1>
                    <p className="text-xs text-gray-500">Step 2 of 3</p>
                </div>
            </div>

            <div className="px-4">
                <PatientSelection user={user as any} doctorId={id} />
            </div>
        </div>
    );
}
