import { getAdminPayments } from "@/app/actions/payment-admin";
import PaymentsClient from "./PaymentsClient";

export default async function PaymentsPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
    const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;

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
