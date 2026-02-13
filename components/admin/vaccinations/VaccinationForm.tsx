
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { createVaccination, updateVaccination } from "@/app/actions/vaccination";

interface Vaccination {
    id?: string;
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

export default function VaccinationForm({
    initialData
}: {
    initialData?: Vaccination;
}) {
    const t = useTranslations('Admin.vaccinations');
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            if (initialData?.id) {
                await updateVaccination(initialData.id, formData);
            } else {
                await createVaccination(formData);
            }
            router.push('/admin/dashboard/vaccinations');
            router.refresh();
        } catch (error) {
            alert(t('save_error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <Link href="/admin/dashboard/vaccinations" className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                <ChevronLeft size={20} />
                {t('back_to_list')}
            </Link>

            <h1 className="text-2xl font-bold mb-8">{initialData ? t('edit_vaccination') : t('create_vaccination')}</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')}</label>
                        <input
                            name="name"
                            defaultValue={initialData?.name}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('price')}</label>
                            <input
                                name="price"
                                type="number"
                                defaultValue={initialData?.price}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('category')}</label>
                            <input
                                name="category"
                                defaultValue={initialData?.category || ''}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('description')}</label>
                        <textarea
                            name="description"
                            defaultValue={initialData?.description || ''}
                            rows={3}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('manufacturer')}</label>
                            <input
                                name="manufacturer"
                                defaultValue={initialData?.manufacturer || ''}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('target_disease')}</label>
                            <input
                                name="targetDisease"
                                defaultValue={initialData?.targetDisease || ''}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('location')}</label>
                            <input
                                name="location"
                                defaultValue={initialData?.location || ''}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('visit_time')}</label>
                            <input
                                name="visitTime"
                                defaultValue={initialData?.visitTime || ''}
                                placeholder="e.g. 15 min"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('min_age')}</label>
                            <input
                                name="minAge"
                                type="number"
                                defaultValue={initialData?.minAge ?? ''}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('max_age')}</label>
                            <input
                                name="maxAge"
                                type="number"
                                defaultValue={initialData?.maxAge ?? ''}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Link
                        href="/admin/dashboard/vaccinations"
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        {t('cancel')}
                    </Link>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? t('saving') : t('save')}
                    </button>
                </div>
            </form>
        </div>
    );
}
