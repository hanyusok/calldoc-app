"use client";

import { useState, useRef, useTransition } from "react";
import { Printer, Pencil, Check, X, Lock, BadgeCheck } from "lucide-react";
import { updatePharmacyFax } from "@/app/actions/pharmacy";

interface EditableFaxProps {
    pharmacyId: string;
    initialFax: string | null;
    faxLocked?: boolean;
    faxVerified?: boolean;
}

export default function EditableFax({ pharmacyId, initialFax, faxLocked = false, faxVerified = false }: EditableFaxProps) {
    const [fax, setFax] = useState(initialFax || "직접 전화 문의");
    const [editing, setEditing] = useState(false);
    const [inputValue, setInputValue] = useState(fax);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleEdit = () => {
        if (faxLocked) return;
        setInputValue(fax);
        setEditing(true);
        setError(null);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const handleCancel = () => {
        setEditing(false);
        setError(null);
    };

    const handleSave = () => {
        if (!inputValue.trim()) {
            setError("팩스 번호를 입력하세요");
            return;
        }
        startTransition(async () => {
            const result = await updatePharmacyFax(pharmacyId, inputValue);
            if (result.error) {
                setError(result.error);
            } else {
                setFax(inputValue.trim());
                setEditing(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") handleCancel();
    };

    if (editing) {
        return (
            <div className="flex flex-col gap-1 mt-1">
                <div className="flex items-center gap-1">
                    <Printer size={14} className="text-gray-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="예: 031-123-4567"
                        className="text-xs border border-primary-300 rounded-lg px-2 py-0.5 w-36 focus:outline-none focus:ring-2 focus:ring-primary-300"
                    />
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="p-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        <Check size={12} />
                    </button>
                    <button
                        onClick={handleCancel}
                        className="p-1 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <X size={12} />
                    </button>
                </div>
                {error && <p className="text-xs text-red-500 pl-5">{error}</p>}
            </div>
        );
    }

    // Locked: show lock icon, no edit cursor
    if (faxLocked) {
        return (
            <span className="flex items-center gap-1 text-sm">
                <Printer size={14} className="text-gray-400 shrink-0" />
                <span className={faxVerified ? "text-green-600 font-semibold" : "text-gray-500"}>{fax}</span>
                {faxVerified && <BadgeCheck size={14} className="text-green-500 shrink-0" aria-label="관리자 확인 완료" />}
                <Lock size={11} className="text-gray-300 shrink-0 ml-0.5" aria-label="관리자에 의해 잠김" />
            </span>
        );
    }

    // Editable: show pencil hint on hover
    return (
        <button
            onClick={handleEdit}
            title="클릭하여 팩스 번호 수정"
            className="flex items-center gap-1 text-sm hover:text-primary-600 group transition-colors"
        >
            <Printer size={14} className="text-gray-400 shrink-0" />
            <span className={
                saved ? "text-green-600 font-semibold" :
                    faxVerified ? "text-green-600 font-semibold" :
                        "text-gray-500"
            }>
                {fax}
            </span>
            {faxVerified && <BadgeCheck size={14} className="text-green-500 shrink-0" aria-label="관리자 확인 완료" />}
            <Pencil size={11} className="text-gray-300 group-hover:text-primary-400 transition-colors ml-0.5" />
        </button>
    );
}
