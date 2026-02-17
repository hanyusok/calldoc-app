
"use client";

import { useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { deleteVaccination } from "@/app/actions/vaccination";

interface Vaccination {
    id: string;
    name: string;
    nameEn: string | null;
    price: number;
    description: string | null;
    descriptionEn: string | null;
    category: string | null;
    categoryEn: string | null;
    manufacturer: string | null;
    manufacturerEn: string | null;
    targetDisease: string | null;
    targetDiseaseEn: string | null;
    visitTime: string | null;
    visitTimeEn: string | null;
    location: string | null;
    locationEn: string | null;
    minAge: number | null;
    maxAge: number | null;
}

export default function VaccinationsClient({
    initialVaccinations,
    initialTotal,
    initialPage
}: {
    initialVaccinations: Vaccination[];
    initialTotal: number;
    initialPage: number;
}) {
    const t = useTranslations('Admin.vaccinations');
    const { locale } = useParams();
    const isEn = locale === 'en';
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
    const [isDeleting, setIsDeleting] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [total, setTotal] = useState(initialTotal);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(total / itemsPerPage);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchTerm) params.set('q', searchTerm);
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

    const handleDelete = async (id: string) => {
        if (!confirm(t('confirm_delete'))) return;

        setIsDeleting(id);
        try {
            await deleteVaccination(id);
            router.refresh();
        } catch (error) {
            alert(t('delete_error'));
        } finally {
            setIsDeleting("");
        }
    };

    const formatAgeRange = (minAge: number | null, maxAge: number | null) => {
        if (minAge === null && maxAge === null) return '-';
        const min = minAge ?? 0;
        const max = maxAge ? `${maxAge}` : '+';
        return `${min} - ${max}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleSearch} className="relative w-96">
                    <input
                        type="text"
                        placeholder={t('search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                </form>
                <Link
                    href="/admin/dashboard/vaccinations/create"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    {t('add_new')}
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="p-4">{t('table.name')}</th>
                                <th className="p-4">{t('table.category')}</th>
                                <th className="p-4">{t('table.manufacturer')}</th>
                                <th className="p-4">{t('table.target')}</th>
                                <th className="p-4">{t('table.age_range')}</th>
                                <th className="p-4 text-right">{t('table.price')}</th>
                                <th className="p-4 text-center">{t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {initialVaccinations.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-400">
                                        {t('no_vaccinations')}
                                    </td>
                                </tr>
                            ) : (
                                initialVaccinations.map((vaccination) => (
                                    <tr key={vaccination.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">
                                            {isEn ? (vaccination.nameEn || vaccination.name) : vaccination.name}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {(isEn ? (vaccination.categoryEn || vaccination.category) : vaccination.category) ? (
                                                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                                    {isEn ? (vaccination.categoryEn || vaccination.category) : vaccination.category}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {(isEn ? (vaccination.manufacturerEn || vaccination.manufacturer) : vaccination.manufacturer) ? (
                                                <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                                                    {isEn ? (vaccination.manufacturerEn || vaccination.manufacturer) : vaccination.manufacturer}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {(isEn ? (vaccination.targetDiseaseEn || vaccination.targetDisease) : vaccination.targetDisease) || '-'}
                                        </td>
                                        <td className="p-4 text-gray-600">{formatAgeRange(vaccination.minAge, vaccination.maxAge)}</td>
                                        <td className="p-4 text-right font-semibold text-gray-900">
                                            {vaccination.price === 0 ? 'Free' : `₩${vaccination.price.toLocaleString()}`}
                                        </td>
                                        <td className="p-4 text-center flex justify-center gap-2">
                                            <Link
                                                href={`/admin/dashboard/vaccinations/${vaccination.id}/edit`}
                                                className="text-blue-500 hover:bg-blue-50 p-2 rounded transition-colors"
                                                title={t('edit_vaccination')}
                                            >
                                                <Edit size={16} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(vaccination.id)}
                                                disabled={isDeleting === vaccination.id}
                                                className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors disabled:opacity-50"
                                                title={t('confirm_delete')}
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
        </div>
    );
}
