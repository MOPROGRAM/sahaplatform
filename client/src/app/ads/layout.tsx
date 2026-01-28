import { Suspense } from 'react';
import CategorySidebar from '@/components/CategorySidebar';

export default function AdsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-bg">
            <Suspense fallback={<div className="hidden lg:block w-64 bg-white border-r border-gray-200 h-screen sticky top-0" />}>
                <CategorySidebar />
            </Suspense>
            <main className="flex-1 overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
