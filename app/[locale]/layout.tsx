import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import "../globals.css";

export const metadata: Metadata = {
    title: "콜닥-마트의원",
    description: "Your health, our priority.",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "콜닥",
    },
    icons: {
        apple: "/icons/icon-192x192.png",
    }
};

export const viewport: Viewport = {
    themeColor: "#3b82f6",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default async function RootLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    // Ensure that the incoming `locale` is valid
    const { locale } = await params;
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    return (
        <html lang={locale}>
            <body className="antialiased bg-gray-50 text-gray-900 pb-20">
                <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Seoul">
                    {children}
                </NextIntlClientProvider>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        if ('serviceWorker' in navigator) {
                            window.addEventListener('load', function() {
                                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                                }, function(err) {
                                    console.log('ServiceWorker registration failed: ', err);
                                });
                            });
                        }
                        `,
                    }}
                />
            </body>
        </html>
    );
}
