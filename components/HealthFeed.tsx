import React from 'react';
import { ChevronRight } from 'lucide-react';

const HealthFeed = () => {
    return (
        <div className="px-4 py-4 mb-20">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg text-gray-800">For You</h3>
                <button className="text-xs text-primary-500 font-medium flex items-center">
                    View All <ChevronRight size={14} />
                </button>
            </div>

            <div className="space-y-3">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex gap-3">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
                        <div className="flex flex-col justify-between py-1">
                            <div>
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">HEALTH TIP</span>
                                <h4 className="font-bold text-sm mt-1 leading-tight">How to prevent seasonal flu effectively?</h4>
                            </div>
                            <p className="text-xs text-gray-400">Read in 3 mins</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HealthFeed;
