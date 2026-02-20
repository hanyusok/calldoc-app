import { getDoctors, getClinicsForSelect } from "@/app/actions/doctor";
import DoctorsClient from "./DoctorsClient";
import PageContainer from "@/components/admin/shared/PageContainer";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function DoctorsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string, search?: string }>
}) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const search = params?.search || "";

    const { doctors, total } = await getDoctors(page, 10, search);
    const clinics = await getClinicsForSelect();
    const messages = await getMessages();

    return (
        <PageContainer>
            <NextIntlClientProvider messages={messages}>
                <DoctorsClient
                    initialDoctors={doctors}
                    initialTotal={total}
                    initialPage={page}
                    clinics={clinics}
                />
            </NextIntlClientProvider>
        </PageContainer>
    );
}
