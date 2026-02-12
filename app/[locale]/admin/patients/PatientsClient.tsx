"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { deleteUser } from "@/app/actions/user";

export default function PatientsClient({ initialUsers, initialTotal, initialPage }: { initialUsers: any[], initialTotal: number, initialPage: number }) {
    const t = useTranslations('Admin.patients');
    const [users, setUsers] = useState(initialUsers);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(initialPage);
    const [loading, setLoading] = useState(false);

    // In a real app we would use router.push/replace for search & pagination to keep URL info
    // For this migration, simple state is okay for v1

    const handleDelete = async (userId: string) => {
        if (!confirm(t('confirm_delete'))) return;

        setLoading(true);
        try {
            const res = await deleteUser(userId);
            if (res.success) {
                setUsers(users.filter(u => u.id !== userId));
                alert(t('delete_success'));
            } else {
                alert(t('delete_error'));
            }
        } catch (e) {
            console.error(e);
            alert(t('delete_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder={t('search_placeholder')}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                // Implement debounced search here or simple enter key
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="p-4">{t('table.name')}</th>
                                <th className="p-4">{t('table.email')}</th>
                                <th className="p-4">{t('table.joined_at')}</th>
                                <th className="p-4 text-center">{t('table.appointments')}</th>
                                <th className="p-4 text-right">{t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400">
                                        No patients found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">{user.name || "N/A"}</td>
                                        <td className="p-4 text-gray-600">{user.email}</td>
                                        <td className="p-4 text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                                                {user._count?.appointments || 0}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                disabled={loading}
                                                className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                                                title={t('delete')}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Placeholder */}
                <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
                    <button className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>
                        <ChevronLeft size={16} />
                    </button>
                    <button className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
