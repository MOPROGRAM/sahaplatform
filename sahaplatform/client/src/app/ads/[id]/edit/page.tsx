"use client";

export const runtime = 'edge';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Camera, MapPin, Tag, Info, CheckCircle2, Loader2, X, PlusCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { adsService, Ad } from "@/lib/ads";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import dynamic from 'next/dynamic';
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguage } from "@/lib/language-context";

const MapSelector = dynamic(() => import('@/components/MapSelector'), {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
});

export default function EditAdPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuthStore();
    const { language, t } = useLanguage();
    const adId = params.id as string;

    const [loading, setLoading] = useState(true);
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
        listingType: "sale",
    });
    const [images, setImages] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]); // For new images to upload
    const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(null);

    const subCategoriesMap: Record<string, string[]> = {
        realestate: ['apartments', 'villas', 'lands', 'commercial', 'rent'],
        cars: ['toyota', 'hyundai', 'ford', 'mercedes', 'bmw', 'trucks'],
        jobs: ['it', 'sales', 'engineering', 'medical', 'education'],
        electronics: ['phones', 'computers', 'appliances', 'gaming'],
        services: ['cleaning', 'moving', 'maintenance', 'legal', 'design'],
        goods: ['furniture', 'fashion', 'sports', 'books', 'other'],
    };

    useEffect(() => {
        const fetchAd = async () => {
            try {
                setLoading(true);
                const adData = await adsService.getAd(adId, true);

                if (!adData) {
                    setError(language === 'ar' ? "الإعلان غير موجود" : "Ad not found");
                    return;
                }

                if (adData.author_id !== user?.id) {
                    setError(language === 'ar' ? "ليس لديك صلاحية لتعديل هذا الإعلان" : "You don't have permission to edit this ad");
                    return;
                }

                setFormData({
                    title: adData.title || "",
                    category: adData.category || "",
                    subCategory: adData.sub_category || "",
                    price: adData.price?.toString() || "",
                    location: adData.location || "",
                    address: adData.address || "",
                    paymentMethod: adData.payment_method || "",
                    description: adData.description || "",
                    phone: adData.phone || "",
                    email: adData.email || "",
                    isBoosted: adData.is_boosted || false,
                    enableLocation: !!(adData.latitude && adData.longitude),
                    area: (adData as any).area?.toString() || "",
                    listingType: (adData as any).listingType || "sale",
                });
                setImages(typeof adData.images === 'string' ? JSON.parse(adData.images) : adData.images || []);
                setCoordinates(adData.latitude && adData.longitude ? { lat: adData.latitude, lng: adData.longitude } : null);
            } catch (err) {
                console.error("Error fetching ad:", err);
                setError(language === 'ar' ? "فشل في تحميل الإعلان" : "Failed to load ad");
            } finally {
                setLoading(false);
            }
        };

        if (user && adId) {
            fetchAd();
        }
    }, [adId, user, language]);

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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(file =>
            file.type.startsWith('image/') &&
            file.size <= 5 * 1024 * 1024
        );
        if (validFiles.length !== files.length) {
            setError(language === 'ar' ? "بعض الصور غير صالحة" : "Some images are invalid");
            return;
        }
        setNewImages(prev => [...prev, ...validFiles]);
    };

    const handleRemoveImage = (index: number, isNew: boolean) => {
        if (isNew) {
            setNewImages(prev => prev.filter((_, i) => i !== index));
        } else {
            setImages(prev => prev.filter((_, i) => i !== index));
        }
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
            // Upload new images
            const newImageUrls: string[] = [];
            for (const image of newImages) {
                const fileExt = image.name.split('.').pop();
                const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
                const filePath = `ads/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(filePath, image);

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('images')
                        .getPublicUrl(filePath);
                    newImageUrls.push(publicUrl);
                }
            }

            const finalImages = JSON.stringify([...images, ...newImageUrls]);

            let finalDescription = formData.description;
            if (formData.category === 'realestate') {
                if (formData.area) finalDescription += `\n\n${language === 'ar' ? 'المساحة' : 'Area'}: ${formData.area} m²`;
                if (formData.listingType) finalDescription += `\n${language === 'ar' ? 'النوع' : 'Type'}: ${formData.listingType === 'rent' ? (language === 'ar' ? 'للإيجار' : 'For Rent') : (language === 'ar' ? 'للبيع' : 'For Sale')}`;
            }
            if (formData.subCategory) {
                finalDescription += `\n\n${language === 'ar' ? 'التصنيف الفرعي' : 'Subcategory'}: ${formData.subCategory}`;
            }

            const updatedAdData: any = {
                title: formData.title,
                description: finalDescription,
                price: parseFloat(formData.price),
                category: formData.category,
                subCategory: formData.subCategory,
                location: formData.enableLocation ? formData.location : null,
                latitude: coordinates?.lat || null,
                longitude: coordinates?.lng || null,
                images: finalImages,
                isBoosted: formData.isBoosted,
                // area: formData.area ? parseFloat(formData.area) : null, // If area column existed
                // listingType: formData.listingType, // If listingType column existed
            };

            await adsService.updateAd(adId, updatedAdData);
            router.push(`/ads/${adId}`);
        } catch (err: any) {
            console.error("Error updating ad:", err);
            setError(err.message || "Error updating ad");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-bg">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-bg">
                <div className="bento-card p-10 text-center flex flex-col items-center gap-4 bg-white dark:bg-[#1a1a1a]">
                    <Info size={48} className="text-red-500" />
                    <p className="text-red-600 font-bold text-xl">{error}</p>
                    <button onClick={() => router.back()} className="btn-saha-primary mt-4 mx-auto">{t("back")}</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-bg">
            <Header />

            <main className="max-w-[1920px] mx-auto w-full p-4 flex-1">
                <div className="mb-6 flex items-center gap-4 bento-card p-6 bg-white dark:bg-[#1a1a1a]">
                    <Link href={`/ads/${adId}`} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-text-muted">
                        <ArrowLeft size={20} className={language === 'ar' ? '' : 'rotate-180'} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-text-main uppercase tracking-tight">
                            {t("editAd")}
                        </h1>
                        <p className="text-text-muted mt-1 text-sm font-medium">
                            {t("updateAdDetails")}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bento-card p-8 space-y-8 bg-white dark:bg-[#1a1a1a] shadow-premium border-none">
                    {/* General Information */}
                    <h2 className="text-xl font-black text-text-main uppercase tracking-tight border-b-2 border-primary pb-2 w-fit mb-6">
                        {t("generalInfo")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                                        <option key={sub} value={sub}>{t(sub as any)}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <h2 className="text-xl font-black text-text-main uppercase tracking-tight border-b-2 border-primary pb-2 w-fit mb-6 mt-10">
                        {t("detailedDescription")}
                    </h2>
                    <div>
                        <label className="text-[11px] font-black uppercase tracking-widest block mb-2">{t('detailedBriefing')}</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={6}
                            className="bento-input resize-none font-medium"
                        />
                    </div>

                    {/* Location and Media */}
                    <h2 className="text-xl font-black text-text-main uppercase tracking-tight border-b-2 border-primary pb-2 w-fit mb-6 mt-10">
                        {t("locationAndMedia")}
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="inline-flex items-center text-[11px] font-black uppercase tracking-widest text-text-main cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="enableLocation"
                                    checked={formData.enableLocation}
                                    onChange={handleInputChange}
                                    className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 mr-2"
                                />
                                {t("enableLocation")}
                            </label>
                        </div>

                        {formData.enableLocation && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-black uppercase tracking-widest block mb-2"><MapPin size={12} className="inline mr-1" /> {t('deploymentLocation')}</label>
                                    <input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="bento-input"
                                        required={formData.enableLocation}
                                    />
                                </div>
                                <MapSelector onLocationSelect={handleLocationSelect} height="300px" initialLat={coordinates?.lat || 0} initialLng={coordinates?.lng || 0} />
                            </div>
                        )}

                        {/* Images Upload */}
                        <div className="mt-8">
                            <label className="text-[11px] font-black uppercase tracking-widest block mb-2">
                                <Camera size={12} className="inline mr-1" /> {t('photos')} ({images.length + newImages.length}/5) {t('optional')}
                            </label>
                            <div className="grid grid-cols-5 gap-3">
                                {images.map((img, index) => (
                                    <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary/20">
                                        <img src={img} alt="Ad Image" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => handleRemoveImage(index, false)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 text-xs hover:bg-red-500">
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {newImages.map((img, index) => (
                                    <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary/20">
                                        <img src={URL.createObjectURL(img)} alt="New Ad Image" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => handleRemoveImage(index, true)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 text-xs hover:bg-red-500">
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {images.length + newImages.length < 5 && (
                                    <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-300 text-gray-400 cursor-pointer hover:border-primary/50 transition-colors bg-gray-50 dark:bg-white/5">
                                        <PlusCircle size={24} />
                                        <span className="mt-2 text-[10px] font-black uppercase text-center">{t("addPhoto")}</span>
                                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                                    </label>
                                )}
                            </div>
                            <p className="text-[9px] text-text-muted mt-2">{t('max5Images')}</p>
                        </div>
                    </div>

                    <div className="pt-5 border-t border-border-color">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-saha-primary !w-full !py-4 !rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                            {loading ? t('loading') : t("saveChanges")}
                        </button>
                    </div>
                </form>
            </main>

            <Footer />
        </div>
    );
}
