"use client";

import React from 'react';
import { TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DailyStats {
    date: string;
    total: number;
    count: number;
}

interface DailyIncomeStatsProps {
    stats: DailyStats[];
    today: { total: number; count: number };
    totalLast30Days: number;
}

export default function DailyIncomeStats({ stats, today, totalLast30Days }: DailyIncomeStatsProps) {
    const t = useTranslations('Admin.payments.stats');

    // Sort stats by date (descending) for the list
    const sortedStats = [...stats].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Summary Cards */}
            <div className="lg:col-span-1 space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('today_income')}</p>
                        <h3 className="text-2xl font-black text-blue-600">
                            ₩{today.total.toLocaleString()}
                        </h3>
                        <p className="text-[10px] text-gray-500 mt-1 font-medium">{t('payments_count', { count: today.count })}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-500">
                        <TrendingUp size={24} />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('last_30_days')}</p>
                        <h3 className="text-2xl font-black text-gray-900">
                            ₩{totalLast30Days.toLocaleString()}
                        </h3>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl text-gray-400">
                        <Calendar size={24} />
                    </div>
                </div>
            </div>

            {/* Daily List */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center">
                    <h4 className="text-sm font-bold text-gray-800">{t('recent_daily_income')}</h4>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-bold uppercase">{t('last_7_days')}</span>
                </div>
                <div className="flex-1 overflow-x-auto">
                    <div className="flex gap-4 p-5 min-w-max">
                        {sortedStats.length === 0 ? (
                            <p className="text-sm text-gray-400 p-4">{t('no_data')}</p>
                        ) : (
                            sortedStats.map((stat) => (
                                <div key={stat.date} className="flex flex-col items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100 min-w-[120px]">
                                    <span className="text-[10px] font-bold text-gray-400 mb-1">{stat.date.split('-').slice(1).join('/')}</span>
                                    <span className="text-sm font-black text-gray-800">₩{(stat.total / 1000).toFixed(1)}{t('unit_k')}</span>
                                    <span className="text-[9px] text-gray-500 font-medium">({t('payments_count', { count: stat.count })})</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
