import { getPharmacies } from "@/app/actions/pharmacy";
import PharmacyClient from "./PharmacyClient";

export default async function PharmaciesPage() {
    const { pharmacies } = await getPharmacies(1, 100);
    return <PharmacyClient initialPharmacies={pharmacies} />;
}
