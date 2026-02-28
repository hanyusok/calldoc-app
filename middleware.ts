import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
const authMiddleware = NextAuth(authConfig).auth;

export default authMiddleware((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const pathname = nextUrl.pathname;

    // Matches the same logic as auth.config.ts but explicit here for safety
    const matchesPath = (base: string) =>
        pathname === `/${base}` ||
        pathname.startsWith(`/${base}/`) ||
        routing.locales.some(locale =>
            pathname === `/${locale}/${base}` ||
            pathname.startsWith(`/${locale}/${base}/`)
        );

    const isProtectedRoute =
        matchesPath('profile') ||
        matchesPath('dashboard') ||
        matchesPath('myappointment') ||
        matchesPath('admin/dashboard');

    if (isProtectedRoute && !isLoggedIn) {
        const locale = routing.locales.find(l => pathname.startsWith(`/${l}`)) || routing.defaultLocale;
        const loginUrl = new URL(`/${locale}/login`, nextUrl.origin);
        // Important: preserve original destination for redirect after login
        loginUrl.searchParams.set('callbackUrl', nextUrl.href);
        return Response.redirect(loginUrl);
    }

    return intlMiddleware(req);
});

export const config = {
    // Match only internationalized pathnames
    // skip internal paths and static files
    matcher: ["/((?!api|_next/static|_next/image|images|icons|favicon.ico|sw.js|manifest.json).*)"],
}
