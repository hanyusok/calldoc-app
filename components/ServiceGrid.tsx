import React from 'react';
import Link from 'next/link';
import { Video, Stethoscope, Pill, Building2, Ticket, Activity, Salad, FlaskConical } from 'lucide-react';

const services = [
    { name: 'Telemedicine', icon: Video, color: 'bg-blue-100 text-blue-600' },
    { name: 'Hospital', icon: Building2, color: 'bg-green-100 text-green-600' },
    { name: 'Pharmacy', icon: Pill, color: 'bg-orange-100 text-orange-600' },
    { name: 'Symptoms', icon: Stethoscope, color: 'bg-purple-100 text-purple-600' },
    { name: 'Health Check', icon: Activity, color: 'bg-red-100 text-red-600' },
    { name: 'Supplements', icon: Salad, color: 'bg-yellow-100 text-yellow-600' },
    { name: 'Lab Test', icon: FlaskConical, color: 'bg-teal-100 text-teal-600' },
    { name: 'Events', icon: Ticket, color: 'bg-indigo-100 text-indigo-600' },
];

const ServiceGrid = () => {
    return (
        <div className="px-4 py-2">
            <div className="grid grid-cols-4 gap-4">
                {services.map((service, index) => (
                    <Link
                        href={`/consult?category=${service.name.toLowerCase().replace(/\s+/g, '-')}`}
                        key={index}
                        className="flex flex-col items-center gap-2 group cursor-pointer"
                    >
                        <div className={`p-3.5 rounded-2xl ${service.color} transition-transform group-hover:scale-105 shadow-sm`}>
                            <service.icon size={24} strokeWidth={2} />
                        </div>
                        <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                            {service.name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ServiceGrid;
