/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ['pdf-parse'],
    async headers() {
        return [];
    },
}

export default nextConfig;