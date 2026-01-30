import React from 'react';
import { Search, MapPin, Bell } from 'lucide-react';

const Header = () => {
    return (
        <header className="sticky top-0 z-50 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                    <span className="text-xl font-bold text-primary-500">CallDoc</span>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                        <MapPin size={20} />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                        <Bell size={20} />
                    </button>
                </div>
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 sm:text-sm transition-all shadow-sm"
                    placeholder="Search symptoms, hospitals, drugs..."
                />
            </div>
        </header>
    );
};

export default Header;
