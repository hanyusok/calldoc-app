"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useFormatter } from "next-intl";
import { Search, Trash2, Plus, Edit, X, Calendar } from "lucide-react";
import { deleteDoctor, createDoctor, updateDoctor } from "@/app/actions/doctor";
import Link from "next/link";
import PageHeader from "@/components/admin/shared/PageHeader";

export default function DoctorsClient({
    initialDoctors,
    initialTotal,
    initialPage,
    clinics = []
}: {
    initialDoctors: any[],
    initialTotal: number,
    initialPage: number,
    clinics: { id: string, name: string }[]
}) {
    const t = useTranslations('Admin.doctors');
    const format = useFormatter();
    const [doctors, setDoctors] = useState(initialDoctors);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            const currentQ = params.get('q') || '';

            if (currentQ !== search) {
                const newParams = new URLSearchParams();
                if (search) newParams.set('q', search);
                newParams.set('page', '1');

                router.push(`?${newParams.toString()}`);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentDoctor, setCurrentDoctor] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        specialty: "",
        clinicId: "",
        bio: "",
        imageUrl: "",
        rating: "5.0",
        patients: "0",
        consultationFee: "5000",
        isAvailable: true
    });

    const openModal = (doctor?: any) => {
        if (doctor) {
            setIsEditing(true);
            setCurrentDoctor(doctor);
            setFormData({
                name: doctor.name || "",
                specialty: doctor.specialty || "",
                clinicId: doctor.clinicId || "",
                bio: doctor.bio || "",
                imageUrl: doctor.imageUrl || "",
                rating: doctor.rating?.toString() || "5.0",
                patients: doctor.patients?.toString() || "0",
                consultationFee: doctor.consultationFee?.toString() || "5000",
                isAvailable: doctor.isAvailable
            });
        } else {
            setIsEditing(false);
            setCurrentDoctor(null);
            setFormData({
                name: "",
                specialty: "",
                clinicId: "",
                bio: "",
                imageUrl: "",
                rating: "5.0",
                patients: "0",
                consultationFee: "5000",
                isAvailable: true
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setCurrentDoctor(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditing && currentDoctor) {
                const res = await updateDoctor(currentDoctor.id, formData);
                if (res.success) {
                    alert(t('save_success') || "Doctor saved successfully");
                    router.refresh();
                    closeModal();
                } else {
                    alert(t('save_error') || "Error saving doctor");
                }
            } else {
                const res = await createDoctor(formData);
                if (res.success) {
                    alert(t('create_success') || "Doctor created successfully");
                    router.refresh();
                    closeModal();
                } else {
                    alert(t('create_error') || "Error creating doctor");
                }
            }
        } catch (e) {
            console.error(e);
            alert(t('error') || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    // Re-implementing with assumed state existence, but I better check if I need to restore state first.
    // The previous view showed:
    // 24:     const [doctors, setDoctors] = useState(initialDoctors);
    // 25:     // ... existing search logic ...

    // I need to start by restoring the state variables first.

    const handleDelete = async (doctorId: string) => {
        if (!confirm(t('confirm_delete'))) return;

        setLoading(true);
        try {
            const res = await deleteDoctor(doctorId);
            if (res.success) {
                setDoctors(doctors.filter(d => d.id !== doctorId));
                alert(t('delete_success'));
            } else {
                alert(t('delete_error'));
            }
        } catch (e) {
            console.error(e);
            alert(t('delete_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* ... PageHeader and Search ... */}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="p-4">{t('table.name')}</th>
                                <th className="p-4">{t('table.specialty')}</th>
                                <th className="p-4">{t('table.hospital')}</th>
                                <th className="p-4">{t('table.status')}</th>
                                <th className="p-4 text-right">{t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {doctors.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400">
                                        {t('no_doctors')}
                                    </td>
                                </tr>
                            ) : (
                                doctors.map((doctor) => (
                                    <tr key={doctor.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">{doctor.name}</td>
                                        <td className="p-4 text-gray-600">{doctor.specialty}</td>
                                        <td className="p-4 text-gray-600">{doctor.clinic?.name || '-'}</td>
                                        <td className="p-4">
                                            {/* ... status badge ... */}
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button
                                                onClick={() => openModal(doctor)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title={t('edit')}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doctor.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title={t('delete')}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        {/* ... modal header ... */}
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.name')}</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.specialty')}</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.specialty}
                                    onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.hospital')}</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    value={formData.clinicId}
                                    onChange={e => setFormData({ ...formData, clinicId: e.target.value })}
                                >
                                    <option value="">Select Clinic</option>
                                    {clinics.map(clinic => (
                                        <option key={clinic.id} value={clinic.id}>
                                            {clinic.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.bio')}</label>
                                <textarea
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows={3}
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.image_url')}</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.rating')}</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="5"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.rating}
                                        onChange={e => setFormData({ ...formData, rating: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.patients')}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.patients}
                                        onChange={e => setFormData({ ...formData, patients: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.consultation_fee')}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.consultationFee}
                                        onChange={e => setFormData({ ...formData, consultationFee: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isAvailable"
                                    checked={formData.isAvailable}
                                    onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })}
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                                    {t('form.is_available')}
                                </label>
                            </div>

                            <div className="pt-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                                >
                                    {loading ? t('saving') : t('save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
