import { useTranslations } from 'next-intl'; // We might need to add keys or just use hardcoded title for now if keys missing
import FaxForm from '@/components/admin/fax/FaxForm';
import PageContainer from '@/components/admin/shared/PageContainer';
import PageHeader from '@/components/admin/shared/PageHeader';

export default function FaxManagerPage() {
    const t = useTranslations('Admin.fax');

    return (
        <PageContainer>
            <PageHeader
                title={t('title')}
                description={t('description')}
            />
            <FaxForm />
        </PageContainer>
    );
}
