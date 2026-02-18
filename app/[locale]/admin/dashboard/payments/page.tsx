import { getAdminPayments } from "@/app/actions/payment";
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

    return (
        <PaymentsClient
            initialPayments={payments || []}
            initialTotal={pagination?.totalRecords || 0}
            initialPage={page}
            status={status}
        />
    );
}
