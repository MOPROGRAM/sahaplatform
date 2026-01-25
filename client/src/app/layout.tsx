import type { Metadata } from "next";
import { Inter, Cairo, Tajawal, Readex_Pro } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";

const LanguageProvider = dynamic(() => import("@/lib/language-context").then(mod => ({ default: mod.LanguageProvider })), {
    ssr: false,
});

const ThemeProvider = dynamic(() => import("next-themes").then(mod => ({ default: mod.ThemeProvider })), {
    ssr: false,
});

const CategorySidebar = dynamic(() => import("@/components/CategorySidebar"), {
    ssr: false,
});

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

const readex = Readex_Pro({
    subsets: ['latin'],
    variable: '--font-readex',
    display: 'swap',
    weight: ['300', '400', '600', '700']
});

export const runtime = 'edge';

export const metadata: Metadata = {
    title: "ساحة - مساحة واسعة من الفرص",
    description: "مساحة واسعة من الفرص - منصة شاملة للإعلانات والخدمات في الشرق الأوسط",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html className={`${inter.variable} ${cairo.variable} ${tajawal.variable} ${readex.variable}`}>
            <head>
                <meta name="google-site-verification" content="xcw2YfF0cO2WZTP9CGV3_aTSK591RFzLOuFaYuObdrI" />
                <style dangerouslySetInnerHTML={{
                    __html: `
                        :root {
                            --primary: #FF4D00;
                            --primary-hover: #FF9E00;
                            --secondary: #0f172a;
                            --primary-light: rgba(255, 77, 0, 0.06);
                        }
                        body {
                            font-family: var(--font-cairo), -apple-system, "SF Pro Arabic", system-ui, sans-serif;
                            background: var(--gray-bg);
                            color: var(--text-main);
                            -webkit-font-smoothing: antialiased;
                            -moz-osx-font-smoothing: grayscale;
                            font-size: 14px;
                            margin: 0;
                            padding: 0;
                            transition: background-color 0.22s ease, color 0.22s ease;
                        }
                        [dir="ltr"] body {
                            font-family: var(--font-inter), -apple-system, "SF Pro", system-ui, sans-serif;
                        }
                        h1,h2,h3,h4 { font-family: var(--font-readex), var(--font-inter), system-ui, sans-serif; }
                        ::-webkit-scrollbar { width: 6px; height: 6px; }
                        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, var(--primary), var(--primary-hover)); border-radius: 10px; }
                        ::-webkit-scrollbar-thumb:hover { background: var(--primary-hover); }
                        ::-webkit-scrollbar-track { background: transparent; }
                        .card-hover { transition: all 0.24s cubic-bezier(0.4,0,0.2,1); }
                        .card-hover:hover { transform: translateY(-4px); box-shadow: var(--glow-orange); }
                    `
                }} />
            </head>
            <body>
                <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
                    <LanguageProvider>
                        <div className="flex min-h-screen bg-aurora-subtle transition-colors duration-500">
                            <CategorySidebar />
                            <main className="flex-1 overflow-x-hidden">
                                {children}
                            </main>
                        </div>
                    </LanguageProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
