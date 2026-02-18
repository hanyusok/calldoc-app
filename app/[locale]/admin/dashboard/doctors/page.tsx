import { getDoctors, getClinicsForSelect } from "@/app/actions/doctor";
import DoctorsClient from "./DoctorsClient";
import PageContainer from "@/components/admin/shared/PageContainer";

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

    return (
        <PageContainer>
            <DoctorsClient
                initialDoctors={doctors}
                initialTotal={total}
                initialPage={page}
                clinics={clinics}
            />
        </PageContainer>
    );
}
