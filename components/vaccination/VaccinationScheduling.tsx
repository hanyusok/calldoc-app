'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { getVaccinationAvailableSlots, reserveVaccination } from '@/app/actions/vaccination';

interface VaccinationSchedulingProps {
    vaccinationId: string;
}

export default function VaccinationScheduling({ vaccinationId }: VaccinationSchedulingProps) {
    const router = useRouter();
    const t = useTranslations('Booking');
    const tVac = useTranslations('VaccinationCard');
    const locale = useLocale();

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [today, setToday] = useState<Date | null>(null);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [isReserving, setIsReserving] = useState(false);

    useEffect(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        setToday(d);
    }, []);

    // Fetch available slots when date changes
    useEffect(() => {
        if (!selectedDate) {
            setTimeSlots([]);
            return;
        }

        const fetchSlots = async () => {
            setLoadingSlots(true);
            try {
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;

                const result = await getVaccinationAvailableSlots(vaccinationId, dateStr);
                if (result.success) {
                    setTimeSlots(result.slots || []);
                } else {
                    setTimeSlots([]);
                }
            } catch (error) {
                console.error('Error fetching slots:', error);
                setTimeSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [selectedDate, vaccinationId]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const isSameDay = (d1: Date | null, d2: Date | null) => {
        if (!d1 || !d2) return false;
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const changeMonth = (offset: number) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + offset);
        setCurrentMonth(newMonth);
    };

    const handleDateClick = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        if (today && date < today) return;

        setSelectedDate(date);
        setSelectedTime(null);
    };

    const handleConfirm = async () => {
        if (selectedDate && selectedTime) {
            setIsReserving(true);
            try {
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;

                const result = await reserveVaccination(vaccinationId, dateStr, selectedTime);
                if (result.success) {
                    // Redirect to dedicated success page
                    router.push(`/${locale}/vaccination/${vaccinationId}/book/success?reservationId=${result.reservationId}`);
                } else {
                    alert(result.error || tVac('error_message'));
                }
            } catch (error) {
                console.error('Failed to reserve:', error);
                alert(tVac('error_message'));
            } finally {
                setIsReserving(false);
            }
        }
    };

    const { days, firstDay } = getDaysInMonth(currentMonth);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            {/* Calendar Header */}
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-full">
                    <ChevronLeft size={20} className="text-gray-500" />
                </button>
                <h3 className="font-bold text-gray-800">
                    {currentMonth.toLocaleString(locale, { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded-full">
                    <ChevronRight size={20} className="text-gray-500" />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
                <div className="grid grid-cols-7 mb-2 text-center">
                    {Array.from({ length: 7 }).map((_, i) => {
                        const date = new Date(2024, 0, 7 + i);
                        const dayName = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
                        return (
                            <div key={i} className="text-xs font-bold text-gray-400 py-1">
                                {dayName}
                            </div>
                        );
                    })}
                </div>
                <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: days }).map((_, i) => {
                        const day = i + 1;
                        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                        const isPast = today ? date < today : false;
                        const isSelected = isSameDay(date, selectedDate);
                        const isToday = isSameDay(date, today);

                        return (
                            <button
                                key={day}
                                onClick={() => handleDateClick(day)}
                                disabled={isPast}
                                className={`
                                    h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium transition-all
                                    ${isSelected ? 'bg-blue-600 text-white shadow-md' : ''}
                                    ${!isSelected && isToday ? 'text-blue-600 border border-blue-200' : ''}
                                    ${!isSelected && !isPast && !isToday ? 'text-gray-700 hover:bg-gray-100' : ''}
                                    ${isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                                `}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Time Slots */}
            <div className="border-t border-gray-100 p-4">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Clock size={16} className="text-blue-500" />
                    {t('available_time')}
                </h4>
                {selectedDate ? (
                    loadingSlots ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            Loading slots...
                        </div>
                    ) : timeSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3">
                            {timeSlots.map((time) => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={`
                                        py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all
                                        ${selectedTime === time
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                            : 'border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 bg-white'}
                                    `}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            No slots available
                        </div>
                    )
                ) : (
                    <div className="text-center py-8 text-gray-400 text-sm italic">
                        {t('select_date_prompt')}
                    </div>
                )}
            </div>

            {/* Confirm Button */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                    onClick={handleConfirm}
                    disabled={!selectedDate || !selectedTime || isReserving}
                    className={`
                        w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                        ${selectedDate && selectedTime && !isReserving
                            ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                            : 'bg-gray-300 shadow-none cursor-not-allowed'}
                    `}
                >
                    {isReserving ? tVac('reserving') : tVac('reserve_button')}
                </button>
            </div>
        </div>
    );
}
