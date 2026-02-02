import React from 'react';
import { getAdminAppointments } from '@/app/admin/actions';
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import { Calendar, Clock, User, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import AppointmentActions from './AppointmentActions';

export default async function AdminDashboardPage() {
    const session = await auth();
    // In a real app, check role here. For now, just require login.
    if (!session?.user) {
        redirect('/login');
    }

    const appointments = await getAdminAppointments();

    const pendingAppointments = appointments.filter(a => a.status === 'PENDING');
    const paymentPendingAppointments = appointments.filter(a => a.status === 'AWAITING_PAYMENT');
    const confirmedAppointments = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED');

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Doctor Dashboard</h1>
                    <div className="text-sm text-gray-500">
                        {session.user.name || session.user.email}
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-4 space-y-8">
                {/* Pending Requests Section */}
                <section>
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertCircle className="text-amber-500" />
                        Pending Requests ({pendingAppointments.length})
                    </h2>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {pendingAppointments.length === 0 && (
                            <p className="text-gray-400 text-sm col-span-full">No pending requests.</p>
                        )}
                        {pendingAppointments.map((apt) => (
                            <div key={apt.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                                            {apt.user.name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{apt.user.name}</p>
                                            <p className="text-xs text-gray-500">Patient</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                                        Action Required
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar size={16} className="text-gray-400" />
                                        {new Date(apt.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock size={16} className="text-gray-400" />
                                        {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <User size={16} className="text-gray-400" />
                                        {apt.doctor.name} (Dr)
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4">
                                    <AppointmentActions appointmentId={apt.id} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Looking for Payment Section */}
                <section>
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <DollarSign className="text-blue-500" />
                        Awaiting Payment ({paymentPendingAppointments.length})
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {paymentPendingAppointments.length === 0 && (
                            <p className="text-gray-400 text-sm col-span-full">No appointments waiting for payment.</p>
                        )}
                        {paymentPendingAppointments.map((apt) => (
                            <div key={apt.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm opacity-75 grayscale-[0.3]">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900">{apt.user.name}</h3>
                                    <span className="text-lg font-bold text-primary-600">${apt.price}</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-1">
                                    {new Date(apt.date).toLocaleDateString()} at {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="text-xs text-blue-600 font-medium">Waiting for patient to pay...</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Confirmed History Section */}
                <section>
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <CheckCircle className="text-green-500" />
                        Confirmed & Upcoming ({confirmedAppointments.length})
                    </h2>
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="p-4">Patient</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Doctor</th>
                                    <th className="p-4 text-right">Price</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {confirmedAppointments.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-6 text-center text-gray-400">No confirmed appointments.</td>
                                    </tr>
                                )}
                                {confirmedAppointments.map((apt) => (
                                    <tr key={apt.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">{apt.user.name}</td>
                                        <td className="p-4 text-gray-600">{new Date(apt.date).toLocaleDateString()}</td>
                                        <td className="p-4 text-gray-600">{apt.doctor.name}</td>
                                        <td className="p-4 text-right font-medium text-gray-900">${apt.price?.toFixed(2)}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs border border-green-100">
                                                {apt.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}
