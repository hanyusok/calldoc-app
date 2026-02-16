import { getUserAppointments, getMyVaccinationReservations } from './actions';
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle, ArrowRight, Syringe } from 'lucide-react';
import Link from 'next/link';
import NotificationWatcher from '@/components/dashboard/NotificationWatcher';
import PayButton from '@/components/dashboard/PayButton';
import { getTranslations } from 'next-intl/server';
import VaccinationReservationCard from '@/components/myappointment/VaccinationReservationCard';
import StatusProgressBar from '@/components/myappointment/StatusProgressBar';

export default async function MyAppointmentPage() {
    const session = await auth();
    const t = await getTranslations('MyAppointmentPage');
    if (!session?.user) {
        redirect('/login');
    }

    const appointments = await getUserAppointments();
    const vaccinations = await getMyVaccinationReservations();

    const pending = appointments.filter(a => a.status === 'PENDING');
    const awaitingPayment = appointments.filter(a => a.status === 'AWAITING_PAYMENT');
    // Active appointments (CONFIRMED) are always shown in the main list until completed
    const upcoming = appointments.filter(a => a.status === 'CONFIRMED');

    // Past appointments are those that are marked COMPLETED
    const past = appointments.filter(a => a.status === 'COMPLETED');

    // IDs that are already confirmed when the page loads
    const initialConfirmedIds = awaitingPayment.map(a => a.id);

    const StatusBadge = ({ status }: { status: string }) => {
        let label = status;
        let className = "text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full text-xs font-medium";

        switch (status) {
            case 'PENDING':
                label = t('status.requested');
                className = "text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-100";
                break;
            case 'AWAITING_PAYMENT':
                label = t('status.payment_required');
                className = "text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full text-xs font-bold border border-blue-100";
                break;
            case 'CONFIRMED':
                label = t('status.confirmed');
                className = "text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold border border-green-100";
                break;
            case 'COMPLETED':
                label = t('status.completed');
                className = "text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full text-xs font-bold border border-gray-200";
                break;
        }
        return <span className={className}>{label}</span>;
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            <NotificationWatcher
                initialConfirmedIds={initialConfirmedIds}
                messages={{
                    payment_required: t('status.payment_required'),
                    confirmed: t('status.confirmed'),
                    cancelled: t('status.CANCELLED'), // Check if key exists (legacy key was uppercase in code but maybe lowercase in json)
                    completed: t('status.completed'),
                    price_confirmed_msg: t('card.price_confirmed_msg', { doctor: '{doctor}', price: '{price}' }),
                    enter_room: t('card.enter_room'),
                    action_required: t('action_required')
                }}
            />
            {/* Header (reused or simplified) */}
            <div className="bg-white sticky top-0 z-10 px-4 py-3 shadow-sm flex items-center justify-between">
                <h1 className="text-lg font-bold text-gray-900">{t('title')}</h1>
            </div>

            <div className="px-4 py-4 space-y-6">

                {/* 1. Action Needed (Payment) */}
                {awaitingPayment.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            {t('action_required')}
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

                                        <div className="pt-3 border-t border-gray-50 flex flex-col gap-4">
                                            <StatusProgressBar status={apt.status} />

                                            <div className="flex items-center justify-between bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                                                <div>
                                                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tight mb-0.5">{t('card.consultation_fee')}</p>
                                                    <p className="text-lg font-black text-gray-900 leading-none">
                                                        <span className="text-xs font-medium text-gray-400 mr-1">$</span>
                                                        {(apt as any).price}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <PayButton appointmentId={apt.id} price={(apt as any).price} />
                                                </div>
                                            </div>
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
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t('pending')}</h2>
                        <div className="space-y-3">
                            {pending.map(apt => (
                                <div key={apt.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <h3 className="font-bold text-gray-900 leading-none">{apt.doctor.name}</h3>
                                            <p className="text-xs text-gray-500 mt-1">{apt.doctor.hospital}</p>
                                        </div>
                                    </div>
                                    <StatusProgressBar status={apt.status} />
                                    <div className="flex items-center gap-3 text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl mt-4">
                                        <Clock size={14} />
                                        {t('card.waiting_price')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. Upcoming */}
                {upcoming.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t('upcoming')}</h2>
                        <div className="space-y-3">
                            {upcoming.map(apt => (
                                <div key={apt.id} className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-l-green-500">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-bold">Dr</div>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 leading-none">{apt.doctor.name}</h3>
                                                <p className="text-xs text-gray-500 mt-1">{t('card.video_consult')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">{new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            <p className="text-xs text-gray-500">{new Date(apt.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <StatusProgressBar status={apt.status} />
                                    <div className="flex gap-2 mt-3">
                                        {apt.meetingLink ? (
                                            <a
                                                href={apt.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 py-2 rounded-lg bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                                            >
                                                {t('card.enter_room')} <ArrowRight size={14} />
                                            </a>
                                        ) : (
                                            <button disabled className="flex-1 py-2 rounded-lg bg-gray-50 text-gray-400 text-xs font-bold cursor-not-allowed">
                                                {t('card.enter_room')} (Not Ready)
                                            </button>
                                        )}

                                        <button className="px-3 py-2 rounded-lg bg-gray-50 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors">
                                            {t('card.details')}
                                        </button>
                                    </div>
                                    {(apt as any).prescription && (
                                        <div className="mt-2 pt-2 border-t border-gray-100 text-xs">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Prescription:</span>
                                                <span className={`font-bold ${(apt as any).prescription.status === 'ISSUED' ? 'text-green-600' : 'text-amber-500'
                                                    }`}>
                                                    {(apt as any).prescription.status}
                                                </span>
                                            </div>
                                            {(apt as any).prescription.pharmacyName && (
                                                <div className="text-gray-400 mt-1">
                                                    Sent to: {(apt as any).prescription.pharmacyName}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 4. Vaccinations */}
                {vaccinations.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Syringe size={16} />
                            Vaccinations
                        </h2>
                        <div className="space-y-3">
                            {vaccinations.map((v: any) => (
                                <VaccinationReservationCard key={v.id} reservation={v} />
                            ))}
                        </div>
                    </section>
                )}

                {/* 5. Past / Empty State */}
                {past.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 opacity-60">{t('past')}</h2>
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

                {appointments.length === 0 && vaccinations.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                            <Calendar size={40} />
                        </div>
                        <h3 className="text-gray-900 font-bold mb-1">{t('empty.title')}</h3>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
                            {t('empty.desc')}
                        </p>
                        <Link href="/consult" className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-600/30">
                            {t('empty.button')}
                        </Link>
                    </div>
                )}

            </div>
            <BottomNav />
        </div>
    );
}
