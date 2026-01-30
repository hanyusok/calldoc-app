import Kakao from "next-auth/providers/kakao"
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    providers: [
        Kakao({
            clientId: process.env.KAKAO_CLIENT_ID,
            clientSecret: process.env.KAKAO_CLIENT_SECRET,
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/profile');
            if (isOnDashboard) {
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
