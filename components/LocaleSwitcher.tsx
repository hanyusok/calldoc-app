"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "../i18n/routing";
import { useTransition, useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";

export default function LocaleSwitcher() {
    const t = useTranslations("LocaleSwitcher");
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    function onSelect(nextLocale: string) {
        setIsOpen(false);
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
                aria-label={t("label")}
                disabled={isPending}
            >
                <Globe size={20} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <button
                        onClick={() => onSelect('ko')}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${locale === 'ko' ? 'text-primary-600 font-medium bg-primary-50' : 'text-gray-700'}`}
                    >
                        <span>한국어</span>
                        {locale === 'ko' && <Check size={14} />}
                    </button>
                    <button
                        onClick={() => onSelect('en')}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${locale === 'en' ? 'text-primary-600 font-medium bg-primary-50' : 'text-gray-700'}`}
                    >
                        <span>English</span>
                        {locale === 'en' && <Check size={14} />}
                    </button>
                </div>
            )}
        </div>
    );
}
