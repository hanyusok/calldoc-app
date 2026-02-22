"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Edit2, Search, ChevronLeft, ChevronRight, X, Lock, LockOpen, BadgeCheck } from "lucide-react";
import { createPharmacy, deletePharmacy, updatePharmacy, togglePharmacyFaxLock, togglePharmacyFaxVerified } from "@/app/actions/pharmacy";

interface PharmacyClientProps {
    initialPharmacies: any[];
    initialTotal: number;
    initialPage: number;
    search?: string;
    initialFilter?: string;
}

export default function PharmacyClient({ initialPharmacies, initialTotal, initialPage, search, initialFilter }: PharmacyClientProps) {
    const t = useTranslations('Admin.pharmacy');
    const router = useRouter();
    const searchParams = useSearchParams();

    const [pharmacies, setPharmacies] = useState(initialPharmacies);
    const [searchTerm, setSearchTerm] = useState(search || "");
    const [filter, setFilter] = useState(initialFilter || "");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", fax: "", phone: "", address: "" });
    const [loading, setLoading] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [total, setTotal] = useState(initialTotal);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(total / itemsPerPage);

    const triggerSearch = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (searchTerm) {
            params.set('q', searchTerm);
        } else {
            params.delete('q');
        }
        params.set('page', '1');
        router.push(`?${params.toString()}`);
    };

    // Auto-search removed to reduce API calls
    // Search is now triggered only by "Enter" key or "Search" button

    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter);
        const params = new URLSearchParams(searchParams.toString());
        if (newFilter && newFilter !== 'all') {
            params.set('filter', newFilter);
        } else {
            params.delete('filter');
        }
        params.set('page', '1');
        router.push(`?${params.toString()}`);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;

        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`?${params.toString()}`);
        setCurrentPage(newPage);
    };

    const openModal = (pharmacy?: any) => {
        if (pharmacy) {
            setIsEditing(true);
            setCurrentId(pharmacy.id);
            setFormData({
                name: pharmacy.name,
                fax: pharmacy.fax || "",
                phone: pharmacy.phone || "",
                address: pharmacy.address || ""
            });
        } else {
            setIsEditing(false);
            setCurrentId(null);
            setFormData({ name: "", fax: "", phone: "", address: "" });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (isEditing && currentId) {
                const res = await updatePharmacy(currentId, formData);
                if (res.success) {
                    // Optimistic update or refresh
                    router.refresh();
                    // Locally update for immediate feedback (optional, but good)
                    setPharmacies(pharmacies.map(p => p.id === currentId ? { ...p, ...formData } : p));
                    setIsModalOpen(false);
                } else {
                    alert("Failed to update pharmacy");
                }
            } else {
                const res = await createPharmacy(formData);
                if (res.pharmacy) {
                    setPharmacies([res.pharmacy, ...pharmacies]);
                    setIsModalOpen(false);
                    router.refresh();
                } else {
                    alert("Failed to create pharmacy");
                }
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('delete') + "?")) return;
        try {
            await deletePharmacy(id);
            setPharmacies(pharmacies.filter(p => p.id !== id));
            router.refresh();
        } catch (e) {
            console.error(e);
        }
    };

    const handleToggleLock = async (id: string) => {
        const result = await togglePharmacyFaxLock(id);
        if (result.success) {
            setPharmacies(pharmacies.map(p => p.id === id ? { ...p, faxLocked: result.faxLocked } : p));
        } else {
            alert(result.error || "Failed");
        }
    };

    const handleToggleVerified = async (id: string) => {
        const result = await togglePharmacyFaxVerified(id);
        if (result.success) {
            setPharmacies(pharmacies.map(p => p.id === id ? { ...p, faxVerified: result.faxVerified } : p));
        } else {
            alert(result.error || "Failed");
        }
    };



    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{t('title')}</h1>
            </div>

            <div className="flex flex-col gap-4 mb-6">
                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleFilterChange('')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${!filter ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => handleFilterChange('안성')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === '안성' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        안성 (Anseong)
                    </button>
                    <button
                        onClick={() => handleFilterChange('평택')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === '평택' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        평택 (Pyeongtaek)
                    </button>
                    <button
                        onClick={() => handleFilterChange('오산')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === '오산' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        오산 (Osan)
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex w-full md:max-w-md gap-2">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder={t('search_placeholder') || "Search..."}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && triggerSearch()}
                            />
                        </div>
                        <button
                            onClick={triggerSearch}
                            className="bg-gray-100 text-gray-700 px-8 py-2 rounded-lg hover:bg-gray-200 transition font-medium whitespace-nowrap shrink-0"
                        >
                            {t('search') || "Search"}
                        </button>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                    >
                        <Plus size={20} /> {t('add_new')}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-medium text-gray-500">{t('name')}</th>
                                <th className="p-4 font-medium text-gray-500">{t('fax')}</th>
                                <th className="p-4 font-medium text-gray-500">{t('phone')}</th>
                                <th className="p-4 font-medium text-gray-500">{t('address')}</th>
                                <th className="p-4 font-medium text-gray-500 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {pharmacies.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400">
                                        No pharmacies found.
                                    </td>
                                </tr>
                            ) : (
                                pharmacies.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium">{p.name} {p.isDefault && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded ml-2">{t('is_default')}</span>}</td>
                                        <td className="p-4 text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <span className={p.faxVerified ? "text-green-600 font-semibold" : ""}>
                                                    {p.fax || "-"}
                                                </span>
                                                {/* Verify toggle */}
                                                <button
                                                    onClick={() => handleToggleVerified(p.id)}
                                                    title={p.faxVerified ? "인증 해제" : "팩스 인증"}
                                                    className={`p-1 rounded transition-colors ${p.faxVerified ? 'text-green-500 hover:text-green-700' : 'text-gray-300 hover:text-green-500'}`}
                                                >
                                                    <BadgeCheck size={15} />
                                                </button>
                                                {/* Lock toggle */}
                                                <button
                                                    onClick={() => handleToggleLock(p.id)}
                                                    title={p.faxLocked ? "잠금 해제" : "편집 잠금"}
                                                    className={`p-1 rounded transition-colors ${p.faxLocked ? 'text-amber-500 hover:text-amber-700' : 'text-gray-300 hover:text-amber-500'}`}
                                                >
                                                    {p.faxLocked ? <Lock size={14} /> : <LockOpen size={14} />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600">{p.phone || "-"}</td>
                                        <td className="p-4 text-gray-600">{p.address || "-"}</td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button
                                                onClick={() => openModal(p)}
                                                className="text-blue-500 hover:text-blue-700 p-2"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                className="text-red-500 hover:text-red-700 p-2"
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-lg font-bold">{isEditing ? t('edit') : t('add_new')}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <input
                                placeholder={t('name')}
                                className="w-full p-2 border rounded"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input
                                placeholder={t('fax')}
                                className="w-full p-2 border rounded"
                                value={formData.fax}
                                onChange={e => setFormData({ ...formData, fax: e.target.value })}
                            />
                            <input
                                placeholder={t('phone')}
                                className="w-full p-2 border rounded"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <input
                                placeholder={t('address')}
                                className="w-full p-2 border rounded"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
