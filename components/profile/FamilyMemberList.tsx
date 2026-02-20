'use client';

import React, { useState } from 'react';
import { Users, Plus, UserPlus, X, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FamilyMember {
    id: string;
    name: string;
    relation: string;
    age: number;
    gender: string;
    residentNumber?: string | null;
    phoneNumber?: string | null;
}

interface FamilyListProps {
    members: FamilyMember[];
    onAdd: (data: any) => Promise<void>;
    onRemove: (id: string) => Promise<void>;
    onUpdate: (data: any) => Promise<void>;
}

export default function FamilyMemberList({ members, onAdd, onRemove, onUpdate }: FamilyListProps) {
    const t = useTranslations('Family');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        relation: 'child',
        age: '',
        gender: 'male',
        residentNumber: '',
        phoneNumber: ''
    });
    const [loading, setLoading] = useState(false);

    // ... (calculateAgeAndGender and handleRINChange functions remain same)

    const calculateAgeAndGender = (rin: string) => {
        const cleanRin = rin.replace(/-/g, '');
        if (cleanRin.length < 7) return null;

        const birthYearPrefix = cleanRin.substring(0, 2);
        const genderDigit = cleanRin.substring(6, 7);

        let birthYear = 0;
        let gender = '';

        if (['1', '2'].includes(genderDigit)) {
            birthYear = 1900 + parseInt(birthYearPrefix);
        } else if (['3', '4'].includes(genderDigit)) {
            birthYear = 2000 + parseInt(birthYearPrefix);
        } else {
            return null;
        }

        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;

        if (['1', '3'].includes(genderDigit)) {
            gender = 'male';
        } else if (['2', '4'].includes(genderDigit)) {
            gender = 'female';
        }

        return { age, gender };
    };

    const handleRINChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^0-9]/g, '');

        if (val.length > 13) val = val.substring(0, 13);

        let formattedVal = val;
        if (val.length > 6) {
            formattedVal = `${val.substring(0, 6)}-${val.substring(6)}`;
        }

        const newState = { ...formData, residentNumber: formattedVal };

        const calc = calculateAgeAndGender(formattedVal);
        if (calc) {
            newState.age = calc.age.toString();
            newState.gender = calc.gender;
        } else if (val.length < 7) {
            newState.age = '';
            // Don't reset gender if user manually selected it? 
            // Actually, enable manual override if RIN is partial? 
            // Replicating behavior: clear if invalid
            newState.gender = 'male';
        }
        setFormData(newState);
    };

    const startEditing = (member: FamilyMember) => {
        setIsAdding(true);
        setEditingId(member.id);
        setFormData({
            name: member.name,
            relation: member.relation,
            age: member.age.toString(),
            gender: member.gender,
            residentNumber: member.residentNumber || '',
            phoneNumber: member.phoneNumber || ''
        });
    };

    const cancelEditing = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({ name: '', relation: 'child', age: '', gender: 'male', residentNumber: '', phoneNumber: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await onUpdate({
                    id: editingId,
                    ...formData,
                    age: parseInt(formData.age)
                });
            } else {
                await onAdd({
                    ...formData,
                    age: parseInt(formData.age)
                });
            }
            cancelEditing();
        } catch (error) {
            console.error("Failed to save family member", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                    <Users size={20} className="text-primary-500" />
                    {t('title')}
                </h3>
                <button
                    onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: '', relation: 'child', age: '', gender: 'male', residentNumber: '', phoneNumber: '' }); }}
                    className="p-1.5 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100"
                >
                    <Plus size={20} />
                </button>
            </div>

            {isAdding && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-semibold text-gray-700">
                            {editingId ? t('edit_member') : t('add_new')}
                        </h4>
                        <button onClick={cancelEditing} className="text-gray-400 hover:text-gray-600">
                            <X size={16} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <input
                            type="text"
                            placeholder={t('name_placeholder')}
                            className="w-full p-2 text-sm rounded-lg border border-gray-200"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder={t('rin_placeholder')}
                            className="w-full p-2 text-sm rounded-lg border border-gray-200"
                            value={formData.residentNumber}
                            onChange={handleRINChange}
                        />
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder={t('age_placeholder')}
                                className="w-1/3 p-2 text-sm rounded-lg border border-gray-200 bg-gray-50"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                required
                                readOnly
                            />
                            <select
                                className="w-2/3 p-2 text-sm rounded-lg border border-gray-200"
                                value={formData.relation}
                                onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                            >
                                <option value="child">{t('relation_child')}</option>
                                <option value="parent">{t('relation_parent')}</option>
                                <option value="spouse">{t('relation_spouse')}</option>
                                <option value="sibling">{t('relation_sibling')}</option>
                            </select>
                        </div>
                        <select
                            className="w-full p-2 text-sm rounded-lg border border-gray-200 bg-gray-50"
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            disabled
                        >
                            <option value="male">{t('gender_male')}</option>
                            <option value="female">{t('gender_female')}</option>
                        </select>
                        <input
                            type="tel"
                            placeholder={t('phone_placeholder')}
                            className="w-full p-2 text-sm rounded-lg border border-gray-200"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                        >
                            {loading ? (editingId ? t('saving') : t('adding')) : (editingId ? t('save') : t('add'))}
                        </button>
                    </form>
                </div>
            )}

            <div className="space-y-3">
                {members.length === 0 && !isAdding && (
                    <div className="text-center py-6 text-gray-400 text-sm">
                        {t('no_members')}
                    </div>
                )}
                {members.map((member) => (
                    <div key={member.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => startEditing(member)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                {member.name[0]}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800 text-sm">{member.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{t(`relation_${member.relation}` as any)} • {member.age} • {t(`gender_${member.gender}` as any)}</p>
                                {member.phoneNumber && <p className="text-xs text-gray-400">{member.phoneNumber}</p>}
                                {member.residentNumber && <p className="text-xs text-gray-400 tracking-wider">{member.residentNumber.substring(0, 8)}******</p>}
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onRemove(member.id); }}
                            className="text-gray-400 hover:text-red-500 p-2"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
