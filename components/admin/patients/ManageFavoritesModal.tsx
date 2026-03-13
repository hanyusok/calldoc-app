"use client";

import { useState, useEffect } from "react";
import { X, Search, Star, Trash2, Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { getUserWithFavorites, addFavoritePharmacy, removeFavoritePharmacy } from "@/app/actions/user";
import { getPharmacies } from "@/app/actions/pharmacy";

interface ManageFavoritesModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
}

export default function ManageFavoritesModal({ isOpen, onClose, userId, userName }: ManageFavoritesModalProps) {
    const t = useTranslations('Admin.shared.favorites');
    const [loading, setLoading] = useState(false);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            loadFavorites();
        }
    }, [isOpen, userId]);

    const loadFavorites = async () => {
        setLoading(true);
        try {
            const user = await getUserWithFavorites(userId);
            if (user && user.favoritePharmacies) {
                setFavorites(user.favoritePharmacies.map((f: any) => f.pharmacy));
            }
        } catch (error) {
            console.error("Failed to load favorites", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const res = await getPharmacies(1, 10, searchQuery);
            setSearchResults(res.pharmacies);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAdd = async (pharmacyId: string) => {
        setLoading(true);
        try {
            const res = await addFavoritePharmacy(userId, pharmacyId);
            if (res.success) {
                await loadFavorites();
                setSearchQuery("");
                setSearchResults([]);
            } else {
                alert(res.error);
            }
        } catch (error) {
            console.error("Failed to add favorite", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (pharmacyId: string) => {
        if (!confirm(t('remove_confirm'))) return;
        
        setLoading(true);
        try {
            const res = await removeFavoritePharmacy(userId, pharmacyId);
            if (res.success) {
                await loadFavorites();
            } else {
                alert(res.error);
            }
        } catch (error) {
            console.error("Failed to remove favorite", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b">
                    <div>
                        <h3 className="text-lg font-bold">{t('title')}</h3>
                        <p className="text-sm text-gray-500">{t('subtitle', { name: userName })}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-6">
                    {/* Current Favorites */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Star size={16} className="text-yellow-500 fill-yellow-500" />
                            {t('current_favorites')}
                        </h4>
                        {loading && favorites.length === 0 ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="animate-spin text-blue-500" />
                            </div>
                        ) : favorites.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4 border-2 border-dashed rounded-lg">
                                {t('no_favorites')}
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-2">
                                {favorites.map(pharmacy => (
                                    <div key={pharmacy.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 bg-white shadow-sm">
                                        <div>
                                            <p className="font-medium text-gray-900">{pharmacy.name}</p>
                                            <p className="text-xs text-gray-500">{pharmacy.address || "No address"}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(pharmacy.id)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                                            title={t('remove_confirm')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <hr />

                    {/* Add New Favorite */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('add_favorite')}</h4>
                        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder={t('search_placeholder')}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSearching || !searchQuery.trim()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                {isSearching ? <Loader2 className="animate-spin" size={18} /> : t('search')}
                            </button>
                        </form>

                        {searchResults.length > 0 && (
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                {searchResults.map(pharmacy => {
                                    const isAlreadyFavorite = favorites.some(f => f.id === pharmacy.id);
                                    return (
                                        <div key={pharmacy.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{pharmacy.name}</p>
                                                <p className="text-xs text-gray-500 line-clamp-1">{pharmacy.address}</p>
                                            </div>
                                            <button
                                                onClick={() => handleAdd(pharmacy.id)}
                                                disabled={isAlreadyFavorite || loading}
                                                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-md font-medium transition ${
                                                    isAlreadyFavorite 
                                                    ? "bg-green-100 text-green-700 cursor-default" 
                                                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                }`}
                                            >
                                                {isAlreadyFavorite ? t('already_added') : (
                                                    <><Plus size={14} /> {t('add')}</>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    >
                        {t('close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
