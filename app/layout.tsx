import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "CallDoc - Telemedicine",
    description: "Your health, our priority.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased bg-gray-50 text-gray-900 pb-20">
                {children}
            </body>
        </html>
    );
}
