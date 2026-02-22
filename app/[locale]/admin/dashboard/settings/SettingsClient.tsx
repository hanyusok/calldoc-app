"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Save } from "lucide-react";
import { updateSettings } from "@/app/actions/settings";
import { useRouter } from "next/navigation";

interface SettingsClientProps {
    initialSettings: {
        siteName: string;
        maintenanceMode: boolean;
        homePostsCount: number;
        heroBannerTitle: string;
        heroBannerSubtitle: string;
    };
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
    const t = useTranslations('Admin.settings');
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState(initialSettings);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await updateSettings(settings);
            if (res.success) {
                alert(t('saved_success'));
                router.refresh();
            } else {
                alert(res.error || t('saved_error'));
            }
        } catch (error) {
            console.error(error);
            alert(t('saved_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div>
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">{t('general')}</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('site_name')}
                            </label>
                            <input
                                type="text"
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('home_posts_count')}
                            </label>
                            <input
                                type="number"
                                value={settings.homePostsCount ?? 0}
                                onChange={(e) => setSettings({ ...settings, homePostsCount: parseInt(e.target.value) || 0 })}
                                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t('maintenance_mode')}
                                </label>
                                <p className="text-sm text-gray-500">{t('maintenance_desc')}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.maintenanceMode}
                                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Hero Banner Section */}
                <div>
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">{t('hero_banner')}</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('hero_title')}
                            </label>
                            <input
                                type="text"
                                value={settings.heroBannerTitle}
                                onChange={(e) => setSettings({ ...settings, heroBannerTitle: e.target.value })}
                                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="지금 바로 진료 예약"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('hero_subtitle')}
                            </label>
                            <input
                                type="text"
                                value={settings.heroBannerSubtitle}
                                onChange={(e) => setSettings({ ...settings, heroBannerSubtitle: e.target.value })}
                                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="전문의와 비대면으로 빠르고 편리하게"
                            />
                        </div>

                        {/* Live preview */}
                        <div className="relative w-full h-28 bg-gradient-to-r from-primary-400 to-primary-600 rounded-2xl overflow-hidden flex items-center px-5 mt-2">
                            <div className="z-10 text-white">
                                <p className="text-base font-bold mb-0.5">{settings.heroBannerTitle || "제목"}</p>
                                <p className="text-xs opacity-90">{settings.heroBannerSubtitle || "부제목"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "..." : <Save size={18} />}
                        {t('save_changes')}
                    </button>
                </div>
            </div>
        </div>
    );
}
