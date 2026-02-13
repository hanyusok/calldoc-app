'use client';

import { useState, useEffect } from 'react';
import { X, Save, Trash2, Plus } from 'lucide-react';
import { createAppointment, updateAppointment, deleteAppointment, getUsersAndDoctors } from '@/app/actions/appointment';

interface Appointment {
    id: string;
    userId: string;
    doctorId: string;
    date: Date | string;
    status: string;
    price: number | null;
}

interface Props {
    appointment?: Appointment;
    onClose: () => void;
    isOpen: boolean;
}

export default function AppointmentModal({ appointment: initialData, onClose, isOpen }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Appointment>>({
        status: 'PENDING',
        date: new Date().toISOString().slice(0, 16),
        price: 0,
    });
    const [users, setUsers] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            getUsersAndDoctors().then(({ users, doctors }) => {
                setUsers(users);
                setDoctors(doctors);
            });
            if (initialData) {
                setFormData({
                    ...initialData,
                    // Ensure date is formatted for datetime-local input
                    date: new Date(initialData.date).toISOString().slice(0, 16),
                });
            } else {
                setFormData({
                    status: 'PENDING',
                    date: new Date().toISOString().slice(0, 16),
                    price: 0,
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
                await updateAppointment(initialData.id, {
                    date,
                    status: formData.status,
                    price: Number(formData.price),
                });
            } else {
                if (!formData.userId || !formData.doctorId) {
                    alert('Please select both user and doctor');
                    setIsLoading(false);
                    return;
                }
                await createAppointment({
                    userId: formData.userId,
                    doctorId: formData.doctorId,
                    date,
                    status: formData.status,
                    price: Number(formData.price),
                });
            }
            onClose();
        } catch (error) {
            console.error('Failed to save appointment', error);
            alert('Failed to save appointment');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData || !confirm('Are you sure you want to delete this appointment?')) return;
        setIsLoading(true);
        try {
            await deleteAppointment(initialData.id);
            onClose();
        } catch (error) {
            console.error('Failed to delete', error);
            alert('Failed to delete appointment');
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
                        {initialData ? 'Edit Appointment' : 'New Appointment'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {!initialData && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                                <select
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.userId || ''}
                                    onChange={e => setFormData({ ...formData, userId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Patient</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                                <select
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.doctorId || ''}
                                    onChange={e => setFormData({ ...formData, doctorId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Doctor</option>
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>{d.name} - {d.specialty}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                        <input
                            type="datetime-local"
                            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={String(formData.date)}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="PENDING">Pending</option>
                                <option value="AWAITING_PAYMENT">Awaiting Payment</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.price || 0}
                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between gap-3">
                        {initialData ? (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                                disabled={isLoading}
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        ) : <div />}

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                {isLoading ? 'Saving...' : (
                                    <>
                                        <Save size={16} /> Save Changes
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
