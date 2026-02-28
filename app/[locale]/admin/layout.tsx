import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { auth } from "@/auth";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const role = session?.user?.role;
    return (
        <AdminLayoutClient role={role as string}>
            {children}
        </AdminLayoutClient>
    );
}
