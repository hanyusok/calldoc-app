'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { getAvailableSlots } from '@/app/actions/doctor-availability';

export default function DateTimeSelection({ doctorId }: { doctorId: string }) {
    const router = useRouter();
    const t = useTranslations('Booking');
    const locale = useLocale();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [today, setToday] = useState<Date | null>(null);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

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
                const result = await getAvailableSlots(doctorId, selectedDate);
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
    }, [selectedDate, doctorId]);

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
        // Only check isPast if 'today' is loaded (client-side)
        if (today && date < today) return;

        setSelectedDate(date);
        setSelectedTime(null); // Reset time when date changes
    };

    const handleNext = () => {
        if (selectedDate && selectedTime) {
            const dateStr = selectedDate.toISOString();
            router.push(`/doctor/${doctorId}/book/patient?date=${dateStr}&time=${selectedTime}`);
        }
    };

    const { days, firstDay } = getDaysInMonth(currentMonth);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                        // Create a date for each day of the week (starting from Sunday)
                        // 2024-01-07 was a Sunday
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

                        // Hydration safe: defaults to false on server (today is null), 
                        // re-evaluates to true/false on client (today is Date)
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
                                    ${isSelected ? 'bg-primary-600 text-white shadow-md' : ''}
                                    ${!isSelected && isToday ? 'text-primary-600 border border-primary-200' : ''}
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
                    <Clock size={16} className="text-primary-500" />
                    {t('available_time')}
                </h4>
                {selectedDate ? (
                    loadingSlots ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                            Loading available slots...
                        </div>
                    ) : timeSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3">
                            {timeSlots.map((time) => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={`
                                        py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all active:scale-95
                                        ${selectedTime === time
                                            ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-600/20'
                                            : 'border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600 bg-white'}
                                    `}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                            No available slots for this date
                        </div>
                    )
                ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                        {t('select_date_prompt')}
                    </div>
                )}
            </div>

            {/* Next Button */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                    onClick={handleNext}
                    disabled={!selectedDate || !selectedTime}
                    className={`
                        w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all
                        ${selectedDate && selectedTime
                            ? 'bg-primary-600 hover:bg-primary-700 shadow-primary-600/30 active:scale-95'
                            : 'bg-gray-300 shadow-none cursor-not-allowed'}
                    `}
                >
                    {t('continue_to_patient_details')}
                </button>
            </div>
        </div>
    );
}
