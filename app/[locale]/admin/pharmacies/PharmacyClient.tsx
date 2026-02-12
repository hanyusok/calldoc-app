"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Edit2, Check } from "lucide-react";
import { createPharmacy, deletePharmacy, updatePharmacy, setPharmacyDefault } from "@/app/actions/pharmacy";

export default function PharmacyClient({ initialPharmacies }: { initialPharmacies: any[] }) {
    const t = useTranslations('Admin.pharmacy');
    const [pharmacies, setPharmacies] = useState(initialPharmacies);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", fax: "", phone: "", address: "" });
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        setLoading(true);
        try {
            const res = await createPharmacy(formData);
            if (res.pharmacy) {
                setPharmacies([res.pharmacy, ...pharmacies]);
                setIsModalOpen(false);
                setFormData({ name: "", fax: "", phone: "", address: "" });
            } else {
                alert("Failed to create pharmacy");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('delete') + "?")) return;
        try {
            await deletePharmacy(id);
            setPharmacies(pharmacies.filter(p => p.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{t('title')}</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus size={20} /> {t('add_new')}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-medium text-gray-500">{t('name')}</th>
                            <th className="p-4 font-medium text-gray-500">{t('fax')}</th>
                            <th className="p-4 font-medium text-gray-500">{t('phone')}</th>
                            <th className="p-4 font-medium text-gray-500">{t('address')}</th>
                            <th className="p-4 font-medium text-gray-500 text-right">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {pharmacies.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium">{p.name} {p.isDefault && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded ml-2">{t('is_default')}</span>}</td>
                                <td className="p-4 text-gray-600">{p.fax || "-"}</td>
                                <td className="p-4 text-gray-600">{p.phone || "-"}</td>
                                <td className="p-4 text-gray-600">{p.address || "-"}</td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="text-red-500 hover:text-red-700 p-2"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {pharmacies.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400">
                                    No pharmacies found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
                        <h2 className="text-lg font-bold mb-4">{t('add_new')}</h2>
                        <div className="space-y-4">
                            <input
                                placeholder={t('name')}
                                className="w-full p-2 border rounded"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input
                                placeholder={t('fax')}
                                className="w-full p-2 border rounded"
                                value={formData.fax}
                                onChange={e => setFormData({ ...formData, fax: e.target.value })}
                            />
                            <input
                                placeholder={t('phone')}
                                className="w-full p-2 border rounded"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <input
                                placeholder={t('address')}
                                className="w-full p-2 border rounded"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
