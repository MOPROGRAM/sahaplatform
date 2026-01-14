"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, MapPin, Clock, Heart, Share2, ChevronLeft, Image as ImageIcon } from 'lucide-react';
import { apiService } from '@/lib/api';

interface Ad {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    category: string;
    location: string;
    images: string;
    isBoosted: boolean;
    author: {
        name: string;
        verified: boolean;
    };
    createdAt: string;
}

function AdsContent() {
    const searchParams = useSearchParams();
    const category = searchParams.get('category');

    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });

    useEffect(() => {
        fetchAds();
    }, [category]);

    const fetchAds = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (category) params.category = category;
            if (searchQuery) params.searchQuery = searchQuery;
            if (locationFilter) params.location = locationFilter;
            if (priceRange.min) params.minPrice = priceRange.min;
            if (priceRange.max) params.maxPrice = priceRange.max;

            const data = await apiService.get('/ads', params);
            setAds(data);
        } catch (error) {
            console.error('Failed to fetch ads:', error);
            // Show empty state when no data available
            setAds([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchAds();
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ar-SA').format(price);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 24) {
            return `منذ ${diffInHours} ساعة`;
        } else {
            return `منذ ${Math.floor(diffInHours / 24)} يوم`;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]" dir="rtl">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                            <span className="font-bold text-lg">ساحة</span>
                        </Link>

                        <div className="flex-1 max-w-2xl">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="ابحث في الإعلانات..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Filter className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-4 mt-4 text-sm">
                        <span className="text-gray-600">فلترة:</span>
                        <input
                            type="text"
                            placeholder="الموقع"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                        <input
                            type="number"
                            placeholder="السعر من"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                            className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-primary focus:border-primary w-24"
                        />
                        <input
                            type="number"
                            placeholder="إلى"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                            className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-primary focus:border-primary w-24"
                        />
                        <button
                            onClick={handleSearch}
                            className="px-4 py-1 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors text-sm font-medium"
                        >
                            تطبيق
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {category ? `${category}` : 'جميع الإعلانات'}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {loading ? 'جارٍ التحميل...' : `${ads.length} إعلان متاح`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>ترتيب:</span>
                        <select className="border border-gray-200 rounded px-3 py-1">
                            <option>الأحدث أولاً</option>
                            <option>السعر: من الأقل للأعلى</option>
                            <option>السعر: من الأعلى للأقل</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                                <div className="h-48 bg-gray-200"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {ads.map((ad) => (
                            <Link
                                key={ad.id}
                                href={`/ads/${ad.id}`}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
                            >
                                {/* Image */}
                                <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                                    <ImageIcon className="w-12 h-12 text-gray-300" />
                                    {ad.isBoosted && (
                                        <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-xs font-bold">
                                            مميز
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-2">
                                        {ad.title}
                                    </h3>

                                    <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>{ad.location}</span>
                                    </div>

                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xl font-bold text-primary">
                                            {formatPrice(ad.price)} ر.س
                                        </span>
                                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatDate(ad.createdAt)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">بواسطة</span>
                                            <span className="text-sm font-medium text-gray-900">{ad.author.name}</span>
                                            {ad.author.verified && (
                                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-xs">✓</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Add to favorites">
                                                <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                                            </button>
                                            <button
                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                title="Share this ad"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (navigator.share) {
                                                        navigator.share({
                                                            title: ad.title,
                                                            text: ad.description,
                                                            url: window.location.href,
                                                        });
                                                    } else {
                                                        // Fallback: copy to clipboard
                                                        navigator.clipboard.writeText(window.location.href);
                                                        alert('Link copied to clipboard!');
                                                    }
                                                }}
                                            >
                                                <Share2 className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && ads.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد إعلانات</h3>
                        <p className="text-gray-600">لم نجد أي إعلانات تطابق معايير البحث الخاصة بك</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <AdsContent />
        </Suspense>
    );
}