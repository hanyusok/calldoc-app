import NotificationWatcher from "@/components/dashboard/NotificationWatcher";

export default async function MobileLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    // No-op await for hydration/auth context if needed

    return (
        <main className="max-w-md mx-auto min-h-screen bg-white shadow-xl overflow-hidden relative">
            <NotificationWatcher />
            {children}
        </main>
    );
}
