"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useFormatter } from "next-intl";
import { Search, Trash2, ChevronLeft, ChevronRight, Plus, Edit, X } from "lucide-react";
import { deleteUser, createUser, updateUser } from "@/app/actions/user";
import { Role } from "@prisma/client";
import PageHeader from "@/components/admin/shared/PageHeader";

export default function UsersClient({ initialUsers, initialTotal, initialPage }: { initialUsers: any[], initialTotal: number, initialPage: number }) {
    const t = useTranslations('Admin.users');
    const format = useFormatter();
    const [users, setUsers] = useState(initialUsers);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    // Debounce search/filter
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            const currentQ = params.get('q') || '';
            const currentRole = params.get('role') || 'ALL';

            // Only push if changed
            if (currentQ !== search || currentRole !== roleFilter) {
                const newParams = new URLSearchParams();
                if (search) newParams.set('q', search);
                if (roleFilter && roleFilter !== 'ALL') newParams.set('role', roleFilter);
                newParams.set('page', '1'); // Reset page

                router.push(`?${newParams.toString()}`);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, roleFilter]);

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
                password: "", // Don't show password
                role: user.role,
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
                    alert(t('update_success'));
                    closeModal();
                    // In a real app, we would refresh data here. For now, we can rely on page refresh or optimistic update
                    window.location.reload();
                } else {
                    alert(res.error || t('size_error'));
                }
            } else {
                const res = await createUser(formData);
                if (res.success) {
                    alert(t('create_success'));
                    closeModal();
                    window.location.reload();
                } else {
                    alert(res.error || t('create_error'));
                }
            }
        } catch (error) {
            console.error(error);
            alert(t('error_generic'));
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
        <div className="space-y-6">
            <PageHeader
                title={t('title')}
                actions={
                    <button
                        onClick={() => openModal()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                    >
                        <Plus size={18} />
                        {t('add_user')}
                    </button>
                }
            />

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder={t('search_placeholder')}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="border border-gray-200 rounded-lg px-4 py-2 bg-white"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as any)}
                >
                    <option value="ALL">{t('filter_all')}</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="STAFF">STAFF</option>
                    <option value="PHARMACIST">PHARMACIST</option>
                    <option value="PATIENT">PATIENT</option>
                </select>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="p-4">{t('table.name')}</th>
                                <th className="p-4">{t('table.email')}</th>
                                <th className="p-4">{t('table.role')}</th>
                                <th className="p-4">{t('table.created_at')}</th>
                                <th className="p-4 text-right">{t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400">
                                        {t('no_users')}
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">{user.name || "N/A"}</td>
                                        <td className="p-4 text-gray-600">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                                ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                    user.role === 'STAFF' ? 'bg-green-100 text-green-700' :
                                                        user.role === 'PHARMACIST' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-blue-50 text-blue-700'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            {format.dateTime(new Date(user.createdAt), {
                                                year: 'numeric',
                                                month: 'numeric',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button
                                                onClick={() => openModal(user)}
                                                className="text-blue-500 hover:bg-blue-50 p-2 rounded transition-colors"
                                                title={t('edit')}
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
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-bold">{isEditing ? t('edit_user') : t('add_user')}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.name')}</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.email')}</label>
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
                                    {t('form.password')} {isEditing && <span className="text-xs text-gray-500">({t('leave_blank')})</span>}
                                </label>
                                <input
                                    type="password"
                                    required={!isEditing}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.role')}</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                                >
                                    <option value="PATIENT">Patient</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="STAFF">Staff</option>
                                    <option value="PHARMACIST">Pharmacist</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.phone')}</label>
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
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                                >
                                    {loading ? t('saving') : t('save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
