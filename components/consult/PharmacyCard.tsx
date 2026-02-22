
import { MapPin, Phone, Star, Printer } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import FavoritePharmacyButton from "./FavoritePharmacyButton";

interface PharmacyProps {
    pharmacy: {
        id: string;
        name: string;
        address: string | null;
        phone: string | null;
        fax: string | null;
        isDefault: boolean;
        latitude: number;
        longitude: number;
        atFront: boolean;
    };
    isFavorited?: boolean;
    isLoggedIn?: boolean;
}

export default function PharmacyCard({ pharmacy, isFavorited, isLoggedIn }: PharmacyProps) {
    const t = useTranslations('ConsultPage');

    // Generate Google Maps URL
    const mapsUrl = pharmacy.latitude && pharmacy.longitude
        ? `https://www.google.com/maps/search/?api=1&query=${pharmacy.latitude},${pharmacy.longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharmacy.address || '')}`;

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-lg">{pharmacy.name}</h3>
                            {pharmacy.atFront && (
                                <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                                    {t('at_front')}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                            <MapPin size={14} />
                            {pharmacy.address || "No address"}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-gray-500 text-sm">
                            <p className="flex items-center gap-1">
                                <Phone size={14} />
                                {pharmacy.phone || "No phone"}
                            </p>
                            {pharmacy.fax && (
                                <>
                                    <span className="text-gray-300">|</span>
                                    <p className="flex items-center gap-1">
                                        <Printer size={14} />
                                        {pharmacy.fax}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Favorite button — only shown when user is logged in */}
                    {isLoggedIn && (
                        <FavoritePharmacyButton
                            pharmacyId={pharmacy.id}
                            initialIsFavorited={isFavorited ?? false}
                        />
                    )}
                </div>

                <div className="mt-4 flex gap-2">
                    {/* Call Button */}
                    {pharmacy.phone ? (
                        <a
                            href={`tel:${pharmacy.phone}`}
                            className="flex-1 bg-primary-50 text-primary-600 py-2 rounded-xl text-sm font-semibold hover:bg-primary-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <Phone size={16} />
                            {t('call')}
                        </a>
                    ) : (
                        <button disabled className="flex-1 bg-gray-100 text-gray-400 py-2 rounded-xl text-sm font-semibold cursor-not-allowed">
                            {t('call')}
                        </button>
                    )}

                    {/* Directions Button */}
                    <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-primary-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <MapPin size={16} />
                        {t('directions')}
                    </a>
                </div>
            </div>
        </div>
    );
}
