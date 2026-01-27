"use client";

import { useState, useEffect, useCallback } from "react";
import { Camera, MapPin, Tag, Info, CheckCircle2, Loader2, Search, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';

const MapSelector = dynamic(() => import('@/components/MapSelector'), {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
});

export default function PostAdPage() {
    const { language, t } = useLanguage();
    const { user, loading: authLoading } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        subCategory: "",
        price: "",
        location: "",
        address: "",
        paymentMethod: "",
        description: "",
        phone: "",
        email: "",
        isBoosted: false,
        enableLocation: true,
    });
    const [images, setImages] = useState<File[]>([]);
    const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(null);

    const subCategoriesMap: Record<string, string[]> = {
        realestate: ['apartments', 'villas', 'lands', 'commercial', 'rent'],
        cars: ['toyota', 'hyundai', 'ford', 'mercedes', 'bmw', 'trucks'],
        jobs: ['it', 'sales', 'engineering', 'medical', 'education'],
        electronics: ['phones', 'computers', 'appliances', 'gaming'],
        services: ['cleaning', 'moving', 'maintenance', 'legal', 'design'],
        goods: ['furniture', 'fashion', 'sports', 'books', 'other'],
    };

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as any;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleLocationSelect = (lat: number, lng: number, address?: string) => {
        setCoordinates({ lat, lng });
        if (address) {
            setFormData(prev => ({ ...prev, location: address }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(file =>
            file.type.startsWith('image/') &&
            file.size <= 5 * 1024 * 1024
        );
        if (validFiles.length !== files.length) {
            setError(language === 'ar' ? "بعض الصور غير صالحة" : "Some images are invalid");
            return;
        }
        setImages(validFiles);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.title || !formData.category || !formData.price) {
            setError(language === 'ar' ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
            return;
        }

        setLoading(true);
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) throw new Error("Not authenticated");

            // Upload images
            const imageUrls: string[] = [];
            for (const image of images) {
                const fileExt = image.name.split('.').pop();
                const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;
                const filePath = `ads/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(filePath, image);

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('images')
                        .getPublicUrl(filePath);
                    imageUrls.push(publicUrl);
                }
            }

            // Create ad
            const adData: any = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                sub_category: formData.subCategory || null,
                location: formData.enableLocation ? formData.location : null,
                latitude: coordinates?.lat || null,
                longitude: coordinates?.lng || null,
                images: JSON.stringify(imageUrls),
                author_id: currentUser.id,
                is_active: true,
                phone: formData.phone || null,
                email: formData.email || null,
                currency_id: 'sar'
            };

            const { data, error: insertError } = await (supabase as any)
                .from('ads')
                .insert(adData)
                .select()
                .single();

            if (insertError) throw insertError;
            router.push(`/ads/view?id=${data.id}`);
        } catch (err: any) {
            setError(err.message || "Error posting ad");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;
    if (!user) return null;

    return (
        <div className="bg-[#f8fafc] min-h-screen flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Header />

            <main className="max-w-5xl mx-auto w-full p-2 md:p-4 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Left Info Column */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-primary p-5 rounded-md text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform"></div>
                            <h2 className="text-xl font-[1000] italic tracking-tighter uppercase relative z-10">{t('postAd')}</h2>
                            <p className="text-[10px] font-bold opacity-90 mt-2 leading-tight relative z-10">{t('joinThousands')}</p>
                        </div>
                    </div>

                    {/* Form Column */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-md shadow-xl p-5 space-y-5">
                            {error && <div className="bg-red-50 text-red-600 p-3 text-xs font-black rounded-md">{error}</div>}

                            <div className="space-y-5">
                                <div>
                                    <label className="text-[11px] font-black uppercase tracking-widest block mb-2">{t('professionalTitle')} *</label>
                                    <input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-md outline-none focus:border-primary transition-all shadow-inner font-bold"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-[11px] font-black uppercase tracking-widest block mb-2">{t('category')} *</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-md outline-none focus:border-primary transition-all cursor-pointer font-bold"
                                            required
                                        >
                                            <option value="">{t('chooseCategory')}</option>
                                            <option value="realestate">{t('realestate')}</option>
                                            <option value="jobs">{t('jobs')}</option>
                                            <option value="cars">{t('cars')}</option>
                                            <option value="electronics">{t('electronics')}</option>
                                            <option value="services">{t('services')}</option>
                                            <option value="goods">{t('goods')}</option>
                                        </select>
                                    </div>

                                    {formData.category && subCategoriesMap[formData.category] && (
                                        <div>
                                            <label className="text-[11px] font-black uppercase tracking-widest block mb-2">{t('subCategory')} *</label>
                                            <select
                                                name="subCategory"
                                                value={formData.subCategory}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-md outline-none focus:border-primary transition-all cursor-pointer font-bold"
                                                required
                                            >
                                                <option value="">{t('chooseSubCategory')}</option>
                                                {subCategoriesMap[formData.category].map(sub => (
                                                    <option key={sub} value={sub}>{(t as any)[sub] || sub}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-[11px] font-black uppercase tracking-widest block mb-2">{t('askingPrice')} *</label>
                                        <input
                                            name="price"
                                            type="number"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-md outline-none focus:border-primary transition-all font-bold"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black uppercase tracking-widest block mb-2">{t('deploymentLocation')} *</label>
                                        <input
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-md outline-none focus:border-primary transition-all font-bold"
                                            required
                                        />
                                    </div>
                                </div>

                                {formData.category === 'realestate' && (
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest block"><MapPin size={12} className="inline" /> {t('location')}</label>
                                        <MapSelector onLocationSelect={handleLocationSelect} height="250px" />
                                    </div>
                                )}

                                <div>
                                    <label className="text-[11px] font-black uppercase tracking-widest block mb-2">{t('detailedBriefing')}</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={5}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-md outline-none focus:border-primary transition-all resize-none font-medium"
                                    />
                                </div>

                                <div className="pt-5 border-t border-gray-100">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-saha-primary !w-full !py-4"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <PlusCircle size={20} />}
                                        {loading ? t('loading') : t('deployListing')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
