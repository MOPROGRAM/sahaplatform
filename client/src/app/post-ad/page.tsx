"use client";

import { useState, useEffect, useCallback } from "react";
import { Camera, MapPin, Tag, Info, CheckCircle2, Loader2, Search, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { apiService } from "@/lib/api";
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
        area: "",
        listingType: "sale", // 'rent' or 'sale'
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
            let finalDescription = formData.description;
            if (formData.category === 'realestate') {
                if (formData.area) finalDescription += `\n\n${language === 'ar' ? 'المساحة' : 'Area'}: ${formData.area} m²`;
                if (formData.listingType) finalDescription += `\n${language === 'ar' ? 'النوع' : 'Type'}: ${formData.listingType === 'rent' ? (language === 'ar' ? 'للإيجار' : 'For Rent') : (language === 'ar' ? 'للبيع' : 'For Sale')}`;
            }
            if (formData.subCategory) {
                finalDescription += `\n\n${language === 'ar' ? 'التصنيف الفرعي' : 'Subcategory'}: ${formData.subCategory}`;
            }

            const adData: any = {
                title: formData.title,
                description: finalDescription,
                price: parseFloat(formData.price),
                category: formData.category,
                // subCategory: formData.subCategory, // Removed as column doesn't exist
                location: formData.enableLocation ? formData.location : null,
                latitude: coordinates?.lat || null,
                longitude: coordinates?.lng || null,
                images: JSON.stringify(imageUrls),
                userId: currentUser.id,
                isActive: true,
                currencyId: 'sar',
                // area: formData.area ? parseFloat(formData.area) : null, // Removed as column doesn't exist
            };

            const { data, error: insertError } = await (supabase as any)
                .from('Ad')
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

            <main className="max-w-7xl mx-auto w-full p-4 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Info Column */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bento-card bg-primary text-white p-8 relative overflow-hidden group min-h-[300px] border-none shadow-premium">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <h2 className="text-3xl font-[1000] italic tracking-tighter uppercase mb-4">{t('postAd')}</h2>
                                    <p className="text-sm font-bold opacity-90 leading-relaxed">{t('joinThousands')}</p>
                                </div>
                                <div className="mt-8 flex gap-2 opacity-50">
                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Column */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit} className="bento-card p-8 space-y-8 bg-white shadow-premium">
                            {error && <div className="bg-red-50 text-red-600 p-4 text-sm font-bold rounded-2xl flex items-center gap-2"><Info size={16}/>{error}</div>}

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[11px] font-black uppercase tracking-widest block mb-2">{t('professionalTitle')} *</label>
                                    <input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="bento-input"
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
                                            className="bento-input appearance-none cursor-pointer"
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
                                                className="bento-input cursor-pointer"
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
                                            className="bento-input"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black uppercase tracking-widest block mb-2">{t('deploymentLocation')} *</label>
                                        <input
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="bento-input"
                                            required
                                        />
                                    </div>
                                </div>

                                    {formData.category === 'realestate' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="text-[11px] font-black uppercase tracking-widest block mb-2">{language === 'ar' ? 'المساحة (م²)' : 'Area (m²)'} *</label>
                                                <input
                                                    name="area"
                                                    type="number"
                                                    value={formData.area}
                                                    onChange={handleInputChange}
                                                    className="bento-input"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-black uppercase tracking-widest block mb-2">{language === 'ar' ? 'نوع العرض' : 'Listing Type'} *</label>
                                                <select
                                                    name="listingType"
                                                    value={formData.listingType}
                                                    onChange={handleInputChange}
                                                    className="bento-input cursor-pointer"
                                                    required
                                                >
                                                    <option value="sale">{language === 'ar' ? 'للبيع' : 'For Sale'}</option>
                                                    <option value="rent">{language === 'ar' ? 'للإيجار' : 'For Rent'}</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

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
                                        className="bento-input resize-none font-medium"
                                    />
                                </div>

                                <div className="pt-5 border-t border-gray-100">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-saha-primary !w-full !py-4 !rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
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
