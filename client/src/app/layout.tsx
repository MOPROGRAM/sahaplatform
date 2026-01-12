import type { Metadata } from "next";
import { Inter, Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const cairo = Cairo({
    subsets: ['arabic', 'latin'],
    variable: '--font-cairo',
    display: 'swap',
    weight: ['300', '400', '500', '600', '700'],
});

const tajawal = Tajawal({
    subsets: ['arabic', 'latin'],
    variable: '--font-tajawal',
    display: 'swap',
    weight: ['300', '400', '500', '700'],
});

export const metadata: Metadata = {
    title: "ساحة - بوابة الخليج العقارية والمهنية",
    description: "بوابة الخليج العقارية والمهنية - منصة شاملة للإعلانات والخدمات",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html className={`${inter.variable} ${cairo.variable} ${tajawal.variable}`}>
            <head>
                <script src="https://cdn.tailwindcss.com"></script>
                <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
                <style dangerouslySetInnerHTML={{
                    __html: `
                        :root {
                            --primary: #ff6700;
                            --secondary: #1c1e21;
                            --primary-hover: #e65c00;
                            --primary-light: rgba(255, 103, 0, 0.1);
                            --secondary-light: rgba(28, 30, 33, 0.1);
                        }
                        body {
                            font-family: var(--font-cairo), -apple-system, "SF Pro Arabic", system-ui, sans-serif;
                            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                            color: #1c1e21;
                            -webkit-font-smoothing: antialiased;
                            -moz-osx-font-smoothing: grayscale;
                            font-size: 14px;
                            margin: 0;
                            padding: 0;
                        }
                        [dir="ltr"] body {
                            font-family: var(--font-inter), -apple-system, "SF Pro", system-ui, sans-serif;
                        }
                        .glass {
                            background: rgba(255, 255, 255, 0.8);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                            border: 1px solid rgba(255, 255, 255, 0.5);
                            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                        }
                        .font-english { font-family: var(--font-inter), 'Inter', sans-serif; }
                        .font-arabic { font-family: var(--font-cairo), 'Cairo', sans-serif; }
                        @keyframes marquee-slow { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                        .animate-marquee-slow { display: inline-block; white-space: nowrap; animation: marquee-slow 120s linear infinite; }
                        [dir="ltr"] .animate-marquee-slow { animation: marquee-slow-ltr 120s linear infinite; }
                        @keyframes marquee-slow-ltr { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
                        @keyframes slide-up-soft { 0%,100% { opacity: 0; } 10%,90% { opacity: 1; } }
                        .animate-card-switch { animation: slide-up-soft 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
                        ::-webkit-scrollbar { width: 6px; height: 6px; }
                        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, var(--primary), var(--primary-hover)); border-radius: 10px; }
                        ::-webkit-scrollbar-thumb:hover { background: var(--primary-hover); }
                        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); }
                        .scrollbar-hide::-webkit-scrollbar { display: none; }
                        .card-hover {
                            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                            cursor: pointer;
                        }
                        .card-hover:hover {
                            transform: translateY(-4px);
                            box-shadow: 0 20px 40px -10px rgba(255, 103, 0, 0.15);
                        }
                        .gradient-primary { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%); }
                        .gradient-secondary { background: linear-gradient(135deg, var(--secondary) 0%, #2a2d32 100%); }
                        .loading-spinner {
                            border: 2px solid rgba(255, 103, 0, 0.1);
                            border-left: 2px solid var(--primary);
                            animation: spin 1s linear infinite;
                        }
                        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    `
                }} />
            </head>
            <body>
                <LanguageProvider>
                    {children}
                </LanguageProvider>
            </body>
        </html>
    );
}
