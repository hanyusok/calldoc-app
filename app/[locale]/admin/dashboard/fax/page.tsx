import { useTranslations } from 'next-intl';
import { getSettings } from '@/app/actions/settings';
import FaxForm from '@/components/admin/fax/FaxForm';
import PageContainer from '@/components/admin/shared/PageContainer';
import PageHeader from '@/components/admin/shared/PageHeader';

export default async function FaxManagerPage() {
    const settings = await getSettings();
    const pdfPath = (settings as any).prescriptionPdfPath || "";

    return (
        <PageContainer>
            <PageHeader
                title="Fax Manager"
                description="Manually send fax documents to pharmacies or other recipients."
            />
            <FaxForm defaultPdfPath={pdfPath} />
        </PageContainer>
    );
}
