"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
    title: string;
    text?: string;
    url?: string;
    variant?: "icon" | "card"; // icon = header button, card = bottom card button
}

export default function ShareButton({ title, text, url, variant = "card" }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");

    const handleShare = async () => {
        // Use native Web Share API if available (mobile browsers, PWA)
        if (typeof navigator !== "undefined" && navigator.share) {
            try {
                await navigator.share({ title, text: text ?? title, url: shareUrl });
                return;
            } catch (err) {
                // User cancelled — ignore
                if ((err as Error).name === "AbortError") return;
            }
        }

        // Fallback: copy URL to clipboard
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Last resort: prompt
            window.prompt("링크를 복사하세요:", shareUrl);
        }
    };

    if (variant === "icon") {
        return (
            <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                aria-label="공유하기"
            >
                {copied ? <Check size={20} className="text-green-500" /> : <Share2 size={20} />}
            </button>
        );
    }

    return (
        <button
            onClick={handleShare}
            className="bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
            {copied ? (
                <>
                    <Check size={16} className="text-green-500" />
                    <span className="text-green-600">링크 복사됨!</span>
                </>
            ) : (
                <>
                    <Share2 size={16} />
                    공유하기
                </>
            )}
        </button>
    );
}
