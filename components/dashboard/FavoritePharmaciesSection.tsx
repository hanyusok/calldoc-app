import { MapPin, Phone, Printer, Heart, Search } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getUserFavoritePharmacies } from "@/app/[locale]/(mobile)/profile/actions";
import FavoritePharmacyButton from "@/components/consult/FavoritePharmacyButton";

export default async function FavoritePharmaciesSection() {
    const t = await getTranslations('FavoritePharmacy');
    const pharmacies = await getUserFavoritePharmacies();

    if (pharmacies.length === 0) {
        return (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="flex justify-center mb-3">
                    <div className="bg-rose-50 p-3 rounded-full">
                        <Heart size={24} className="text-rose-300" />
                    </div>
                </div>
                <p className="text-gray-500 text-sm mb-3">{t('empty')}</p>
                <Link
                    href="/consult?category=pharmacy"
                    className="inline-flex items-center gap-2 bg-primary-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors"
                >
                    <Search size={15} />
                    {t('go_search')}
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {pharmacies.map(pharmacy => (
                <div
                    key={pharmacy.id}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-3 items-start"
                >
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900 text-sm">{pharmacy.name}</h3>
                            {pharmacy.atFront && (
                                <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-100 shrink-0">
                                    앞
                                </span>
                            )}
                        </div>
                        {pharmacy.address && (
                            <p className="text-gray-500 text-xs mt-1 flex items-center gap-1 truncate">
                                <MapPin size={11} className="shrink-0" />
                                {pharmacy.address}
                            </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-gray-500 text-xs">
                            {pharmacy.phone && (
                                <a href={`tel:${pharmacy.phone}`} className="flex items-center gap-1 hover:text-primary-600 transition-colors">
                                    <Phone size={11} />
                                    {pharmacy.phone}
                                </a>
                            )}
                            {pharmacy.fax && (
                                <>
                                    <span className="text-gray-300">|</span>
                                    <p className="flex items-center gap-1">
                                        <Printer size={11} />
                                        {pharmacy.fax}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Remove from favorites inline */}
                    <FavoritePharmacyButton pharmacyId={pharmacy.id} initialIsFavorited={true} />
                </div>
            ))}

            <Link
                href="/consult?category=pharmacy"
                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm font-medium hover:border-primary-300 hover:text-primary-500 hover:bg-primary-50 transition-all"
            >
                <Search size={15} />
                {t('go_search')}
            </Link>
        </div>
    );
}
