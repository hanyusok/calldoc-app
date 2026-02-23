import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default NextAuth(authConfig).auth((req) => {
    // console.log('Middleware Auth:', req.auth); // DEBUG (req.auth is the session)
    return intlMiddleware(req);
});

export const config = {
    // Match only internationalized pathnames
    // skip internal paths and static files
    matcher: ["/((?!api|_next/static|_next/image|images|icons|favicon.ico|sw.js|manifest.json).*)"],
}
