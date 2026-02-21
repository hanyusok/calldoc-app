import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import "../globals.css";

export const metadata: Metadata = {
    title: "콜닥-마트의원",
    description: "Your health, our priority.",
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
            </body>
        </html>
    );
}
