import React from 'react';
import { Home, ClipboardList, User, Stethoscope } from 'lucide-react';

const BottomNav = () => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2 px-6 pb-6 z-40 max-w-md mx-auto">
            <div className="flex justify-between items-center">
                <button className="flex flex-col items-center gap-1 text-primary-500">
                    <Home size={24} />
                    <span className="text-[10px] font-medium">Home</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
                    <Stethoscope size={24} />
                    <span className="text-[10px] font-medium">Consult</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
                    <ClipboardList size={24} />
                    <span className="text-[10px] font-medium">History</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
                    <User size={24} />
                    <span className="text-[10px] font-medium">My Page</span>
                </button>
            </div>
        </div>
    );
};

export default BottomNav;
