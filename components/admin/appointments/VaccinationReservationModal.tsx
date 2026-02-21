'use client';

import { useState, useEffect } from 'react';
import { X, Save, Trash2, Plus } from 'lucide-react';
import { createVaccinationReservation, updateVaccinationReservation, deleteVaccinationReservation, getUsersAndVaccinations } from '@/app/actions/vaccination';
import { useTranslations } from 'next-intl';

interface VaccinationReservation {
    id: string;
    userId: string;
    vaccinationId: string;
    date: Date | string;
    status: string;
}

interface Props {
    reservation?: VaccinationReservation;
    onClose: () => void;
    isOpen: boolean;
}

export default function VaccinationReservationModal({ reservation: initialData, onClose, isOpen }: Props) {
    const t = useTranslations('Admin.appointment_modal'); // Reusing some keys
    const tVac = useTranslations('VaccinationCard');
    const tStatus = useTranslations('Admin.status');

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<VaccinationReservation>>({
        status: 'PENDING',
        date: new Date().toISOString().slice(0, 16),
    });
    const [users, setUsers] = useState<any[]>([]);
    const [vaccinations, setVaccinations] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            getUsersAndVaccinations().then(({ users, vaccinations }) => {
                setUsers(users);
                setVaccinations(vaccinations);
            });
            if (initialData) {
                setFormData({
                    ...initialData,
                    date: initialData.date ? new Date(initialData.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
                });
            } else {
                setFormData({
                    status: 'PENDING',
                    date: new Date().toISOString().slice(0, 16),
                });
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const date = new Date(formData.date as string);

            if (initialData) {
                await updateVaccinationReservation(initialData.id, {
                    date,
                    status: formData.status as string,
                });
            } else {
                if (!formData.userId || !formData.vaccinationId) {
                    alert('Please select both user and vaccination');
                    setIsLoading(false);
                    return;
                }
                await createVaccinationReservation({
                    userId: formData.userId,
                    vaccinationId: formData.vaccinationId,
                    date,
                    status: formData.status as string,
                });
            }
            onClose();
        } catch (error) {
            console.error('Failed to save reservation', error);
            alert('Failed to save reservation');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData || !confirm('Are you sure you want to delete this reservation?')) return;
        setIsLoading(true);
        try {
            await deleteVaccinationReservation(initialData.id);
            onClose();
        } catch (error) {
            console.error('Failed to delete', error);
            alert('Failed to delete reservation');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">
                        {initialData ? t('edit_vac_title') : t('new_vac_title')}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {!initialData && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient')}</label>
                                <select
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.userId || ''}
                                    onChange={e => setFormData({ ...formData, userId: e.target.value })}
                                    required
                                >
                                    <option value="">{t('select_patient')}</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{tVac('vaccine_label') || 'Vaccination'}</label>
                                <select
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.vaccinationId || ''}
                                    onChange={e => setFormData({ ...formData, vaccinationId: e.target.value })}
                                    required
                                >
                                    <option value="">{tVac('select_vaccine') || 'Select Vaccination'}</option>
                                    {vaccinations.map(v => (
                                        <option key={v.id} value={v.id}>{v.name} ({v.category})</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('date_time')}</label>
                        <input
                            type="datetime-local"
                            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={String(formData.date)}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('status')}</label>
                        <select
                            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="PENDING">{tStatus('PENDING')}</option>
                            <option value="CONFIRMED">{tStatus('CONFIRMED')}</option>
                            <option value="COMPLETED">{tStatus('COMPLETED')}</option>
                            <option value="CANCELLED">{tStatus('CANCELLED')}</option>
                        </select>
                    </div>

                    <div className="pt-4 flex items-center justify-between gap-3">
                        {initialData ? (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                                disabled={isLoading}
                            >
                                <Trash2 size={16} /> {t('delete')}
                            </button>
                        ) : <div />}

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                {isLoading ? t('saving') : (
                                    <>
                                        <Save size={16} /> {t('save')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
