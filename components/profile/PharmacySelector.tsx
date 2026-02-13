"use client";

import { useState, useEffect } from "react";
import { MapPin, Check, Plus, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { getPharmacies } from "@/app/[locale]/(mobile)/consult/actions"; // Reuse existing action

interface Pharmacy {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
}

interface PharmacySelectorProps {
    selectedPharmacy: Pharmacy | null;
    onSelect: (pharmacyId: string) => Promise<void>;
}

export default function PharmacySelector({ selectedPharmacy, onSelect }: PharmacySelectorProps) {
    const t = useTranslations('ProfilePage');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch on open
    const handleOpenModal = () => {
        setIsModalOpen(true);
        fetchPharmacies("");
    };

    const fetchPharmacies = async (query: string) => {
        setLoading(true);
        try {
            const data = await getPharmacies({ query });
            setPharmacies(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        if (!isModalOpen) return;
        const timer = setTimeout(() => {
            fetchPharmacies(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, isModalOpen]);

    const handleSelect = async (pharmacy: Pharmacy) => {
        try {
            await onSelect(pharmacy.id);
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            alert("Failed to select pharmacy");
        }
    };

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                    Nearby Pharmacy
                </h2>
            </div>

            {selectedPharmacy ? (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-blue-900">{selectedPharmacy.name}</h3>
                            <p className="text-blue-700 text-sm mt-1">{selectedPharmacy.address}</p>
                            <p className="text-blue-600 text-sm mt-1">{selectedPharmacy.phone}</p>
                        </div>
                        <button
                            onClick={handleOpenModal}
                            className="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-50 transition-colors"
                        >
                            Change
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={handleOpenModal}
                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium flex items-center justify-center gap-2 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all ml-0"
                >
                    <Plus size={20} />
                    Select Pharmacy
                </button>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-lg font-bold">Select Pharmacy</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 border-b bg-gray-50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search pharmacy..."
                                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 p-2">
                            {loading ? (
                                <div className="p-8 text-center text-gray-400">Loading...</div>
                            ) : pharmacies.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No pharmacies found</div>
                            ) : (
                                <div className="space-y-2">
                                    {pharmacies.map(pharmacy => (
                                        <button
                                            key={pharmacy.id}
                                            onClick={() => handleSelect(pharmacy)}
                                            className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between group
                                                ${selectedPharmacy?.id === pharmacy.id
                                                    ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500'
                                                    : 'hover:bg-gray-50 border-gray-100'
                                                }`}
                                        >
                                            <div>
                                                <h4 className={`font-semibold ${selectedPharmacy?.id === pharmacy.id ? 'text-blue-900' : 'text-gray-900'}`}>
                                                    {pharmacy.name}
                                                </h4>
                                                <p className="text-sm text-gray-500 mt-0.5">{pharmacy.address}</p>
                                            </div>
                                            {selectedPharmacy?.id === pharmacy.id && (
                                                <div className="bg-blue-500 text-white p-1 rounded-full">
                                                    <Check size={14} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
