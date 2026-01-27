"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Save, X, Camera, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useAuthStore } from "@/store/useAuthStore";
import { adsService } from "@/lib/ads";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import dynamic from 'next/dynamic';

const MapSelector = dynamic(() => import('@/components/MapSelector'), {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
});

export default function EditAdPage() {
    const { language, t } = useLanguage();
    const { user } = useAuthStore();
    const router = useRouter();
    const params = useParams();
    const adId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        subCategory: "",
        price: "",
        location: "",
        description: "",
        phone: "",
        email: "",
    });
    const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(null);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);

    const subCategoriesMap: Record<string, string[]> = {
        realestate: ['apartments', 'villas', 'lands', 'commercial', 'rent'],
        cars: ['toyota', 'hyundai', 'ford', 'mercedes', 'bmw', 'trucks'],
        jobs: ['it', 'sales', 'engineering', 'medical', 'education'],
        electronics: ['phones', 'computers', 'appliances', 'gaming'],
        services: ['cleaning', 'moving', 'maintenance', 'legal', 'design'],
        goods: ['furniture', 'fashion', 'sports', 'books', 'other'],
    };

    const fetchAdData = useCallback(async () => {
        try {
            const ad = await adsService.getAd(adId, true);
            if (!ad) {
                setError(language === 'ar' ? "الإعلان غير موجود" : "Ad not found");
                return;
            }

            const adData = ad as any;
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
                description: adData.description || "",
                phone: adData.phone || "",
                email: adData.email || "",
            });

            if (adData.latitude && adData.longitude) {
                setCoordinates({ lat: adData.latitude, lng: adData.longitude });
            }

            if (adData.images) {
                try {
                    const images = typeof adData.images === 'string' ? JSON.parse(adData.images) : adData.images;
                    setExistingImages(Array.isArray(images) ? images : []);
                } catch (e) {
                    console.error("Failed to parse images:", e);
                    setExistingImages([]);
                }
            }
        } catch (err) {
            console.error("Error fetching ad:", err);
            setError(language === 'ar' ? "فشل في تحميل الإعلان" : "Failed to load ad");
        } finally {
            setLoading(false);
        }
    }, [adId, user, language]);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        fetchAdData();
    }, [user, router, fetchAdData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        setNewImages(validFiles);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.title || !formData.category || !formData.price) {
            setError(language === 'ar' ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
            return;
        }

        setSaving(true);
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) throw new Error("Not authenticated");

            // Upload new images if any
            let imageUrls = [...existingImages];
            if (newImages.length > 0) {
                for (const image of newImages) {
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
            }

            // Update ad
            const updateData: any = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                sub_category: formData.subCategory || null,
                location: formData.location,
                latitude: coordinates?.lat || null,
                longitude: coordinates?.lng || null,
                images: JSON.stringify(imageUrls),
                phone: formData.phone || null,
                email: formData.email || null,
            };

            await adsService.updateAd(adId, updateData);
            router.push(`/ads/view?id=${adId}`);
        } catch (err: any) {
            setError(err.message || "Error updating ad");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;

    if (error && !formData.title) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center p-10 text-center">
                    <div>
                        <p className="text-red-600 font-bold text-xl">{error}</p>
                        <button onClick={() => router.back()} className="btn-saha-primary mt-4 mx-auto">رجوع</button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Header />

            <main className="max-w-5xl mx-auto w-full p-4 flex-1">
                <div className="mb-6">
                    <h1 className="text-2xl font-black text-secondary uppercase tracking-tight">
                        {language === 'ar' ? 'تعديل الإعلان' : 'Edit Ad'}
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-md shadow-xl p-6 space-y-5">
                    {error && <div className="bg-red-50 text-red-600 p-3 text-sm font-bold rounded-md mb-6">{error}</div>}

                    <div className="space-y-5">
                        <div>
                            <label className="text-sm font-bold uppercase tracking-wide">{t('professionalTitle')} *</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-md outline-none focus:border-primary transition-all font-bold"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-sm font-bold uppercase tracking-wide">{t('category')} *</label>
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
                                    <label className="text-sm font-bold uppercase tracking-wide">{t('subCategory')} *</label>
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
                                <label className="text-sm font-bold uppercase tracking-wide">{t('askingPrice')} *</label>
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
                                <label className="text-sm font-bold uppercase tracking-wide">{t('deploymentLocation')} *</label>
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
                                <label className="text-sm font-bold uppercase tracking-wide block"><MapPin size={14} className="inline mr-1" /> {t('location')}</label>
                                <MapSelector onLocationSelect={handleLocationSelect} initialLocation={coordinates ? [coordinates.lat, coordinates.lng] : undefined} height="250px" />
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-bold uppercase tracking-wide block mb-2">{t('detailedBriefing')}</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={5}
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-md outline-none focus:border-primary transition-all resize-none font-medium"
                            />
                        </div>

                        <div className="pt-5 border-t border-gray-100 flex gap-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-saha-primary flex-1 !py-4"
                            >
                                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                {saving ? t('processing') : t('save')}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="btn-saha-outline px-8 !py-4"
                            >
                                {t('cancel')}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
            <Footer />
        </div>
    );
}
