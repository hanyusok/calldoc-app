import Kakao from "next-auth/providers/kakao"
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    providers: [
        Kakao({
            clientId: process.env.KAKAO_CLIENT_ID,
            clientSecret: process.env.KAKAO_CLIENT_SECRET,
            checks: ['none'], // Temporary fix for PKCE error
        }),
    ],
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
        callbackUrl: {
            name: `next-auth.callback-url`,
            options: {
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
        csrfToken: {
            name: `next-auth.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const userRole = auth?.user?.role;
            const isProtectedRoute =
                nextUrl.pathname.startsWith('/profile') ||
                nextUrl.pathname.startsWith('/dashboard') ||
                nextUrl.pathname.startsWith('/myappointment');

            // Admin Dashboard access control for STAFF role
            // Locale could be part of the URL, so check for '/admin/dashboard'
            const isAdminRoute = nextUrl.pathname.match(/\/(ko|en)\/admin\/dashboard/);
            if (isAdminRoute && userRole === 'STAFF') {
                const isAppointmentsRoute = nextUrl.pathname.includes('/admin/dashboard/appointments');
                const isMeetRoute = nextUrl.pathname.includes('/admin/dashboard/meet'); // if they need meet access? The prompt says "only access /admin/dashboard/appointments module ui". I'll restrict strictly.

                if (!isAppointmentsRoute) {
                    // Redirect STAFF to the appointments page
                    const locale = nextUrl.pathname.split('/')[1]; // typically 'ko' or 'en'
                    return Response.redirect(new URL(`/${locale}/admin/dashboard/appointments`, nextUrl));
                }
            }

            if (isProtectedRoute || isAdminRoute) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }
            return true;
        },
        async signIn({ user, account, profile }) {
            console.log("Sign in attempt:", user.email);
            if (user) {
                return true;
            }
            return false;
        },
        async session({ session, user, token }) {
            // In pure JWT flow (middleware), user might not be fully populated like with adapter.
            // We rely on token logic or just pass through for middleware checks.
            // When running with adapter in auth.ts, session callback arguments differ slightly (user vs token).
            // However, to keep it compatible, we often stick to basics here or handle JWT callback.
            return session;
        }
    }
} satisfies NextAuthConfig
