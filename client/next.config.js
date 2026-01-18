/** @type {import('next').NextConfig} */
module.exports = async () => {
    if (process.env.NODE_ENV === 'development') {
        const { setupDevPlatform } = require('@cloudflare/next-on-pages/next-dev');
        await setupDevPlatform();
    }

    return {
        images: {
            unoptimized: true,
        },
        webpack: (config) => {
            config.resolve.alias = {
                ...config.resolve.alias,
                '@': require('path').resolve(__dirname, 'src'),
            };
            return config;
        },
    };
};