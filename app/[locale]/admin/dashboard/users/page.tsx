import { getUsers } from "@/app/actions/user";
import UsersClient from "./UsersClient";
import PageContainer from "@/components/admin/shared/PageContainer";
import { Role } from "@prisma/client";

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string, search?: string, role?: string }>
}) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const search = params?.search || "";
    const role = (params?.role as Role) || 'ALL';

    const { users, total } = await getUsers(page, 10, search, role);

    return (
        <PageContainer>
            <UsersClient initialUsers={users} initialTotal={total} initialPage={page} />
        </PageContainer>
    );
}
