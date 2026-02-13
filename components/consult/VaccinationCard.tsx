
import React from 'react';
import { Syringe, MapPin, Clock } from 'lucide-react';

interface Vaccination {
    id: string;
    name: string;
    price: number;
    description: string | null;
    visitTime: string | null;
    location: string | null;
    category: string | null;
}

const VaccinationCard = ({ vaccination }: { vaccination: Vaccination }) => {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                            {vaccination.category || "Vaccine"}
                        </span>
                    </div>
                    <h3 className="font-bold text-gray-900">{vaccination.name}</h3>
                </div>
                <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                    <Syringe size={20} />
                </div>
            </div>

            <p className="text-xs text-gray-500 line-clamp-2">{vaccination.description}</p>

            <div className="flex flex-col gap-1 mt-2 text-xs text-gray-600">
                {vaccination.location && (
                    <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-gray-400" />
                        <span>{vaccination.location}</span>
                    </div>
                )}
                {vaccination.visitTime && (
                    <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-gray-400" />
                        <span>Rec. Visit: {vaccination.visitTime}</span>
                    </div>
                )}
            </div>

            <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between items-center">
                <span className="font-bold text-blue-600">
                    {vaccination.price === 0 ? "Free" : `₩${vaccination.price.toLocaleString()}`}
                </span>
                <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                    Reserve
                </button>
            </div>
        </div>
    );
};

export default VaccinationCard;
