import { auth } from "@/auth";
import { redirect } from "@/i18n/routing";

export default async function AuthCallbackPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const session = await auth();

    if (!session?.user) {
        redirect({ href: '/login', locale });
    }

    // Redirect based on role
    if (session?.user?.role === 'ADMIN') {
        redirect({ href: '/admin/dashboard', locale });
    } else {
        redirect({ href: '/profile', locale });
    }

    return null;
}
