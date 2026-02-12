import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNavbar />
            <div className="pt-16">
                {children}
            </div>
        </div>
    );
}
