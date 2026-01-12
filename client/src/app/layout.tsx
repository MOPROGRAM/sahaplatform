import type { Metadata } from "next";
import "./globals.css";

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
        <html lang="ar" dir="rtl">
            <head>
                <script src="https://cdn.tailwindcss.com"></script>
                <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
                <style dangerouslySetInnerHTML={{
                    __html: `
                        :root { --primary: #ff6700; --secondary: #1c1e21; }
                        body {
                            font-family: -apple-system, "SF Pro Arabic", "SF Pro Display", "SF Pro Text", system-ui, sans-serif;
                            background: #f8fafc;
                            color: #1c1e21;
                            -webkit-font-smoothing: antialiased;
                            font-size: 13px;
                            margin: 0;
                            padding: 0;
                        }
                        .glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.4); }
                        @keyframes marquee-slow { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                        .animate-marquee-slow { display: inline-block; white-space: nowrap; animation: marquee-slow 120s linear infinite; }
                        @keyframes slide-up-soft { 0%,100% { opacity: 0; } 10%,90% { opacity: 1; } }
                        .animate-card-switch { animation: slide-up-soft 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
                        ::-webkit-scrollbar { width: 3px; height: 3px; }
                        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                        .scrollbar-hide::-webkit-scrollbar { display: none; }
                        .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
                    `
                }} />
            </head>
            <body>
                {children}
            </body>
        </html>
    );
}
