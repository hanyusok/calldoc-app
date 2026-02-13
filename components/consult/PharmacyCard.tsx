
import { MapPin, Phone, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface PharmacyProps {
    pharmacy: {
        id: string;
        name: string;
        address: string | null;
        phone: string | null;
        fax: string | null;
        isDefault: boolean;
    };
}

export default function PharmacyCard({ pharmacy }: PharmacyProps) {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">{pharmacy.name}</h3>
                        <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                            <MapPin size={14} />
                            {pharmacy.address || "No address"}
                        </p>
                        <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                            <Phone size={14} />
                            {pharmacy.phone || "No phone"}
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    {/* Placeholder for future actions */}
                    <button className="flex-1 bg-primary-50 text-primary-600 py-2 rounded-xl text-sm font-semibold hover:bg-primary-100 transition-colors">
                        Call
                    </button>
                    <button className="flex-1 bg-primary-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors">
                        Directions
                    </button>
                </div>
            </div>
        </div>
    );
}
