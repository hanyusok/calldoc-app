"use client";

import { useState } from 'react';
import AppointmentActions from './AppointmentActions';
import AppointmentTimeline from './AppointmentTimeline';
import MeetManager from '@/components/admin/appointments/MeetManager';
import PrescriptionManager from '@/components/admin/appointments/PrescriptionManager';
import PriceManager from '@/components/admin/appointments/PriceManager';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppointmentStatus } from '@prisma/client';

function StatusBadge({ status }: { status: string }) {
    const t = useTranslations('Admin.status');
    const styles: Record<string, string> = {
        [AppointmentStatus.PENDING]: 'bg-amber-50 text-amber-700 border-amber-100',
        [AppointmentStatus.AWAITING_PAYMENT]: 'bg-blue-50 text-blue-700 border-blue-100',
        [AppointmentStatus.CONFIRMED]: 'bg-green-50 text-green-700 border-green-100',
        [AppointmentStatus.COMPLETED]: 'bg-gray-100 text-gray-700 border-gray-200',
        [AppointmentStatus.CANCELLED]: 'bg-red-50 text-red-700 border-red-100',
    };

    // Fallback if status key not found
    const label = Object.values(AppointmentStatus).includes(status as AppointmentStatus)
        ? t(status as any)
        : status;

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles[AppointmentStatus.PENDING]}`}>
            {label}
        </span>
    );
}

export default function AppointmentRow({ appointment }: { appointment: any }) {
    const tDash = useTranslations('Admin.dashboard');
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => setExpanded(!expanded);

    return (
        <>
            <tr className={`hover:bg-gray-50 transition-colors ${expanded ? 'bg-gray-50' : ''}`}>
                <td className="p-4 font-medium text-gray-900">
                    <div>{appointment.user.name}</div>
                    <div className="text-xs text-gray-500">{appointment.user.email}</div>
                </td>
                <td className="p-4 text-gray-600">
                    <div suppressHydrationWarning>{new Date(appointment.date).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500" suppressHydrationWarning>
                        {new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </td>
                <td className="p-4 text-gray-600">
                    <div>{appointment.doctor.name}</div>
                    <div className="text-xs text-gray-500">{appointment.doctor.specialty}</div>
                </td>
                <td className="p-4">
                    <StatusBadge status={appointment.status} />
                </td>
                <td className="p-4 text-right font-medium text-gray-900">
                    {appointment.price ? `$${appointment.price}` : '-'}
                </td>
                <td className="p-4 flex gap-2 justify-center items-center">
                    <AppointmentActions appointment={appointment} />
                    <button
                        onClick={toggleExpand}
                        className="p-1 hover:bg-gray-200 rounded text-gray-500"
                        title={tDash('manage_appointment')}
                    >
                        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                </td>
            </tr>
            {expanded && (
                <tr className="bg-gray-50/50">
                    <td colSpan={6} className="p-4 border-t border-gray-100">
                        {/* Timeline Visualization */}
                        <div className="mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <h4 className="text-sm font-bold text-gray-900 mb-2">{tDash('timeline_title') || 'Appointment Timeline'}</h4>
                            <AppointmentTimeline appointment={appointment} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Price Manager for PENDING */}
                            {appointment.status === 'PENDING' && (
                                <PriceManager
                                    appointmentId={appointment.id}
                                    currentPrice={appointment.price}
                                />
                            )}

                            {/* Meet Manager only if confirmed or active */}
                            {['CONFIRMED', 'COMPLETED'].includes(appointment.status) && (
                                <MeetManager
                                    appointmentId={appointment.id}
                                    patientName={appointment.user.name || tDash('patient_fallback')}
                                    startDateTime={appointment.date}
                                    endDateTime={new Date(new Date(appointment.date).getTime() + 30 * 60000)}
                                // Pass existing link if stored, but MeetManager currently generates dynamic link
                                // Logic to store link update would be needed if we want persistence
                                />
                            )}

                            {/* Prescription Manager */}
                            {['CONFIRMED', 'COMPLETED'].includes(appointment.status) && (
                                <PrescriptionManager
                                    appointmentId={appointment.id}
                                    prescription={appointment.prescription}
                                    userPharmacy={appointment.user.pharmacy}
                                />
                            )}

                            {/* Fallback for other statuses or if no actions needed */}
                            {/* !['PENDING', 'CONFIRMED', 'COMPLETED'].includes(appointment.status) ... */}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
