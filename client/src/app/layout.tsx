import type { Metadata } from "next";
import { Inter, Cairo, Tajawal, Readex_Pro } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";
import { ThemeProvider } from "next-themes";
import { cookies } from "next/headers";
import ErrorBoundary from "@/components/ErrorBoundary";

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

export const runtime = "edge";

export const metadata: Metadata = {
    title: "ساحة - مساحة واسعة من الفرص",
    description: "مساحة واسعة من الفرص - منصة شاملة للإعلانات والخدمات في الشرق الأوسط",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = cookies();
    let lang: 'ar' | 'en' = 'ar';
    try {
        lang = (cookieStore.get('language')?.value || 'ar') as 'ar' | 'en';
    } catch (error) {
        console.error('Failed to read language cookie:', error);
    }
    const dir = lang === 'ar' ? 'rtl' : 'ltr';

    return (
        <html dir={dir} lang={lang} className={`${inter.variable} ${cairo.variable} ${tajawal.variable} ${readex.variable}`} suppressHydrationWarning style={{ colorScheme: 'dark' }}>
            <head>
                <meta name="google-site-verification" content="xcw2YfF0cO2WZTP9CGV3_aTSK591RFzLOuFaYuObdrI" />
            </head>
            <body>
                <LanguageProvider initialLanguage={lang}>
                    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                        <ErrorBoundary>
                            <div className="flex min-h-screen bg-gray-bg">
                                <main className="flex-1 w-full">
                                    {children}
                                </main>
                            </div>
                        </ErrorBoundary>
                    </ThemeProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
