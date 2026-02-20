
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, AlertCircle, ChevronRight, User } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface HomeWelcomeProps {
    user: {
        name: string | null;
        isVerified: boolean;
    };
}

const HomeWelcome = ({ user }: HomeWelcomeProps) => {
    const t = useTranslations('HomePage');

    return (
        <div className="px-4 py-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-gray-50 p-2.5 rounded-full border border-gray-100">
                        <User size={20} className="text-gray-400" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-900 leading-tight">
                            {t('greeting', { name: user.name || 'User' })}
                        </h2>
                        <div className="flex items-center mt-1">
                            {user.isVerified ? (
                                <span className="inline-flex items-center text-[10px] font-bold bg-green-50 text-green-700 px-1.5 py-0.5 rounded-md border border-green-100 uppercase tracking-tighter">
                                    <CheckCircle2 size={10} className="mr-0.5" />
                                    {t('verified')}
                                </span>
                            ) : (
                                <span className="inline-flex items-center text-[10px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md border border-amber-100 uppercase tracking-tighter">
                                    <AlertCircle size={10} className="mr-0.5" />
                                    {t('pending')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {!user.isVerified && (
                    <Link
                        href="/profile"
                        className="flex items-center gap-1 text-[11px] font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-2.5 py-1.5 rounded-full transition-colors"
                    >
                        {t('complete_profile')}
                        <ChevronRight size={12} />
                    </Link>
                )}
            </div>
        </div>
    );
};

export default HomeWelcome;
