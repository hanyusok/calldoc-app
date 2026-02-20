"use client";

import { useState, useEffect } from "react";
import { generateAndSaveMeetingLink, saveMeetingLink, getMeetPresets } from "@/app/actions/meet";
import { Loader2, Video, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";

export default function MeetManager({
    appointmentId,
    patientName,
    startDateTime,
    endDateTime,
    onSuccess
}: {
    appointmentId: string,
    patientName: string,
    startDateTime: Date,
    endDateTime: Date,
    onSuccess?: (link: string) => void
}) {
    const t = useTranslations('Admin.meet');
    const locale = useLocale();
    const [loading, setLoading] = useState(false);
    const [link, setLink] = useState("");
    const [presets, setPresets] = useState<any[]>([]);
    const [selectedPresetId, setSelectedPresetId] = useState("");

    useEffect(() => {
        getMeetPresets().then(data => {
            setPresets(data);
            const def = data.find((p: any) => p.isDefault);
            if (def) setSelectedPresetId(def.id);
        });
    }, []);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            let resultLink: string | null = null;

            if (selectedPresetId) {
                // Use Preset
                const preset = presets.find(p => p.id === selectedPresetId);
                if (preset) {
                    resultLink = preset.link;
                    // We need a separate action just to save the link without generating a new one
                    await saveMeetingLink(appointmentId, preset.link);
                }
            } else {
                // Generate New
                resultLink = await generateAndSaveMeetingLink({
                    appointmentId,
                    patientName,
                    startDateTime: new Date(startDateTime),
                    endDateTime: new Date(endDateTime)
                });
            }

            if (resultLink) {
                setLink(resultLink);
                if (onSuccess) onSuccess(resultLink);
                alert(t('link_created'));
            } else {
                alert(t('error_create'));
            }
        } catch (error) {
            console.error(error);
            alert(t('error_create'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                    <Video size={18} />
                    {t('title')}
                </h3>
                <Link href={`/${locale}/admin/dashboard/meet`} className="text-gray-400 hover:text-gray-600">
                    <Settings size={16} />
                </Link>
            </div>

            {!link ? (
                <div className="space-y-3">
                    {presets.length > 0 && (
                        <div>
                            <select
                                className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none mb-2"
                                value={selectedPresetId}
                                onChange={(e) => setSelectedPresetId(e.target.value)}
                            >
                                <option value="">{t('generate_link')}</option>
                                <optgroup label={t('use_preset')}>
                                    {presets.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} {p.isDefault ? `(${t('is_default')})` : ''}
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>
                    )}

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={14} />}
                        {selectedPresetId ? t('send_preset_link') : t('generate_link_send')}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    <p className="text-sm text-green-600 font-medium">{t('link_created')}</p>
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm break-all">
                        {link}
                    </a>
                </div>
            )}
        </div>
    );
}
