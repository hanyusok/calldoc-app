import { getPharmacies } from "@/app/actions/pharmacy";
import PharmacyClient from "./PharmacyClient";

export default async function PharmaciesPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string, q?: string }>
}) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const query = params?.q || "";

    const { pharmacies, total } = await getPharmacies(page, 10, query);

    return (
        <PharmacyClient
            initialPharmacies={pharmacies}
            initialTotal={total}
            initialPage={page}
            search={query}
        />
    );
}
