"use client";

import { useState, useEffect } from "react";
import { getMeetPresets, createMeetPreset, deleteMeetPreset, toggleDefaultPreset, updateMeetPreset } from "@/app/actions/meet";
import { Plus, Trash2, Star, Link as LinkIcon, ExternalLink, Edit } from "lucide-react";
import { useTranslations } from "next-intl";

export default function MeetPresetsPage() {
    const t = useTranslations('Admin.meet');
    const [presets, setPresets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        link: "",
        description: "",
        isDefault: false
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        loadPresets();
    }, []);

    const loadPresets = async () => {
        const data = await getMeetPresets();
        setPresets(data);
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            if (editingId) {
                const res = await updateMeetPreset(editingId, {
                    name: formData.name,
                    link: formData.link,
                    description: formData.description
                });
                if (res.success) {
                    setFormData({ name: "", link: "", description: "", isDefault: false });
                    setEditingId(null);
                    loadPresets();
                    alert(t('preset_updated'));
                } else {
                    alert(t('error_update'));
                }
            } else {
                const res = await createMeetPreset(formData);
                if (res.success) {
                    setFormData({ name: "", link: "", description: "", isDefault: false });
                    loadPresets();
                    alert(t('preset_created'));
                } else {
                    alert(t('error_create'));
                }
            }
        } catch (error) {
            console.error(error);
            alert(editingId ? t('error_update') : t('error_create'));
        } finally {
            setIsCreating(false);
        }
    };

    const startEditing = (preset: any) => {
        setEditingId(preset.id);
        setFormData({
            name: preset.name,
            link: preset.link,
            description: preset.description || "",
            isDefault: preset.isDefault
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setFormData({ name: "", link: "", description: "", isDefault: false });
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('confirm_delete'))) return;
        try {
            await deleteMeetPreset(id);
            loadPresets();
        } catch (error) {
            console.error(error);
            alert(t('error_delete'));
        }
    };

    const handleToggleDefault = async (id: string) => {
        try {
            await toggleDefaultPreset(id);
            loadPresets();
        } catch (error) {
            console.error(error);
            alert(t('error_update'));
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('manage_presets')}</h1>

            {/* Create Form */}
            <div className={`p-6 rounded-xl shadow-sm border transition-all ${editingId ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}>
                <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {editingId ? <Edit className="text-blue-600" size={20} /> : <Plus size={20} className="text-blue-600" />}
                        {editingId ? t('edit_preset') : t('add_new_preset')}
                    </div>
                    {editingId && (
                        <button 
                            onClick={cancelEditing}
                            className="text-sm font-medium text-gray-500 hover:text-gray-700 underline"
                        >
                            {t('cancel')}
                        </button>
                    )}
                </h2>
                <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('preset_name')}</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Dr. Kim's Room"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('preset_link')}</label>
                        <input
                            type="url"
                            required
                            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="https://meet.google.com/..."
                            value={formData.link}
                            onChange={e => setFormData({ ...formData, link: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            disabled={isCreating}
                            className={`w-full text-white p-2 rounded-lg transition flex items-center justify-center gap-2 ${editingId ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isCreating ? t('saving') : (editingId ? t('update_preset') : t('save_preset'))}
                        </button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                            <tr>
                                <th className="px-6 py-4">{t('preset_name')}</th>
                                <th className="px-6 py-4">{t('preset_link')}</th>
                                <th className="px-6 py-4 text-center">{t('is_default')}</th>
                                <th className="px-6 py-4 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center">{t('loading')}</td>
                                </tr>
                            ) : presets.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center">{t('no_presets')}</td>
                                </tr>
                            ) : (
                                presets.map((preset) => (
                                    <tr key={preset.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{preset.name}</td>
                                        <td className="px-6 py-4">
                                            <a href={preset.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                <LinkIcon size={14} />
                                                {preset.link}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleDefault(preset.id)}
                                                className={`p-1 rounded-full transition-colors ${preset.isDefault ? 'text-amber-500 bg-amber-50' : 'text-gray-300 hover:text-amber-500'}`}
                                                title={t('set_default')}
                                            >
                                                <Star size={20} fill={preset.isDefault ? "currentColor" : "none"} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => startEditing(preset)}
                                                className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                title={t('edit_preset')}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(preset.id)}
                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                title={t('delete')}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
