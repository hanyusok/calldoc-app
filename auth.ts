import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import Naver from "@/lib/providers/naver"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/app/lib/prisma"
import { authConfig } from "./auth.config"
import { z } from "zod"
import bcrypt from "bcryptjs"

export const config = {
    adapter: PrismaAdapter(prisma),
    // Actually, for Edge compatibility, middleware should use authConfig.
    // auth.ts uses the adapter.
    ...authConfig,
    secret: process.env.AUTH_SECRET,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Naver({
            clientId: process.env.NAVER_CLIENT_ID!,
            clientSecret: process.env.NAVER_CLIENT_SECRET!,
        }),
        ...authConfig.providers,
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await prisma.user.findUnique({ where: { email } });
                    if (!user) return null;

                    // Allow users created without password (social login) to potentially set one or just fail?
                    // For now, if no password, return null (or maybe they should login with provider)
                    if (!user.password) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) return user;
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
        Credentials({
            id: 'guest',
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
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.sub = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
            }
            if (session.user && token.role) {
                session.user.role = token.role;
            }
            return session;
        }
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)
