
export default function MobileLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="max-w-md mx-auto min-h-screen bg-white shadow-xl overflow-hidden relative">
            {children}
        </main>
    );
}
