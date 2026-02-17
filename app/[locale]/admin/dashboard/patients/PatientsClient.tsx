"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useFormatter } from "next-intl";
import { Search, Trash2, ChevronLeft, ChevronRight, Plus, Edit, X } from "lucide-react";
import { deleteUser, createUser, updateUser } from "@/app/actions/user";
import { Role } from "@prisma/client";

export default function PatientsClient({ initialUsers, initialTotal, initialPage }: { initialUsers: any[], initialTotal: number, initialPage: number }) {
    const t = useTranslations('Admin.patients');
    // We can reuse some keys from Admin.users for common form fields if needed, or add to patients
    const tUsers = useTranslations('Admin.users');
    const format = useFormatter();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [users, setUsers] = useState(initialUsers);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [total, setTotal] = useState(initialTotal);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(total / itemsPerPage);

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            const currentQ = params.get('q') || '';

            if (currentQ !== search) {
                if (search) {
                    params.set('q', search);
                } else {
                    params.delete('q');
                }
                params.set('page', '1');
                router.push(`?${params.toString()}`);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search]);

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;

        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`?${params.toString()}`);
        setCurrentPage(newPage);
    };


    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "PATIENT" as Role,
        phoneNumber: ""
    });

    const openModal = (user?: any) => {
        if (user) {
            setIsEditing(true);
            setCurrentUser(user);
            setFormData({
                name: user.name || "",
                email: user.email || "",
                password: "",
                role: "PATIENT",
                phoneNumber: user.phoneNumber || ""
            });
        } else {
            setIsEditing(false);
            setCurrentUser(null);
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "PATIENT",
                phoneNumber: ""
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setCurrentUser(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditing) {
                const res = await updateUser(currentUser.id, formData);
                if (res.success) {
                    alert(tUsers('update_success'));
                    closeModal();
                    router.refresh(); // Server component refresh
                    // Optimistic update
                    setUsers(users.map(u => u.id === currentUser.id ? { ...u, ...formData } : u));
                } else {
                    alert(res.error || tUsers('size_error'));
                }
            } else {
                const res = await createUser(formData);
                if (res.success) {
                    alert(tUsers('create_success'));
                    closeModal();
                    router.refresh();
                } else {
                    alert(res.error || tUsers('create_error'));
                }
            }
        } catch (error) {
            console.error(error);
            alert(tUsers('error_generic'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm(t('confirm_delete'))) return;

        setLoading(true);
        try {
            const res = await deleteUser(userId);
            if (res.success) {
                setUsers(users.filter(u => u.id !== userId));
                alert(t('delete_success'));
                router.refresh();
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{t('title')}</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                >
                    <Plus size={18} />
                    {t('add_patient') || tUsers('add_user')}
                    {/* Fallback if add_patient key doesn't exist yet, effectively re-using add_user usually */}
                </button>
            </div>

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder={t('search_placeholder')}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
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
                                            {format.dateTime(new Date(user.createdAt), {
                                                year: 'numeric',
                                                month: 'numeric',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                                                {user._count?.appointments || 0}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button
                                                onClick={() => openModal(user)}
                                                className="text-blue-500 hover:bg-blue-50 p-2 rounded transition-colors"
                                                title={tUsers('edit')}
                                            >
                                                <Edit size={16} />
                                            </button>
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
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between bg-white px-6 py-4 border-t border-gray-100">
                        <div className="text-sm text-gray-600">
                            {tUsers('pagination.showing')} {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, total)} {tUsers('pagination.of')} {total}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronLeft size={18} />
                                {tUsers('pagination.previous')}
                            </button>
                            <div className="text-sm text-gray-600 px-3">
                                {tUsers('pagination.page')} {currentPage} {tUsers('pagination.of')} {totalPages}
                            </div>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {tUsers('pagination.next')}
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-bold">{isEditing ? tUsers('edit_user') : tUsers('add_user')}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{tUsers('form.name')}</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{tUsers('form.email')}</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {tUsers('form.password')} {isEditing && <span className="text-xs text-gray-500">({tUsers('leave_blank')})</span>}
                                </label>
                                <input
                                    type="password"
                                    required={!isEditing}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            {/* Role is hidden/fixed to PATIENT */}
                            <input type="hidden" value="PATIENT" />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{tUsers('form.phone')}</label>
                                <input
                                    type="tel"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.phoneNumber}
                                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                />
                            </div>

                            <div className="pt-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                                >
                                    {tUsers('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                                >
                                    {loading ? tUsers('saving') : tUsers('save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
