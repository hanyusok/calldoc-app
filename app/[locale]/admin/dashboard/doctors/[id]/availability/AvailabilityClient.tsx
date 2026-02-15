"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { updateDoctorSchedule, createDoctorException, deleteDoctorException, getAvailableSlots } from "@/app/actions/doctor-availability";
import { Calendar, Clock, Plus, Trash2 } from "lucide-react";

const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday

export default function AvailabilityClient({
    doctorId,
    initialSchedules,
    initialExceptions
}: {
    doctorId: string;
    initialSchedules: any[];
    initialExceptions: any[];
}) {
    const t = useTranslations('Admin.doctors.availability');
    const [schedules, setSchedules] = useState<any[]>(initialSchedules);
    const [exceptions, setExceptions] = useState<any[]>(initialExceptions);
    const [loading, setLoading] = useState(false);

    // Exception form state
    const [showExceptionForm, setShowExceptionForm] = useState(false);
    const [exceptionForm, setExceptionForm] = useState({
        date: '',
        isAvailable: false,
        startTime: '',
        endTime: '',
        reason: ''
    });

    // Preview state
    const [previewDate, setPreviewDate] = useState('');
    const [previewSlots, setPreviewSlots] = useState<string[]>([]);

    const getDaySchedule = (dayOfWeek: number) => {
        return schedules.find(s => s.dayOfWeek === dayOfWeek) || {
            startTime: '09:00',
            endTime: '17:00',
            slotDuration: 30,
            breakStartTime: '',
            breakEndTime: '',
            isActive: false
        };
    };

    const handleScheduleLocalChange = (dayOfWeek: number, field: string, value: any) => {
        const currentSchedule = getDaySchedule(dayOfWeek);
        const updatedSchedule = { ...currentSchedule, [field]: value };

        // Update local state immediately for responsive UI
        const newSchedules = schedules.filter(s => s.dayOfWeek !== dayOfWeek);
        newSchedules.push({ ...updatedSchedule, dayOfWeek });
        setSchedules(newSchedules);
    };

    const handleScheduleSave = async (dayOfWeek: number) => {
        const schedule = getDaySchedule(dayOfWeek);

        setLoading(true);
        try {
            const result = await updateDoctorSchedule(doctorId, dayOfWeek, {
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                slotDuration: parseInt(schedule.slotDuration),
                breakStartTime: schedule.breakStartTime || undefined,
                breakEndTime: schedule.breakEndTime || undefined,
                isActive: schedule.isActive
            });

            if (result.success) {
                // Silently saved - no alert needed for better UX
                console.log('Schedule saved successfully');
            } else {
                alert(t('save_error'));
            }
        } catch (error) {
            console.error(error);
            alert(t('save_error'));
        } finally {
            setLoading(false);
        }
    };

    const handleAddException = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await createDoctorException(doctorId, {
                date: new Date(exceptionForm.date),
                isAvailable: exceptionForm.isAvailable,
                startTime: exceptionForm.isAvailable ? exceptionForm.startTime : undefined,
                endTime: exceptionForm.isAvailable ? exceptionForm.endTime : undefined,
                reason: exceptionForm.reason
            });

            if (result.success) {
                alert(t('exception_success'));
                setShowExceptionForm(false);
                setExceptionForm({
                    date: '',
                    isAvailable: false,
                    startTime: '',
                    endTime: '',
                    reason: ''
                });
                window.location.reload();
            } else {
                alert(t('exception_error'));
            }
        } catch (error) {
            console.error(error);
            alert(t('exception_error'));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteException = async (exceptionId: string) => {
        if (!confirm(t('delete_exception') + '?')) return;

        setLoading(true);
        try {
            const result = await deleteDoctorException(exceptionId);
            if (result.success) {
                setExceptions(exceptions.filter(e => e.id !== exceptionId));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async () => {
        if (!previewDate) return;

        setLoading(true);
        try {
            const result = await getAvailableSlots(doctorId, new Date(previewDate));
            if (result.success) {
                setPreviewSlots(result.slots || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Weekly Schedule */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Clock size={20} />
                    {t('weekly_schedule')}
                </h2>

                <div className="space-y-4">
                    {DAYS_OF_WEEK.map(day => {
                        const schedule = getDaySchedule(day);
                        const dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][day];

                        return (
                            <div key={day} className="p-3 bg-gray-50 rounded-lg space-y-2">
                                <div className="grid grid-cols-6 gap-3 items-center">
                                    <div className="font-medium text-sm">
                                        {t(`days.${dayKey}`)}
                                    </div>
                                    <input
                                        type="time"
                                        value={schedule.startTime}
                                        onChange={(e) => handleScheduleLocalChange(day, 'startTime', e.target.value)}
                                        onBlur={() => handleScheduleSave(day)}
                                        disabled={!schedule.isActive}
                                        className="px-2 py-1 border rounded text-sm disabled:bg-gray-100"
                                        placeholder={t('start_time')}
                                    />
                                    <input
                                        type="time"
                                        value={schedule.endTime}
                                        onChange={(e) => handleScheduleLocalChange(day, 'endTime', e.target.value)}
                                        onBlur={() => handleScheduleSave(day)}
                                        disabled={!schedule.isActive}
                                        className="px-2 py-1 border rounded text-sm disabled:bg-gray-100"
                                        placeholder={t('end_time')}
                                    />
                                    <input
                                        type="number"
                                        value={schedule.slotDuration}
                                        onChange={(e) => handleScheduleLocalChange(day, 'slotDuration', e.target.value)}
                                        onBlur={() => handleScheduleSave(day)}
                                        disabled={!schedule.isActive}
                                        min="15"
                                        step="15"
                                        className="px-2 py-1 border rounded text-sm disabled:bg-gray-100"
                                        placeholder={t('slot_duration')}
                                    />
                                    <label className="flex items-center gap-2 text-sm col-span-2">
                                        <input
                                            type="checkbox"
                                            checked={schedule.isActive}
                                            onChange={(e) => {
                                                handleScheduleLocalChange(day, 'isActive', e.target.checked);
                                                handleScheduleSave(day);
                                            }}
                                            className="rounded"
                                        />
                                        {schedule.isActive ? t('active') : t('inactive')}
                                    </label>
                                </div>

                                {/* Break time inputs */}
                                <div className="grid grid-cols-6 gap-3 items-center pl-4">
                                    <div className="text-xs text-gray-500">
                                        {t('break_time')}
                                    </div>
                                    <input
                                        type="time"
                                        value={schedule.breakStartTime || ''}
                                        onChange={(e) => handleScheduleLocalChange(day, 'breakStartTime', e.target.value)}
                                        onBlur={() => handleScheduleSave(day)}
                                        disabled={!schedule.isActive}
                                        className="px-2 py-1 border rounded text-sm disabled:bg-gray-100"
                                        placeholder={t('break_start')}
                                    />
                                    <input
                                        type="time"
                                        value={schedule.breakEndTime || ''}
                                        onChange={(e) => handleScheduleLocalChange(day, 'breakEndTime', e.target.value)}
                                        onBlur={() => handleScheduleSave(day)}
                                        disabled={!schedule.isActive}
                                        className="px-2 py-1 border rounded text-sm disabled:bg-gray-100"
                                        placeholder={t('break_end')}
                                    />
                                    <div className="text-xs text-gray-400 col-span-3">
                                        {t('break_optional')}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Exceptions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Calendar size={20} />
                        {t('exceptions')}
                    </h2>
                    <button
                        onClick={() => setShowExceptionForm(!showExceptionForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 text-sm"
                    >
                        <Plus size={16} />
                        {t('add_exception')}
                    </button>
                </div>

                {showExceptionForm && (
                    <form onSubmit={handleAddException} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('exception_date')}</label>
                                <input
                                    type="date"
                                    required
                                    value={exceptionForm.date}
                                    onChange={(e) => setExceptionForm({ ...exceptionForm, date: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('exception_reason')}</label>
                                <input
                                    type="text"
                                    value={exceptionForm.reason}
                                    onChange={(e) => setExceptionForm({ ...exceptionForm, reason: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="Holiday, Conference, etc."
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={!exceptionForm.isAvailable}
                                    onChange={() => setExceptionForm({ ...exceptionForm, isAvailable: false })}
                                />
                                {t('exception_unavailable')}
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={exceptionForm.isAvailable}
                                    onChange={() => setExceptionForm({ ...exceptionForm, isAvailable: true })}
                                />
                                {t('exception_special_hours')}
                            </label>
                        </div>

                        {exceptionForm.isAvailable && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('start_time')}</label>
                                    <input
                                        type="time"
                                        value={exceptionForm.startTime}
                                        onChange={(e) => setExceptionForm({ ...exceptionForm, startTime: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('end_time')}</label>
                                    <input
                                        type="time"
                                        value={exceptionForm.endTime}
                                        onChange={(e) => setExceptionForm({ ...exceptionForm, endTime: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {t('add_exception')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowExceptionForm(false)}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                <div className="space-y-2">
                    {exceptions.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">{t('no_exceptions')}</p>
                    ) : (
                        exceptions.map(exception => (
                            <div key={exception.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <div className="font-medium text-sm">
                                        {new Date(exception.date).toLocaleDateString()}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        {exception.reason || (exception.isAvailable ? t('exception_special_hours') : t('exception_unavailable'))}
                                        {exception.isAvailable && exception.startTime && (
                                            <span className="ml-2">
                                                {exception.startTime} - {exception.endTime}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteException(exception.id)}
                                    className="text-red-500 hover:bg-red-50 p-2 rounded"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold mb-4">{t('preview_title')}</h2>
                <div className="flex gap-3 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">{t('select_date')}</label>
                        <input
                            type="date"
                            value={previewDate}
                            onChange={(e) => setPreviewDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <button
                        onClick={handlePreview}
                        disabled={!previewDate || loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        Preview
                    </button>
                </div>

                {previewSlots.length > 0 && (
                    <div className="mt-4 grid grid-cols-6 gap-2">
                        {previewSlots.map(slot => (
                            <div key={slot} className="px-3 py-2 bg-green-50 text-green-700 rounded text-sm text-center font-medium">
                                {slot}
                            </div>
                        ))}
                    </div>
                )}

                {previewDate && previewSlots.length === 0 && !loading && (
                    <p className="text-gray-500 text-sm mt-4">{t('no_slots')}</p>
                )}
            </div>
        </div>
    );
}
