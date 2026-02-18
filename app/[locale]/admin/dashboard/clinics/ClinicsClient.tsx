"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Trash2, Plus, Edit, Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClinic, updateClinic, deleteClinic, toggleClinicVisibility } from "@/app/actions/clinic";

export default function ClinicsClient({
    initialClinics,
    initialTotal,
    initialPage
}: {
    initialClinics: any[],
    initialTotal: number,
    initialPage: number
}) {
    const t = useTranslations('Clinics');
    const [clinics, setClinics] = useState(initialClinics);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [total, setTotal] = useState(initialTotal);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(total / itemsPerPage);

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;

        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`?${params.toString()}`);
        setCurrentPage(newPage);
    };

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

    // Update clinics when props change (e.g. after search/pagination from server)
    useEffect(() => {
        setClinics(initialClinics);
    }, [initialClinics]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentClinic, setCurrentClinic] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        city: "",
        phoneNumber: "",
        description: "",
        website: "",
        rating: "0",
        latitude: "",
        longitude: "",
        isVisible: true,
        images: ""
    });

    const openModal = (clinic?: any) => {
        if (clinic) {
            setIsEditing(true);
            setCurrentClinic(clinic);
            setFormData({
                name: clinic.name || "",
                address: clinic.address || "",
                city: clinic.city || "",
                phoneNumber: clinic.phoneNumber || "",
                description: clinic.description || "",
                website: clinic.website || "",
                rating: clinic.rating?.toString() || "0",
                latitude: clinic.latitude?.toString() || "",
                longitude: clinic.longitude?.toString() || "",
                isVisible: clinic.isVisible !== false,
                images: clinic.images?.[0] || ""
            });
        } else {
            setIsEditing(false);
            setCurrentClinic(null);
            setFormData({
                name: "",
                address: "",
                city: "",
                phoneNumber: "",
                description: "",
                website: "",
                rating: "0",
                latitude: "",
                longitude: "",
                isVisible: true,
                images: ""
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setCurrentClinic(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditing && currentClinic) {
                const res = await updateClinic(currentClinic.id, formData);
                if (res.success) {
                    alert(t('alerts.update_success'));
                    router.refresh();
                    closeModal();
                } else {
                    alert(t('alerts.update_error'));
                }
            } else {
                const res = await createClinic(formData);
                if (res.success) {
                    alert(t('alerts.create_success'));
                    router.refresh();
                    closeModal();
                } else {
                    alert(t('alerts.create_error'));
                }
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (clinicId: string) => {
        if (!confirm(t('alerts.delete_confirm'))) return;

        setLoading(true);
        try {
            const res = await deleteClinic(clinicId);
            if (res.success) {
                alert(t('alerts.delete_success'));
                setClinics(clinics.filter(c => c.id !== clinicId));
                router.refresh();
            } else {
                alert(t('alerts.delete_error'));
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleVisibility = async (clinic: any) => {
        const newStatus = !clinic.isVisible;
        // Optimistic update
        setClinics(clinics.map(c => c.id === clinic.id ? { ...c, isVisible: newStatus } : c));

        try {
            const res = await toggleClinicVisibility(clinic.id, newStatus);
            if (!res.success) {
                // Revert on failure
                setClinics(clinics.map(c => c.id === clinic.id ? { ...c, isVisible: clinic.isVisible } : c));
                alert(t('alerts.visibility_error'));
            } else {
                router.refresh(); // Refresh to sync server state
            }
        } catch (e) {
            console.error(e);
            // Revert
            setClinics(clinics.map(c => c.id === clinic.id ? { ...c, isVisible: clinic.isVisible } : c));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder={t('search_placeholder')}
                        className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    {t('add_new')}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="p-4">{t('table.name')}</th>
                                <th className="p-4">{t('table.address')}</th>
                                <th className="p-4">{t('table.phone')}</th>
                                <th className="p-4 text-center">{t('table.visibility')}</th>
                                <th className="p-4 text-right">{t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {clinics.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400">
                                        No clinics found
                                    </td>
                                </tr>
                            ) : (
                                clinics.map((clinic) => (
                                    <tr key={clinic.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">{clinic.name}</td>
                                        <td className="p-4 text-gray-600">{clinic.address}</td>
                                        <td className="p-4 text-gray-600">{clinic.phoneNumber || '-'}</td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleToggleVisibility(clinic)}
                                                className={`p-1 rounded-full ${clinic.isVisible ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}
                                                title={clinic.isVisible ? "Visible to public" : "Hidden from public"}
                                            >
                                                {clinic.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button
                                                onClick={() => openModal(clinic)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(clinic.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
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
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between bg-white px-6 py-4 border-t border-gray-100">
                        <div className="text-sm text-gray-600">
                            {t('pagination.showing')} {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, total)} {t('pagination.of')} {total}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronLeft size={18} />
                                {t('pagination.previous')}
                            </button>
                            <div className="text-sm text-gray-600 px-3">
                                {t('pagination.page')} {currentPage} {t('pagination.of')} {totalPages}
                            </div>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {t('pagination.next')}
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">{isEditing ? t('form.edit_title') : t('form.new_title')}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.address')}</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.city')}</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.phone')}</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.phoneNumber}
                                            onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.description')}</label>
                                    <textarea
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        rows={3}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.image_url')}</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.images}
                                        onChange={e => setFormData({ ...formData, images: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
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
                                    <div className="flex items-center pt-6">
                                        <input
                                            type="checkbox"
                                            id="isVisible"
                                            checked={formData.isVisible}
                                            onChange={e => setFormData({ ...formData, isVisible: e.target.checked })}
                                            className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                                        />
                                        <label htmlFor="isVisible" className="text-sm font-medium text-gray-700">
                                            {t('form.visible')}
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                                    >
                                        {t('form.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                                    >
                                        {loading ? t('form.saving') : t('form.save')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
