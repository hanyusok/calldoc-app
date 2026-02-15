import { getDoctors } from "@/app/actions/doctor";
import DoctorsClient from "./DoctorsClient";

export default async function DoctorsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string, search?: string }>
}) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const search = params?.search || "";

    const { doctors, total } = await getDoctors(page, 10, search);

    return <DoctorsClient initialDoctors={doctors} initialTotal={total} initialPage={page} />;
}
