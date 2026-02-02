import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/app/lib/prisma"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" }, // Middleware auth often works better with JWT or we keep database but separate the middleware config.
    // Actually, for Edge compatibility, middleware should use authConfig.
    // auth.ts uses the adapter.
    ...authConfig,
    providers: [
        ...authConfig.providers,
        Credentials({
            name: "Guest",
            credentials: {
                action: { label: "Action", type: "text" }
            },
            async authorize(credentials) {
                if (credentials?.action === "guest") {
                    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
                    const email = `guest-${uniqueSuffix}@calldoc.com`;

                    // Create Unique Guest User
                    const user = await prisma.user.create({
                        data: {
                            email,
                            name: `Guest User ${uniqueSuffix.slice(-4)}`,
                            emailVerified: new Date(),
                            phoneNumber: "000-0000-0000",
                            residentNumber: "000000-0000000",
                        }
                    });
                    return user;
                }
                return null;
            }
        })
    ],
    trustHost: true,
    callbacks: {
        ...authConfig.callbacks,
        // Override session to include user ID from database if strategy is "database" (default with adapter)
        // But if we use Middleware, we might be forced to JWT or use database strategy only in non-edge.
        // Let's stick to the default strategy (database) for auth.ts and see if we can just re-use.
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
            }
            return session;
        }
    }
})
