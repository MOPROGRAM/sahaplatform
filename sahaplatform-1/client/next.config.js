/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        // turbopack: {
        //     root: __dirname
        // }
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
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            '@': require('path').resolve(__dirname, 'src'),
        };
        return config;
    },
};

module.exports = nextConfig;