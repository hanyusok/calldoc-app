import { getClinics } from "@/app/actions/clinic";
import ClinicsClient from "./ClinicsClient";
import { getTranslations } from "next-intl/server";

export default async function ClinicsPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string; q?: string }>;
}) {
    // Await searchParams first
    const resolvedParams = await searchParams;
    const t = await getTranslations('Clinics');

    // Parse parameters
    const page = parseInt(resolvedParams.page || "1");
    const search = resolvedParams.q || "";

    const { clinics, total, totalPages, currentPage } = await getClinics(page, 10, search);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>

            <ClinicsClient
                initialClinics={clinics}
                initialTotal={total}
                initialPage={currentPage}
            />
        </div>
    );
}
