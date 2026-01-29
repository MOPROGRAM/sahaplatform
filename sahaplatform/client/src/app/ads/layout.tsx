import { Suspense } from 'react';

export default function AdsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-bg">
            {/* CategorySidebar removed */}
            <main className="flex-1 overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
