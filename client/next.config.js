/** @type {import('next').NextConfig} */
const nextConfig = {
    // Cloudflare Pages compatibility
    poweredByHeader: false,
    compress: true,
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: false,
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            { protocol: 'https', hostname: '**.supabase.co' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: '**.githubusercontent.com' }
        ]
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.resolve.alias = {
                ...config.resolve.alias,
                '@': require('path').resolve(__dirname, 'src'),
                'async_hooks': false,
            };
            config.resolve.fallback = {
                ...config.resolve.fallback,
                async_hooks: false,
                fs: false,
                net: false,
                tls: false,
            };
        }
        return config;
    },
};

module.exports = nextConfig;