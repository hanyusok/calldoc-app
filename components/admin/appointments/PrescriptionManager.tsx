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
    address: string | null;
    phone: string | null;
    createdAt: Date;
    updatedAt: Date;
    isDefault: boolean;
};

export default function PrescriptionManager({
    appointmentId,
    prescription,
    userPharmacy
}: {
    appointmentId: string;
    prescription?: any;
    userPharmacy?: Pharmacy | null;
}) {
    const t = useTranslations('Admin.prescription_manager');
    const [step, setStep] = useState<'SELECT' | 'UPLOAD' | 'FAX'>(prescription ? 'UPLOAD' : 'SELECT');
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(userPharmacy || null);
    const [loading, setLoading] = useState(false);

    // For Upload
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (!prescription) {
            loadPharmacies();
        } else if (prescription.status === 'ISSUED') {
            setStep('FAX');
        }
    }, [prescription]);

    const loadPharmacies = async () => {
        const res = await getPharmacies(1, 100); // Load enough for demo
        let list = res.pharmacies;

        // Ensure user's pharmacy is in the list if it exists
        if (userPharmacy && !list.find(p => p.id === userPharmacy.id)) {
            list = [userPharmacy, ...list];
        }

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
                    {pharmacies.map(p => (
                        <option key={p.id} value={p.id}>{p.name} {p.fax ? `(Fax: ${p.fax})` : ''}</option>
                    ))}
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

    if (step === 'UPLOAD') {
        return (
            <div className="p-4 border rounded-lg bg-white shadow-sm mt-4">
                <h3 className="font-semibold mb-2">{t('upload_rx')}</h3>
                <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="mb-2"
                />
                {/* Note: This button effectively "Issues" it */}
                <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    {loading ? t('issuing') : t('issue_ready')}
                </button>
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
