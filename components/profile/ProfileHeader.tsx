'use client';

import React, { useState } from 'react';
import { Edit2, Check, X, LogOut } from 'lucide-react';
import { logout } from '@/app/(mobile)/profile/actions';

interface ProfileHeaderProps {
    user: {
        name?: string | null;
        email?: string | null;
    };
    onUpdateName: (name: string) => Promise<void>;
}

export default function ProfileHeader({ user, onUpdateName }: ProfileHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.name || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) return;
        setLoading(true);
        try {
            await onUpdateName(name);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update name", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-primary-600 px-6 pt-6 pb-12 rounded-b-[2rem] shadow-lg mb-[-2rem]">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-2xl font-bold backdrop-blur-sm">
                    {name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-white/10 border border-white/30 rounded px-2 py-1 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white w-full max-w-[200px]"
                                placeholder="Enter name"
                                autoFocus
                            />
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 text-white transition-colors"
                            >
                                <Check size={16} />
                            </button>
                            <button
                                onClick={() => {
                                    setName(user.name || '');
                                    setIsEditing(false);
                                }}
                                className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-white">{user.name}</h1>
                            <button
                                onClick={() => {
                                    setName(user.name || '');
                                    setIsEditing(true);
                                }}
                                className="p-1.5 rounded-full text-white/70 hover:bg-white/20 hover:text-white transition-all"
                                aria-label="Edit name"
                            >
                                <Edit2 size={14} />
                            </button>
                        </div>
                    )}
                    <p className="text-primary-100 text-sm">{user.email}</p>
                </div>
                <button
                    onClick={() => logout()}
                    className="p-2 bg-white/20 rounded-full hover:bg-white/30 text-white transition-colors"
                    aria-label="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </div>
    );
}
