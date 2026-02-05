import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default NextAuth(authConfig).auth((req) => {
    return intlMiddleware(req);
});

export const config = {
    // Match only internationalized pathnames
    // skip internal paths
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
