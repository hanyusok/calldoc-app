"use client";

import { useState, useTransition } from 'react';
import AppointmentActions from './AppointmentActions';
import AppointmentTimeline from './AppointmentTimeline';
import MeetManager from '@/components/admin/appointments/MeetManager';
import PrescriptionManager from '@/components/admin/appointments/PrescriptionManager';
import { ChevronDown, ChevronUp, Clock, CreditCard, CheckCircle2, XCircle, Video, Send, Loader2, DollarSign } from 'lucide-react';
import { useTranslations, useFormatter } from 'next-intl';
import { AppointmentStatus } from '@prisma/client';
import { updateAppointment, completeAppointment } from '@/app/actions/appointment';
import { useRouter } from 'next/navigation';

function StatusIcon({ status }: { status: string }) {
    const t = useTranslations('Admin.status');
    const icons: Record<string, { icon: any, color: string, bg: string }> = {
        [AppointmentStatus.PENDING]: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
        [AppointmentStatus.AWAITING_PAYMENT]: { icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50' },
        [AppointmentStatus.CONFIRMED]: { icon: Video, color: 'text-green-500', bg: 'bg-green-50' },
        [AppointmentStatus.COMPLETED]: { icon: CheckCircle2, color: 'text-gray-400', bg: 'bg-gray-50' },
        [AppointmentStatus.CANCELLED]: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
    };

    const config = icons[status] || icons[AppointmentStatus.PENDING];
    const Icon = config.icon;
    const label = Object.values(AppointmentStatus).includes(status as AppointmentStatus)
        ? t(status as any)
        : status;

    return (
        <div className="flex flex-col items-center gap-1 group relative">
            <div className={`${config.bg} ${config.color} p-2 rounded-full transition-transform group-hover:scale-110 shadow-sm`}>
                <Icon size={18} />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                {label}
            </span>
        </div>
    );
}


export default function AppointmentRow({ appointment }: { appointment: any }) {
    const tDash = useTranslations('Admin.dashboard');
    const tPrice = useTranslations('Admin.price_manager');
    const format = useFormatter();
    const router = useRouter();
    const [expanded, setExpanded] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [price, setPrice] = useState(appointment.price || 0);

    const toggleExpand = () => setExpanded(!expanded);

    const handleSetPrice = async () => {
        if (!price || price <= 0) return;
        if (!confirm(tPrice('confirm_request', { price }))) return;

        startTransition(async () => {
            try {
                await updateAppointment(appointment.id, {
                    price: Number(price),
                    status: AppointmentStatus.AWAITING_PAYMENT
                });
                router.refresh();
            } catch (error) {
                console.error(error);
                alert("Failed to update price");
            }
        });
    };

    const handleComplete = async () => {
        if (!confirm(tDash('confirm_complete'))) return;
        startTransition(async () => {
            try {
                await completeAppointment(appointment.id);
                router.refresh();
            } catch (error) {
                console.error(error);
                alert("Failed to complete appointment");
            }
        });
    };

    return (
        <>
            <tr className={`hover:bg-gray-50 transition-colors ${expanded ? 'bg-gray-50' : ''}`}>
                <td className="p-4 font-medium text-gray-900">
                    <div className="flex flex-col">
                        <span>{appointment.user.name}</span>
                        <span className="text-xs text-gray-400 font-normal">{appointment.user.email}</span>
                    </div>
                </td>
                <td className="p-4 text-gray-600">
                    <div className="flex flex-col text-xs font-medium">
                        <span>{format.dateTime(new Date(appointment.date), { dateStyle: 'medium' })}</span>
                        <span className="text-gray-400">
                            {format.dateTime(new Date(appointment.date), { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                    </div>
                </td>
                <td className="p-4 text-gray-600">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">{appointment.doctor.name}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest">{appointment.doctor.specialty}</span>
                    </div>
                </td>
                <td className="p-4 text-center">
                    <StatusIcon status={appointment.status} />
                </td>
                <td className="p-4">
                    {appointment.status === AppointmentStatus.PENDING ? (
                        <div className="flex items-center gap-1 justify-end">
                            <div className="relative">
                                <input
                                    type="number"
                                    value={price === 0 && !isPending ? '' : price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    placeholder={tDash('table.price')}
                                    className="w-20 px-2 py-1 text-right text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 pointer-events-none">원</span>
                            </div>
                            <button
                                onClick={handleSetPrice}
                                disabled={isPending || !price}
                                className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                                title="Set Price & Request Payment"
                            >
                                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            </button>
                        </div>
                    ) : (
                        <div className="text-right font-bold text-gray-900">
                            {appointment.price ? (
                                <span className="flex items-center justify-end gap-1">
                                    {appointment.price.toLocaleString()}
                                    <span className="text-[10px] font-normal text-gray-400">원</span>
                                </span>
                            ) : '-'}
                        </div>
                    )}
                </td>
                <td className="p-4">
                    <div className="flex gap-2 justify-center items-center">
                        {appointment.status === AppointmentStatus.CONFIRMED && (
                            <button
                                onClick={handleComplete}
                                disabled={isPending}
                                className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100 hover:bg-green-100 transition-colors flex items-center gap-1.5"
                            >
                                {isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                <span className="hidden sm:inline">{tDash('complete')}</span>
                            </button>
                        )}

                        {(appointment.status === AppointmentStatus.CONFIRMED || appointment.status === AppointmentStatus.COMPLETED) && (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1.5 ${expanded ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'}`}
                            >
                                <Video size={14} />
                                <span className="hidden sm:inline">{expanded ? tDash('close') : tDash('manage')}</span>
                            </button>
                        )}

                        {!['CONFIRMED', 'COMPLETED', 'PENDING'].includes(appointment.status) && (
                            <button
                                onClick={toggleExpand}
                                className="p-1.5 hover:bg-gray-200 rounded text-gray-500 transition-colors"
                            >
                                {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                        )}

                        <div className="hidden sm:block">
                            <AppointmentActions appointment={appointment} />
                        </div>
                    </div>
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
                            {/* Meet Manager only if confirmed or active */}
                            {(appointment.status === AppointmentStatus.CONFIRMED || appointment.status === AppointmentStatus.COMPLETED) && (
                                <MeetManager
                                    appointmentId={appointment.id}
                                    patientName={appointment.user.name || tDash('patient_fallback')}
                                    startDateTime={appointment.date}
                                    endDateTime={new Date(new Date(appointment.date).getTime() + 30 * 60000)}
                                />
                            )}

                            {/* Prescription Manager */}
                            {(appointment.status === AppointmentStatus.CONFIRMED || appointment.status === AppointmentStatus.COMPLETED) && (
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
