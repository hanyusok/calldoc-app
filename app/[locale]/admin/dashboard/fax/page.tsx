import { getTranslations } from 'next-intl/server';
import { getSettings } from '@/app/actions/settings';
import FaxForm from '@/components/admin/fax/FaxForm';
import PageContainer from '@/components/admin/shared/PageContainer';
import PageHeader from '@/components/admin/shared/PageHeader';

export default async function FaxManagerPage() {
    const t = await getTranslations('Admin.fax');
    const settings = await getSettings();
    const pdfPath = (settings as any).prescriptionPdfPath || "";

    return (
        <PageContainer>
            <PageHeader
                title={t('title')}
                description={t('description')}
            />
            <FaxForm defaultPdfPath={pdfPath} />
        </PageContainer>
    );
}
