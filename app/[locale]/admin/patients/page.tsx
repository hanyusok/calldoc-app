import { getUsers } from "@/app/actions/user";
import PatientsClient from "./PatientsClient";

export default async function PatientsPage({
    searchParams,
}: {
    searchParams: { page?: string, search?: string }
}) {
    const page = Number(searchParams.page) || 1;
    const search = searchParams.search || "";

    const { users, total } = await getUsers(page, 10, search);

    return <PatientsClient initialUsers={users} initialTotal={total} initialPage={page} />;
}
