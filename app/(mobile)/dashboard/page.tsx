import React from 'react';
import { getUserAppointments } from './actions';
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import NotificationWatcher from '@/components/dashboard/NotificationWatcher';
import PayButton from '@/components/dashboard/PayButton';

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user) {
        redirect('/login');
    }

    const appointments = await getUserAppointments();

    const pending = appointments.filter(a => a.status === 'PENDING');
    const awaitingPayment = appointments.filter(a => a.status === 'AWAITING_PAYMENT');
    const upcoming = appointments.filter(a => (a.status === 'CONFIRMED' || a.status === 'COMPLETED') && new Date(a.date) >= new Date());
    const past = appointments.filter(a => (a.status === 'CONFIRMED' || a.status === 'COMPLETED') && new Date(a.date) < new Date());

    // IDs that are already confirmed when the page loads
    const initialConfirmedIds = awaitingPayment.map(a => a.id);

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'PENDING':
                return <span className="text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-100">Requested</span>;
            case 'AWAITING_PAYMENT':
                return <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full text-xs font-bold border border-blue-100">Payment Required</span>;
            case 'CONFIRMED':
                return <span className="text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold border border-green-100">Confirmed</span>;
            case 'COMPLETED':
                return <span className="text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full text-xs font-bold border border-gray-200">Completed</span>;
            default:
                return <span className="text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full text-xs font-medium">{status}</span>;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            <NotificationWatcher initialConfirmedIds={initialConfirmedIds} />
            {/* Header (reused or simplified) */}
            <div className="bg-white sticky top-0 z-10 px-4 py-3 shadow-sm flex items-center justify-between">
                <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
            </div>

            <div className="px-4 py-4 space-y-6">

                {/* 1. Action Needed (Payment) */}
                {awaitingPayment.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            Action Required
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{awaitingPayment.length}</span>
                        </h2>
                        <div className="space-y-3">
                            {awaitingPayment.map(apt => (
                                <div key={apt.id} className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-5">
                                        <AlertCircle size={80} />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-gray-900">{apt.doctor.name}</h3>
                                                <p className="text-xs text-secondary-500 font-medium">{apt.doctor.specialty}</p>
                                            </div>
                                            <StatusBadge status={apt.status} />
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(apt.date).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} className="text-gray-400" />
                                                {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>

                                        <div className="flex items-center justifies-between gap-3 pt-3 border-t border-gray-100">
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500">Consultation Fee</p>
                                                <p className="text-lg font-bold text-gray-900">${(apt as any).price}</p>
                                            </div>
                                            <PayButton appointmentId={apt.id} price={(apt as any).price} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 2. Pending Request */}
                {pending.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Pending Requests</h2>
                        <div className="space-y-3">
                            {pending.map(apt => (
                                <div key={apt.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{apt.doctor.name}</h3>
                                            <p className="text-xs text-gray-500">{apt.doctor.hospital}</p>
                                        </div>
                                        <StatusBadge status={apt.status} />
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl">
                                        <Clock size={14} />
                                        Waiting for doctor to confirm price...
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. Upcoming */}
                {upcoming.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Upcoming Schedules</h2>
                        <div className="space-y-3">
                            {upcoming.map(apt => (
                                <div key={apt.id} className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-l-green-500">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                                {/* Image would go here */}
                                                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-bold">Dr</div>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{apt.doctor.name}</h3>
                                                <p className="text-xs text-gray-500">Video Consultation</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">{new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            <p className="text-xs text-gray-500">{new Date(apt.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <button className="flex-1 py-2 rounded-lg bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-colors">
                                            Enter Room
                                        </button>
                                        <button className="px-3 py-2 rounded-lg bg-gray-50 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors">
                                            Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 4. Past / Empty State */}
                {past.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 opacity-60">Past Appointments</h2>
                        <div className="space-y-3 opacity-60 grayscale-[0.5]">
                            {past.map(apt => (
                                <div key={apt.id} className="bg-white p-4 rounded-xl border border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-gray-900">{apt.doctor.name}</h3>
                                        <span className="text-xs font-medium text-gray-500">{new Date(apt.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {appointments.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                            <Calendar size={40} />
                        </div>
                        <h3 className="text-gray-900 font-bold mb-1">No Appointments Yet</h3>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
                            Find a specialist and book your first consultation today.
                        </p>
                        <Link href="/consult" className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-600/30">
                            Find a Doctor
                        </Link>
                    </div>
                )}

            </div>
            <BottomNav />
        </div>
    );
}
