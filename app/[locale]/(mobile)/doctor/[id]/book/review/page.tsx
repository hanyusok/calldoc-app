import React from 'react';
import { getDoctorById, createAppointment } from '@/app/[locale]/(mobile)/consult/actions';
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from 'next/navigation';
import { ChevronLeft, Calendar, User, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default async function BookingReviewPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const { id } = await params;
    const { date, time, patientId, patientName, patientType } = await searchParams;
    const doctor = await getDoctorById(id);
    const session = await auth();

    if (!doctor || !date || !time || !patientId || !session?.user?.email) {
        redirect(`/doctor/${id}/book`); // Redirect back if missing data
    }

    const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!dbUser) {
        redirect('/login');
    }

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 px-4 py-3 flex items-center gap-3 shadow-sm mb-6">
                <Link href={`/doctor/${id}/book/patient`} className="text-gray-600 hover:text-gray-900">
                    <ChevronLeft size={24} />
                </Link>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-gray-900 leading-tight">Review & Confirm</h1>
                    <p className="text-xs text-gray-500">Step 3 of 3</p>
                </div>
            </div>

            <div className="px-4 space-y-4">
                {/* Doctor Info */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                        <img
                            src={doctor.imageUrl || '/placeholder-doctor.jpg'}
                            alt={doctor.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{doctor.name}</h3>
                        <p className="text-sm text-primary-600">{doctor.specialty}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{doctor.hospital}</p>
                    </div>
                </div>

                {/* Appointment Details */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-bold text-gray-800 text-sm">Appointment Details</h3>

                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-blue-50 text-blue-600">
                            <Calendar size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Date & Time</p>
                            <p className="font-medium text-gray-900">{formattedDate}</p>
                            <p className="font-medium text-gray-900">{time}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-orange-50 text-orange-600">
                            <User size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Patient</p>
                            <p className="font-medium text-gray-900">{patientName}</p>
                            <p className="text-xs text-gray-400 capitalize">{patientType === 'myself' ? 'Self' : 'Family Member'}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-green-50 text-green-600">
                            <CheckCircle size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Consultation Fee</p>
                            <p className="font-bold text-gray-900">$50.00</p>
                        </div>
                    </div>
                </div>

                {/* Payment Breakdown (Visual Only) */}
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-500">Consultation Fee</span>
                        <span className="text-gray-900 font-medium">To be confirmed</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-500">Service Fee</span>
                        <span className="text-gray-900 font-medium">$2.00</span>
                    </div>
                    <div className="border-t border-gray-100 my-2 pt-2 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Estimated Total</span>
                        <span className="font-bold text-primary-600 text-lg">~ $2.00 + Fee</span>
                    </div>
                </div>
            </div>

            {/* Confirm Button Form */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 border-t border-gray-100 bg-white z-20">
                <form action={createAppointment}>
                    <input type="hidden" name="doctorId" value={id} />
                    <input type="hidden" name="userId" value={dbUser.id} />
                    <input type="hidden" name="patientId" value={patientId} />
                    <input type="hidden" name="date" value={date} />
                    <input type="hidden" name="time" value={time} />
                    {/* Note: Schema might need a datetime, we'll combine them in the action */}

                    <button
                        type="submit"
                        className="w-full py-3.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/30 active:scale-95 transition-all"
                    >
                        Request Appointment
                    </button>
                </form>
            </div>
        </div>
    );
}
