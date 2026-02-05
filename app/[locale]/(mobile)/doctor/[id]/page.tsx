import React from 'react';
import { getDoctorById } from '@/app/(mobile)/consult/actions';
import { notFound } from 'next/navigation';
import { Star, MapPin, Clock, ChevronLeft, Calendar, Shield } from 'lucide-react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';

export default async function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const doctor = await getDoctorById(id);

    if (!doctor) {
        notFound();
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            <div className="bg-white sticky top-0 z-10 px-4 py-3 flex items-center gap-3 shadow-sm">
                <Link href="/consult" className="text-gray-600 hover:text-gray-900">
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-lg font-bold text-gray-900">Doctor Profile</h1>
            </div>

            <div className="px-4 py-4 space-y-4">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-gray-100 mb-4 overflow-hidden">
                            <img
                                src={doctor.imageUrl || '/placeholder-doctor.jpg'}
                                alt={doctor.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{doctor.name}</h2>
                        <p className="text-primary-600 font-medium">{doctor.specialty}</p>
                        <div className="flex items-center gap-1 mt-2 text-gray-500 text-sm">
                            <MapPin size={14} />
                            <span>{doctor.hospital}</span>
                        </div>
                    </div>

                    <div className="flex items-center mt-12 border-t border-gray-100 pt-8">
                        <div className="flex-1 flex items-center justify-center gap-1.5">
                            <Star size={16} className="text-yellow-500 fill-yellow-500" />
                            <div className="flex items-baseline gap-1">
                                <span className="font-bold text-gray-900">{doctor.rating.toFixed(1)}</span>
                                <span className="text-xs text-gray-500">Rating</span>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-gray-100"></div>
                        <div className="flex-1 flex items-center justify-center gap-1.5">
                            <div className="flex items-baseline gap-1">
                                <span className="font-bold text-gray-900">
                                    {doctor.patients > 1000 ? `${(doctor.patients / 1000).toFixed(1)}k+` : doctor.patients}
                                </span>
                                <span className="text-xs text-gray-500">Patients</span>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-gray-100"></div>
                        <div className="flex-1 flex items-center justify-center gap-1.5">
                            <div className="flex items-baseline gap-1">
                                <span className="font-bold text-gray-900">5+</span>
                                <span className="text-xs text-gray-500">Years</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-3">About Doctor</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {doctor.bio || `${doctor.name} is a highly experienced ${doctor.specialty} specialist committed to providing the best medical care. With a focus on patient well-being, they bring a wealth of knowledge and expertise to every consultation.`}
                    </p>
                </div>

                {/* Availability */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-3">Availability</h3>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl text-blue-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg">
                                <Calendar size={20} className="text-blue-600" />
                            </div>
                            <span className="font-medium">Next Available</span>
                        </div>
                        <span className="font-bold">Today</span>
                    </div>
                </div>
            </div>

            {/* Bottom Action */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 p-4 pb-8 flex items-center justify-between gap-4 z-20">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Consultation Fee</span>
                    <span className="text-lg font-bold text-primary-600">$50.00</span>
                </div>
                <Link
                    href={`/doctor/${id}/book`}
                    className="flex-1 bg-primary-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-600/30 hover:bg-primary-700 transition-all active:scale-95 text-center"
                >
                    Book Appointment
                </Link>
            </div>
        </div>
    );
}
