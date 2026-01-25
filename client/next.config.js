/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: false,
        formats: ['image/avif', 'image/webp'],
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