"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavoritePharmacy } from "@/app/[locale]/(mobile)/profile/actions";
import { useTranslations } from "next-intl";

interface FavoritePharmacyButtonProps {
    pharmacyId: string;
    initialIsFavorited: boolean;
}

export default function FavoritePharmacyButton({ pharmacyId, initialIsFavorited }: FavoritePharmacyButtonProps) {
    const t = useTranslations('FavoritePharmacy');
    const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
    const [isPending, startTransition] = useTransition();

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Optimistic update
        setIsFavorited(prev => !prev);

        startTransition(async () => {
            try {
                const result = await toggleFavoritePharmacy(pharmacyId);
                setIsFavorited(result.isFavorited);
            } catch (err) {
                // Revert on error
                setIsFavorited(prev => !prev);
                console.error("Failed to toggle favorite", err);
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            aria-label={isFavorited ? t('remove_favorite') : t('add_favorite')}
            className={`p-2 rounded-full transition-all active:scale-90
                ${isFavorited
                    ? 'text-rose-500 bg-rose-50 hover:bg-rose-100'
                    : 'text-gray-300 bg-gray-50 hover:text-rose-400 hover:bg-rose-50'
                }
                ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
        >
            <Heart
                size={18}
                className="transition-all"
                fill={isFavorited ? "currentColor" : "none"}
            />
        </button>
    );
}
