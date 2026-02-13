
import { Suspense } from 'react';
import VaccinationsClient from './VaccinationsClient';
import { getVaccinations } from '@/app/actions/vaccination';
import { getTranslations } from 'next-intl/server';

export default async function AdminVaccinationsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string }>;
}) {
    const params = await searchParams;
    const query = params.q || "";
    const page = Number(params.page) || 1;
    const t = await getTranslations('Admin.vaccinations');

    const { vaccinations, totalPages } = await getVaccinations({ query, page });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
            <Suspense fallback={<div>Loading...</div>}>
                <VaccinationsClient initialVaccinations={vaccinations} totalPages={totalPages} />
            </Suspense>
        </div>
    );
}
