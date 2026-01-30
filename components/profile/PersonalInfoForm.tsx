'use client';

import React, { useState } from 'react';
import { User, Phone, Calendar, Save, CreditCard } from 'lucide-react';

interface PersonalInfoProps {
    user: {
        name?: string | null;
        email?: string | null;
        age?: number | null;
        gender?: string | null;
        phoneNumber?: string | null;
        residentNumber?: string | null;
    };
    onUpdate: (data: any) => Promise<void>;
}

export default function PersonalInfoForm({ user, onUpdate }: PersonalInfoProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        age: user.age || '',
        gender: user.gender || '',
        phoneNumber: user.phoneNumber || '',
        residentNumber: user.residentNumber || '',
    });
    const [loading, setLoading] = useState(false);

    const calculateAgeAndGender = (rin: string) => {
        // Simple regex for YYMMDD-XXXXXXX or just YYMMDDXXXXXXX
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
            return null; // Invalid or foreign
        }

        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear; // Korean age is usually +1, but let's stick to global age or just subtraction for now

        if (['1', '3'].includes(genderDigit)) {
            gender = 'male';
        } else if (['2', '4'].includes(genderDigit)) {
            gender = 'female';
        }

        return { age, gender };
    };

    const handleRINChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^0-9]/g, ''); // Remove non-digits

        if (val.length > 13) {
            val = val.substring(0, 13);
        }

        let formattedVal = val;
        if (val.length > 6) {
            formattedVal = `${val.substring(0, 6)}-${val.substring(6)}`;
        }

        const newState = { ...formData, residentNumber: formattedVal };

        const calc = calculateAgeAndGender(formattedVal);
        if (calc) {
            newState.age = calc.age;
            newState.gender = calc.gender;
        } else {
            // If RIN is invalid or incomplete (less than 7 chars for gender check), clear auto-calculated fields
            // keeping age/gender if we have at least 7 chars (YYMMDD-G...) even if incomplete total length
            // actually calculateAgeAndGender checks for length < 7 (raw), so it matches.
            if (val.length < 7) {
                newState.age = '';
                newState.gender = '';
            }
        }
        setFormData(newState);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onUpdate({
                age: formData.age ? parseInt(formData.age.toString()) : null,
                gender: formData.gender,
                phoneNumber: formData.phoneNumber,
                residentNumber: formData.residentNumber,
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                    <User size={20} className="text-primary-500" />
                    Personal Details
                </h3>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-primary-600 font-medium hover:text-primary-700"
                    >
                        Edit
                    </button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Residential ID Number (RIN)</label>
                        <input
                            type="text"
                            value={formData.residentNumber}
                            onChange={handleRINChange}
                            className="w-full p-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-100"
                            placeholder="YYMMDD-XXXXXXX"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Age and Gender will be auto-calculated.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Age</label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                className="w-full p-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-100 bg-gray-50"
                                placeholder="Age"
                                readOnly // Auto-calculated usually, but can enable if needed
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Gender</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className="w-full p-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-100 bg-gray-50"
                                disabled // Auto-calculated
                            >
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="w-full p-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-100"
                            placeholder="010-1234-5678"
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Save size={16} />
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <CreditCard size={16} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Residential ID</p>
                            <p className="font-medium text-gray-800 tracking-wider">
                                {user.residentNumber ? user.residentNumber.substring(0, 8) + '******' : 'Not set'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1 flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <span className="font-bold text-xs">{user.age || '-'}</span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Age</p>
                                <p className="font-medium text-gray-800">{user.age || '-'}</p>
                            </div>
                        </div>
                        <div className="flex-1 flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                <User size={16} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Gender</p>
                                <p className="font-medium text-gray-800 capitalize">{user.gender || '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <Phone size={16} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="font-medium text-gray-800">{user.phoneNumber || 'Not set'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
