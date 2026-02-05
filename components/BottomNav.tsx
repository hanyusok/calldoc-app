'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, User, Stethoscope } from 'lucide-react';
import { useTranslations } from 'next-intl';

const BottomNav = () => {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname?.startsWith(path)) return true;
        return false;
    };

    const t = useTranslations('Navigation');

    const getLinkClass = (path: string) => {
        return isActive(path)
            ? "flex flex-col items-center gap-1 text-primary-500"
            : "flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600";
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2 px-6 pb-6 z-40 max-w-md mx-auto">
            <div className="flex justify-between items-center">
                <Link href="/" className={getLinkClass('/')}>
                    <Home size={24} />
                    <span className="text-[10px] font-medium">{t('home')}</span>
                </Link>
                <Link href="/consult" className={getLinkClass('/consult')}>
                    <Stethoscope size={24} />
                    <span className="text-[10px] font-medium">{t('consult')}</span>
                </Link>
                <Link href="/dashboard" className={getLinkClass('/dashboard')}>
                    <ClipboardList size={24} />
                    <span className="text-[10px] font-medium">{t('dashboard')}</span>
                </Link>
                <Link href="/profile" className={getLinkClass('/profile')}>
                    <User size={24} />
                    <span className="text-[10px] font-medium">{t('profile')}</span>
                </Link>
            </div>
        </div>
    );
};

export default BottomNav;
