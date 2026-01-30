import React from 'react';
import { Star, MapPin, Clock } from 'lucide-react';

interface DoctorCardProps {
    name: string;
    specialty: string;
    hospital: string;
    rating: number;
    reviewCount: number;
    imageUrl?: string;
    isAvailable?: boolean;
    distance?: string;
}

const DoctorCard: React.FC<DoctorCardProps> = ({
    name,
    specialty,
    hospital,
    rating,
    reviewCount,
    isAvailable = false,
    distance
}) => {
    return (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 mb-3 transition-all hover:shadow-md cursor-pointer">
            <div className="relative">
                <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200)' }}>
                </div>
                {isAvailable && (
                    <span className="absolute -bottom-2 -right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full border-2 border-white font-bold">
                        Avail
                    </span>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-gray-900 text-base">{name}</h3>
                        <p className="text-sm text-primary-600 font-medium">{specialty}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded-md">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-yellow-700">{rating}</span>
                        <span className="text-[10px] text-gray-400">({reviewCount})</span>
                    </div>
                </div>

                <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={12} />
                        <span className="truncate">{hospital}</span>
                        {distance && <span className="text-gray-300">• {distance}</span>}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 w-fit px-2 py-0.5 rounded-md">
                        <Clock size={12} />
                        <span>Available in 10 min</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorCard;
