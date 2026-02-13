"use client";

import { useState } from "react";
import { createMeeting } from "@/app/actions/meet"; // Ensure this action is linked
import { Loader2, Video } from "lucide-react";
import { useTranslations } from "next-intl";

export default function MeetManager({
    appointmentId,
    patientName,
    startDateTime,
    endDateTime,
    onSuccess
}: {
    appointmentId: string,
    patientName: string,
    startDateTime: Date,
    endDateTime: Date,
    onSuccess?: (link: string) => void
}) {
    const t = useTranslations('Admin.meet');
    const [loading, setLoading] = useState(false);
    const [link, setLink] = useState("");

    const handleCreateMeet = async () => {
        setLoading(true);
        try {
            const result = await createMeeting({
                appointmentId,
                patientName,
                startDateTime: new Date(startDateTime),
                endDateTime: new Date(endDateTime)
            });

            if (result) {
                setLink(result);
                if (onSuccess) onSuccess(result);
                // Ideally update appointment in DB here or via parent
                alert(t('link_created'));
            } else {
                alert(t('error_create'));
            }
        } catch (error) {
            console.error(error);
            alert(t('error_create'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-white shadow-sm">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Video size={18} />
                {t('title')}
            </h3>

            {!link ? (
                <button
                    onClick={handleCreateMeet}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {loading && <Loader2 className="animate-spin" size={14} />}
                    {t('generate_link')}
                </button>
            ) : (
                <div className="flex flex-col gap-2">
                    <p className="text-sm text-green-600 font-medium">{t('link_created')}</p>
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm break-all">
                        {link}
                    </a>
                    {/* Optional: Copy button */}
                </div>
            )}
        </div>
    );
}
