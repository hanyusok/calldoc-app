import React from 'react';
import BottomNav from "@/components/BottomNav";
import DoctorCard from "@/components/consult/DoctorCard";
import PharmacyCard from "@/components/consult/PharmacyCard";
import VaccinationCard from "@/components/consult/VaccinationCard";
import FilterBar from "@/components/consult/FilterBar";
import { getDoctors, getPharmacies, getVaccinations } from "./actions";
import Link from "next/link";
import { ChevronLeft, Search } from 'lucide-react';

import { getTranslations } from "next-intl/server";

export default async function ConsultPage(props: {
    searchParams: Promise<{ query?: string; category?: string; filter?: string }>
}) {
    const params = await props.searchParams;
    const t = await getTranslations('ConsultPage');
    const tService = await getTranslations('ServiceGrid');

    const category = params.category;

    // Handle legacy/redirects
    if (category === 'supplements') {
        const { redirect } = await import('next/navigation');
        redirect('/consult?category=vaccination');
    }

    const isPharmacy = category === 'pharmacy';
    const isVaccination = category === 'vaccination';

    const doctors = (!isPharmacy && !isVaccination) ? await getDoctors({
        query: params.query,
        category: params.category,
        filter: params.filter
    }) : [];

    const pharmacies = isPharmacy ? await getPharmacies({
        query: params.query,
        filter: params.filter
    }) : [];

    const vaccinations = isVaccination ? await getVaccinations({
        query: params.query
    }) : [];

    // Map category ID to translated name if it exists, otherwise use ID
    // Note: This logic assumes category params match keys in ServiceGrid if possible, or we need a mapping.
    // However, params.category comes from URL which was set from ServiceGrid previously.
    // Let's try to map it back or just use the parameter for now if dynamic.
    // Actually, in ServiceGrid we used `service.name.toLowerCase()...` which is English.
    // If we change ServiceGrid to use IDs, we should update the URL generation there too.
    // For now, let's just translate the default title.

    let title = t('title_default');
    if (params.category) {
        // Ideally we map category slug back to translation key
        // For simple Verify, let's keep it simple or try to find a match
        // The category param is like "lab-test", "telemedicine"
        const catKey = params.category.replace(/-/g, '_'); // lab-test -> lab_test
        // We can try to get translation, if strictly types allows it.
        // For now, just display the param or default
        try {
            title = tService(catKey as any);
        } catch (e) {
            title = params.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Custom Header for Consult Page */}
            <div className="bg-white sticky top-0 z-50 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <Link href="/" className="text-gray-600 hover:text-gray-900">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">{title}</h1>
                </div>

                {/* Search Input - duplicated from Header for now, or could be a component */}
                <div className="relative mb-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    {/* Client component for search input behavior would be better, but simple form works for SSR */}
                    <form action="/consult" method="GET">
                        {params.category && <input type="hidden" name="category" value={params.category} />}
                        <input
                            name="query"
                            defaultValue={params.query}
                            type="text"
                            className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
                            placeholder={t('search_placeholder')}
                        />
                    </form>
                </div>

                <FilterBar category={category} />
            </div>

            <div className="px-4 py-4 space-y-4">
                {(isPharmacy ? pharmacies : (isVaccination ? vaccinations : doctors)).length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <p>{t('no_results')}</p>
                        <Link href={`/consult${category ? `?category=${category}` : ''}`} className="text-primary-500 text-sm mt-2 inline-block">
                            {t('clear_filters')}
                        </Link>
                    </div>
                ) : (
                    isPharmacy
                        ? (pharmacies).map(pharmacy => (
                            <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
                        ))
                        : isVaccination
                            ? (vaccinations).map(v => (
                                <VaccinationCard key={v.id} vaccination={v} />
                            ))
                            : (doctors).map(doc => (
                                <DoctorCard key={doc.id} doctor={doc} />
                            ))
                )}
            </div>

            <BottomNav />
        </div>
    );
}
