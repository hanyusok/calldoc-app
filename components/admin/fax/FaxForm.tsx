"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { sendManualFax } from "@/app/actions/fax";
import { Loader2, Send, FileText, CheckCircle, AlertCircle } from "lucide-react";

export default function FaxForm() {
    const t = useTranslations('Admin.fax');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setResult(null);

        const file = formData.get("file") as File;
        if (file && file.size > 5 * 1024 * 1024) { // 5MB limit check
            setResult({ success: false, message: t('error_file_size') });
            setLoading(false);
            return;
        }

        try {
            const res = await sendManualFax(formData);
            if (res.success) {
                setResult({ success: true, message: t('success_message', { ref: res.result }) });
                formRef.current?.reset();
            } else {
                setResult({ success: false, message: res.error || t('error') });
            }
        } catch (e) {
            setResult({ success: false, message: t('error_generic') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-600" />
                {t('title')}
            </h2>

            <form ref={formRef} action={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('receiver_name')}</label>
                        <input
                            type="text"
                            name="receiverName"
                            required
                            placeholder={t('receiver_name_placeholder')}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('fax_number')}</label>
                        <input
                            type="text"
                            name="receiverFax"
                            required
                            placeholder={t('fax_number_placeholder')}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('document_label')}</label>
                    <div className="relative">
                        <input
                            type="file"
                            name="file"
                            required
                            accept=".pdf,.jpg,.jpeg,.png,.tif,.tiff"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-sm text-gray-500"
                        />
                        <FileText className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{t('supported_formats')}</p>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin h-5 w-5" />
                                {t('sending')}
                            </>
                        ) : (
                            <>
                                <Send className="h-5 w-5" />
                                {t('send_button')}
                            </>
                        )}
                    </button>
                </div>
            </form>

            {result && (
                <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {result.success ? <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
                    <div>
                        <p className="font-medium">{result.success ? t('success') : t('error')}</p>
                        <p className="text-sm opacity-90">{result.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
