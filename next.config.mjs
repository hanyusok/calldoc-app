import createNextIntlPlugin from 'next-intl/plugin';
import { withSerwist } from "@serwist/turbopack";

const withNextIntl = createNextIntlPlugin(
    './i18n/request.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
    }
};

export default withSerwist(withNextIntl(nextConfig));
