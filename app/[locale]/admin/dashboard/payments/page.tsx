import { getAdminPayments, getDailyStats } from "@/app/actions/payment";
import PaymentsClient from "./PaymentsClient";

export default async function PaymentsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { page: pageRaw, status: statusRaw } = await searchParams;

    const page = typeof pageRaw === 'string' ? parseInt(pageRaw) : 1;
    const status = typeof statusRaw === 'string' ? statusRaw : undefined;

    const { data: payments, pagination } = await getAdminPayments(page, status);
    const statsResult = await getDailyStats();

    return (
        <PaymentsClient
            initialPayments={payments || []}
            initialTotal={pagination?.totalRecords || 0}
            initialPage={page}
            status={status}
            dailyStats={statsResult.success && statsResult.dailyStats ? statsResult.dailyStats : []}
            today={statsResult.success && statsResult.today ? statsResult.today : { total: 0, count: 0 }}
            totalLast30Days={statsResult.success && statsResult.totalLast30Days !== undefined ? statsResult.totalLast30Days : 0}
        />
    );
}
