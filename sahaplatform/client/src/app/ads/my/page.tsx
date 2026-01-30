"use client";

export const runtime = 'edge';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adsService, Ad } from "@/lib/ads";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguage } from "@/lib/language-context";
import { formatRelativeTime } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdCard from "@/components/AdCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { AlertCircle, Plus, Edit, Trash2 } from "lucide-react";

export default function MyAdsPage() {
    const { language, t } = useLanguage();
    const { user, token, loading: authLoading } = useAuthStore();
    const router = useRouter();
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Fetch user's ads
    useEffect(() => {
        if (user && token) {
            fetchMyAds();
        }
    }, [user, token]);

    const fetchMyAds = async () => {
        try {
            setLoading(true);
            const data = await adsService.getMyAds();
            setAds(data as any);
        } catch (err: any) {
            console.error('Error fetching ads:', err);
            setError('Failed to load ads');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAd = async (adId: string) => {
        if (!confirm('Are you sure you want to delete this ad?')) {
            return;
        }

        try {
            await adsService.deleteAd(adId);
            setAds(ads.filter(ad => ad.id !== adId));
        } catch (err: any) {
            console.error('Error deleting ad:', err);
            setError('Failed to delete ad');
        }
    };

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="bg-gray-bg min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    // Don't render if not authenticated (will redirect)
    if (!user) {
        return null;
    }

    return (
        <div className="bg-gray-bg min-h-screen flex flex-col">
            <Header />

            <main className="max-w-[1920px] mx-auto w-full p-4 flex-1">
                <div className="mb-6">
                    <h1 className="text-2xl font-black text-text-main uppercase tracking-tight mb-2">
                        {t('myAds')}
                    </h1>
                    <p className="text-text-muted text-sm">
                        {t('manageAds')}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 text-red-500 p-4 text-sm font-bold border-r-4 border-red-500 rounded-md mb-6 flex items-center gap-3">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <div className="flex justify-between items-center mb-6">
                    <div className="text-sm text-text-muted">
                        {language === 'ar'
                            ? `${ads.length} إعلان${ads.length !== 1 ? '' : ''} ${ads.length !== 1 ? t('published') : t('publishedSingular')}`
                            : `${ads.length} ad${ads.length !== 1 ? 's' : ''} ${t('published')}`
                        }
                    </div>
                    <button
                        onClick={() => router.push('/post-ad')}
                        className="btn-saha-primary !py-2 !px-4 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        {t('postAd')}
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner />
                    </div>
                ) : ads.length === 0 ? (
                    <div className="bento-card border-dashed p-12 text-center">
                        <div className="text-text-muted mb-4">
                            <Plus size={48} className="mx-auto" />
                        </div>
                        <h3 className="text-lg font-bold text-text-main mb-2">
                            {t('noAds')}
                        </h3>
                        <p className="text-text-muted mb-6">
                            {t('startPosting')}
                        </p>
                        <button
                            onClick={() => router.push('/post-ad')}
                            className="btn-saha-primary"
                        >
                            {t('postAd')}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                        {ads.map((ad) => (
                            <div key={ad.id} className="h-full">
                                <AdCard
                                    id={ad.id}
                                    title={ad.title}
                                    price={ad.price || 0}
                                    location={ad.location || ''}
                                    images={typeof ad.images === 'string' ? JSON.parse(ad.images || '[]') : ad.images}
                                    createdAt={ad.created_at}
                                    category={ad.category}
                                    language={language}
                                    authorName={user?.name}
                                    authorId={user?.id}
                                    phoneNumber={ad.phone || user?.phone}
                                />
                                <div className="mt-2 flex justify-end gap-2 px-2">
                                    <button
                                        onClick={() => router.push(`/ads/${ad.id}/edit`)}
                                        className="text-blue-500 hover:text-blue-700 p-2 bg-blue-500/10 rounded-full transition-colors"
                                        title={language === 'ar' ? 'تعديل' : 'Edit'}
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAd(ad.id)}
                                        className="text-red-500 hover:text-red-700 p-2 bg-red-500/10 rounded-full transition-colors"
                                        title={t('delete')}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
