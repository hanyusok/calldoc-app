"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useFormatter } from "next-intl";
import { Search, Trash2, Plus, Edit, X, Calendar } from "lucide-react";
import { deleteDoctor, createDoctor, updateDoctor } from "@/app/actions/doctor";
import Link from "next/link";
import PageHeader from "@/components/admin/shared/PageHeader";

export default function DoctorsClient({ initialDoctors, initialTotal, initialPage }: { initialDoctors: any[], initialTotal: number, initialPage: number }) {
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
        hospital: "",
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
                hospital: doctor.hospital || "",
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
                hospital: "",
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
            if (isEditing) {
                const res = await updateDoctor(currentDoctor.id, formData);
                if (res.success) {
                    alert(t('update_success'));
                    closeModal();
                    window.location.reload();
                } else {
                    alert(res.error || t('save_error'));
                }
            } else {
                const res = await createDoctor(formData);
                if (res.success) {
                    alert(t('create_success'));
                    closeModal();
                    window.location.reload();
                } else {
                    alert(res.error || t('create_error'));
                }
            }
        } catch (error) {
            console.error(error);
            alert(t('error_generic'));
        } finally {
            setLoading(false);
        }
    };

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
            <PageHeader
                title={t('title')}
                actions={
                    <button
                        onClick={() => openModal()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                    >
                        <Plus size={18} />
                        {t('add_new')}
                    </button>
                }
            />

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder={t('search_placeholder')}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

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
                                        <td className="p-4 text-gray-600">{doctor.hospital}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                                ${doctor.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {doctor.isAvailable ? t('status_available') : t('status_unavailable')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <Link
                                                href={`/admin/dashboard/doctors/${doctor.id}/availability`}
                                                className="text-green-500 hover:bg-green-50 p-2 rounded transition-colors"
                                                title={t('manage_availability')}
                                            >
                                                <Calendar size={16} />
                                            </Link>
                                            <button
                                                onClick={() => openModal(doctor)}
                                                className="text-blue-500 hover:bg-blue-50 p-2 rounded transition-colors"
                                                title={t('edit')}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doctor.id)}
                                                disabled={loading}
                                                className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                                                title={t('delete')}
                                            >
                                                <Trash2 size={16} />
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
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-bold">{isEditing ? t('edit_doctor') : t('add_new')}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
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
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.hospital}
                                    onChange={e => setFormData({ ...formData, hospital: e.target.value })}
                                />
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
