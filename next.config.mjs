import createNextIntlPlugin from 'next-intl/plugin';
import { withSerwist } from "@serwist/turbopack";

const withNextIntl = createNextIntlPlugin(
    './i18n/request.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
    },
    async rewrites() {
        return [
            {
                source: '/images/posts/:path*',
                destination: '/api/images/posts/:path*'
            }
        ];
    }
};

export default withSerwist(withNextIntl(nextConfig));
