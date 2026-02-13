
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, Plus, Edit, Trash2, Syringe } from "lucide-react";
import Link from "next/link";
import { deleteVaccination } from "@/app/actions/vaccination";

interface Vaccination {
    id: string;
    name: string;
    price: number;
    description: string | null;
    category: string | null;
    manufacturer: string | null;
    targetDisease: string | null;
    visitTime: string | null;
    location: string | null;
    minAge: number | null;
    maxAge: number | null;
}

export default function VaccinationsClient({
    initialVaccinations,
    totalPages
}: {
    initialVaccinations: Vaccination[];
    totalPages: number;
}) {
    const t = useTranslations('Admin.vaccinations');
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
    const [isDeleting, setIsDeleting] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/admin/dashboard/vaccinations?q=${searchTerm}`);
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialVaccinations.map((vaccination) => (
                    <div key={vaccination.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Syringe className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/admin/dashboard/vaccinations/${vaccination.id}/edit`}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    >
                                        <Edit size={18} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(vaccination.id)}
                                        disabled={isDeleting === vaccination.id}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-1">{vaccination.name}</h3>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                    {vaccination.category}
                                </span>
                                {vaccination.manufacturer && (
                                    <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                                        {vaccination.manufacturer}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Price</span>
                                    <span className="font-semibold text-gray-900">
                                        {vaccination.price === 0 ? "Free" : `₩${vaccination.price.toLocaleString()}`}
                                    </span>
                                </div>
                                {vaccination.targetDisease && (
                                    <div className="flex justify-between">
                                        <span>Target</span>
                                        <span className="text-gray-900">{vaccination.targetDisease}</span>
                                    </div>
                                )}
                                {(vaccination.minAge !== null || vaccination.maxAge !== null) && (
                                    <div className="flex justify-between">
                                        <span>Age Limit</span>
                                        <span className="text-gray-900">
                                            {vaccination.minAge ?? 0} - {vaccination.maxAge ?? "+"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {initialVaccinations.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <Syringe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_vaccinations')}</h3>
                    <p className="text-gray-500">{t('no_vaccinations_desc')}</p>
                </div>
            )}
        </div>
    );
}
