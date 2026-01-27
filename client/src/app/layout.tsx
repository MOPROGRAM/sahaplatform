import type { Metadata } from "next";
import { Inter, Cairo, Tajawal, Readex_Pro } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";
import { ThemeProvider } from "next-themes";
import CategorySidebar from "@/components/CategorySidebar";

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
        <html className={`${inter.variable} ${cairo.variable} ${tajawal.variable} ${readex.variable}`} suppressHydrationWarning>
            <head>
                <meta name="google-site-verification" content="xcw2YfF0cO2WZTP9CGV3_aTSK591RFzLOuFaYuObdrI" />
            </head>
            <body>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                    <LanguageProvider>
                        <div className="flex min-h-screen bg-gray-bg">
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
