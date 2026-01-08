import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
    title: "Saha | ساحة - Jobs, Real Estate & Classifieds",
    description: "High-performance professional classifieds platform in the Middle East.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ar" dir="rtl">
            <body className="bg-gray-50 dark:bg-slate-950">
                <div className="min-h-screen flex flex-col">
                    {children}
                    <BottomNav />
                </div>
            </body>
        </html>
    );
}
