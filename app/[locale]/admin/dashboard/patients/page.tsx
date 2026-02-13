import { getUsers } from "@/app/actions/user";
import PatientsClient from "./PatientsClient";

export default async function PatientsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string, search?: string }>
}) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const search = params?.search || "";

    const { users, total } = await getUsers(page, 10, search, 'PATIENT');

    return <PatientsClient initialUsers={users} initialTotal={total} initialPage={page} />;
}
