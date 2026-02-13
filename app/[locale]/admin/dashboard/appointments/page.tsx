import { getAppointments } from '@/app/actions/appointment';
import AppointmentsClient from './AppointmentsClient';

export default async function AppointmentsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string, q?: string, status?: string }>
}) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const search = params?.q || "";
    const status = params?.status || "ALL";

    const { appointments, total } = await getAppointments(search, status, page, 10);

    return (
        <div className="max-w-6xl mx-auto p-4">
            <AppointmentsClient
                initialAppointments={appointments}
                initialTotal={total}
                initialPage={page}
                search={search}
                status={status}
            />
        </div>
    );
}
