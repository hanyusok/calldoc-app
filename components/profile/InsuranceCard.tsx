'use client';

import React, { useState } from 'react';
import { Shield, Plus, Edit2, Trash2 } from 'lucide-react';

interface InsuranceProps {
    insurance: {
        id?: string;
        provider: string;
        policyNumber: string;
    } | null;
    onUpdate: (data: any) => Promise<void>;
    onDelete: () => Promise<void>;
}

export default function InsuranceCard({ insurance, onUpdate, onDelete }: InsuranceProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        provider: insurance?.provider || '',
        policyNumber: insurance?.policyNumber || '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onUpdate(formData);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update insurance", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to remove this insurance?')) return;
        setLoading(true);
        try {
            await onDelete();
            setFormData({ provider: '', policyNumber: '' });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!insurance && !isEditing) {
        return (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                        <Shield size={20} className="text-primary-500" />
                        Insurance
                    </h3>
                </div>
                <button
                    onClick={() => setIsEditing(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-primary-300 hover:text-primary-500 hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={20} />
                    Add Insurance
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                    <Shield size={20} className="text-primary-500" />
                    Insurance
                </h3>
                {!isEditing && insurance && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-1 text-gray-400 hover:text-primary-600"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-1 text-gray-400 hover:text-red-600"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Provider Name</label>
                        <input
                            type="text"
                            value={formData.provider}
                            onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                            className="w-full p-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-100"
                            placeholder="e.g. Samsung Fire & Marine"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Policy Number</label>
                        <input
                            type="text"
                            value={formData.policyNumber}
                            onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                            className="w-full p-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-100"
                            placeholder="Policy Number"
                            required
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
                            className="flex-1 py-2 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Insurance'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-wider text-blue-500 font-semibold">Provider</span>
                        <span className="font-bold text-blue-900 text-lg">{insurance?.provider}</span>
                    </div>
                    <div className="mt-4 flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-wider text-blue-500 font-semibold">Policy No.</span>
                        <span className="font-mono text-blue-800">{insurance?.policyNumber}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
