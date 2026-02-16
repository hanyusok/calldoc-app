import { getAppointments } from '@/app/actions/appointment';
import { getVaccinationReservations } from '@/app/actions/vaccination-booking';
import AppointmentsClient from './AppointmentsClient';
import PageContainer from '@/components/admin/shared/PageContainer';

export default async function AppointmentsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string, q?: string, status?: string, tab?: string }>
}) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const search = params?.q || "";
    const status = params?.status || "ALL";
    const tab = params?.tab || "consultations";

    const [consultData, vacData] = await Promise.all([
        getAppointments(search, status, page, 10),
        getVaccinationReservations(search, status, page, 10)
    ]);

    return (
        <PageContainer>
            <AppointmentsClient
                initialAppointments={consultData.appointments}
                initialTotal={consultData.total}
                initialVacReservations={vacData.reservations}
                initialVacTotal={vacData.total}
                initialPage={page}
                search={search}
                status={status}
                initialTab={tab}
            />
        </PageContainer>
    );
}
