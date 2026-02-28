"use client";

import { useState, useEffect } from "react";
import { getPharmacies } from "@/app/actions/pharmacy";
// cleaned up imports
// Re-importing correctly based on previous steps
import { requestPrescription as requestRx, issuePrescription as issueRx } from "@/app/actions/prescription";
import { sendFax as sendFaxAction } from "@/app/actions/fax";
import { Loader2, FileText, Send, Printer } from "lucide-react";
import { useTranslations } from "next-intl";

type Pharmacy = {
    id: string;
    name: string;
    fax: string | null;
    faxLocked: boolean;
    faxVerified: boolean;
    address: string | null;
    phone: string | null;
    createdAt: Date;
    updatedAt: Date;
    isDefault: boolean;
    latitude: number;
    longitude: number;
    atFront: boolean;
};

export default function PrescriptionManager({
    appointmentId,
    prescription,
    userPharmacy,
    favoritePharmacies = []
}: {
    appointmentId: string;
    prescription?: any;
    userPharmacy?: Pharmacy | null;
    favoritePharmacies?: Pharmacy[];
}) {
    const t = useTranslations('Admin.prescription_manager');
    const [step, setStep] = useState<'SELECT' | 'UPLOAD' | 'FAX' | 'HANDED_OVER'>(prescription ? 'UPLOAD' : 'SELECT');
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(
        // Default to the user's primary pharmacy, or their first favorite if there's no primary
        userPharmacy || (favoritePharmacies.length > 0 ? favoritePharmacies[0] : null)
    );
    const [loading, setLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // For Upload
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (!prescription) {
            loadPharmacies();
        } else if (prescription.status === 'ISSUED') {
            setStep('FAX');
        }
        // If there's an existing HANDED_OVER status in DB, we'd handle it here. 
        // For now this demo treats ISSUED -> FAX or HANDED_OVER locally.
    }, [prescription]);

    const loadPharmacies = async () => {
        const res = await getPharmacies(1, 100); // Load enough for demo
        let list = res.pharmacies;

        // Group the user's special pharmacies to ensure they're in the list
        const priorityPharmacies: Pharmacy[] = [];
        if (userPharmacy && !priorityPharmacies.find(p => p.id === userPharmacy.id)) priorityPharmacies.push(userPharmacy);
        favoritePharmacies.forEach(fav => {
            if (!priorityPharmacies.find(p => p.id === fav.id)) priorityPharmacies.push(fav);
        });

        // Ensure user's primary/favorites are in the list if they aren't already fetched
        priorityPharmacies.forEach(p => {
            if (!list.find(lp => lp.id === p.id)) {
                list.unshift(p);
            }
        });

        setPharmacies(list);
    };

    const handleRequest = async () => {
        if (!selectedPharmacy) return;
        setLoading(true);
        try {
            await requestRx(appointmentId, {
                name: selectedPharmacy.name,
                fax: selectedPharmacy.fax || undefined,
                address: selectedPharmacy.address || undefined
            });
            setStep('UPLOAD');
        } catch (e) {
            alert("Failed to request prescription");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        // In a real app, upload file to S3/Blob storage first. 
        // Here we simulate it or just use a placeholder URL if no real upload logic exists yet.
        // But sendFax expects an actual file, so we might need a different flow.
        // For 'issuePrescription', we usually save the URL.

        // Simulating upload
        setLoading(true);
        try {
            // Mock URL
            const mockUrl = `https://example.com/rx/${appointmentId}.pdf`;
            await issueRx(prescription?.id || "", mockUrl); // We might need to refresh prescription ID if it was just created
            setStep('FAX');

            // To make "Send Fax" work immediately with the file, we might pass the file to the next step
        } catch (e) {
            alert("Failed to issue prescription");
        } finally {
            setLoading(false);
        }
    };

    const handleHandOver = async () => {
        setLoading(true);
        try {
            // Issuing prescription logically bypasses fax routing
            const mockUrl = `https://example.com/rx/${appointmentId}-handover.pdf`;
            await issueRx(prescription?.id || "", mockUrl);
            setStep('HANDED_OVER');
            setDropdownOpen(false);
        } catch (e) {
            alert("Failed to issue prescription (hand-over)");
        } finally {
            setLoading(false);
        }
    };

    const handleSendFax = async () => {
        if (!file && !prescription?.fileUrl) {
            alert("No prescription file found");
            return;
        }

        // If we have a file object (from upload step), use it. 
        // If we only have URL, we can't easily upload to FTP without downloading it first.
        // For this demo, let's assume we are in the flow and still have the file, or require re-upload.
        if (!file) {
            alert("Please select the file to fax again");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("prescriptionId", prescription?.id);

        try {
            const res = await sendFaxAction(formData);
            if (res.success) {
                alert("Fax sent successfully!");
            } else {
                alert("Fax failed: " + res.error);
            }
        } catch (e) {
            alert("Error sending fax");
        } finally {
            setLoading(false);
        }
    };

    if (step === 'SELECT') {
        return (
            <div className="p-4 border rounded-lg bg-white shadow-sm mt-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText size={18} /> {t('select_pharmacy')}
                </h3>
                <select
                    className="w-full p-2 border rounded mb-2"
                    onChange={(e) => {
                        const p = pharmacies.find(ph => ph.id === e.target.value);
                        setSelectedPharmacy(p || null);
                    }}
                >
                    <option value="">{t('select_placeholder')}</option>
                    {pharmacies.map(p => {
                        const isPrimary = userPharmacy?.id === p.id;
                        const isFavorite = favoritePharmacies?.some(f => f.id === p.id);

                        let labelPrefix = '';
                        if (isPrimary) labelPrefix = '⭐ (Primary) ';
                        else if (isFavorite) labelPrefix = '⭐ (Favorite) ';

                        return (
                            <option key={p.id} value={p.id}>{labelPrefix}{p.name} {p.fax ? `(Fax: ${p.fax})` : ''}</option>
                        );
                    })}
                </select>
                <button
                    onClick={handleRequest}
                    disabled={!selectedPharmacy || loading}
                    className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
                >
                    {loading ? t('processing') : t('select_pharmacy')}
                </button>
            </div>
        );
    }

    if (step === 'HANDED_OVER') {
        return (
            <div className="p-4 border border-green-200 rounded-lg bg-green-50 shadow-sm mt-4 text-center">
                <h3 className="font-bold text-green-700">{t('hand_over_completed')}</h3>
            </div>
        );
    }

    if (step === 'UPLOAD') {
        return (
            <div className="p-4 border rounded-lg bg-white shadow-sm mt-4 relative">
                <h3 className="font-semibold mb-2">{t('upload_rx')}</h3>
                <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="mb-2"
                />
                <div className="flex">
                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-l disabled:opacity-50"
                    >
                        {loading ? t('issuing') : t('issue_ready')}
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            disabled={!file || loading}
                            className="bg-green-600 hover:bg-green-700 text-white px-2 py-2 rounded-r border-l border-green-700 disabled:opacity-50 h-full flex items-center"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        {dropdownOpen && !loading && file && (
                            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded shadow-md z-10">
                                <button
                                    onClick={handleHandOver}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                                >
                                    {t('hand_over')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 border rounded-lg bg-white shadow-sm mt-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Printer size={18} /> {t('send_fax')}
            </h3>
            <p className="text-sm mb-2">{t('pharmacy_label')}: {prescription?.pharmacyName}</p>
            <p className="text-sm mb-4">{t('fax_label')}: {prescription?.pharmacyFax}</p>

            {!file && (
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="mb-2 block text-sm"
                />
            )}

            <button
                onClick={handleSendFax}
                disabled={!file || loading}
                className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                {t('send_via_barobill')}
            </button>
        </div>
    );
}
