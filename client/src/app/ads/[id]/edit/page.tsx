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
import Image from 'next/image';
import dynamic from 'next/dynamic';
import DepthInput from '@/components/ui/DepthInput';
import DepthTextarea from '@/components/ui/DepthTextarea';
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
        price: "",
        location: "",
        description: "",
        phone: "",
        email: "",
    });
    const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(null);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        fetchAdData();
    }, [user, router, fetchAdData]);

    const fetchAdData = useCallback(async () => {
        try {
            const ad = await adsService.getAd(adId, true);
            if (!ad) {
                setError(language === 'ar' ? "الإعلان غير موجود" : "Ad not found");
                return;
            }

            // Check if user owns this ad
            const adData = ad as any;
            if (adData.author_id !== user?.id) {
                setError(language === 'ar' ? "ليس لديك صلاحية لتعديل هذا الإعلان" : "You don't have permission to edit this ad");
                return;
            }

            setFormData({
                title: adData.title || "",
                category: adData.category || "",
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
                const images = JSON.parse(adData.images);
                setExistingImages(Array.isArray(images) ? images : []);
            }
        } catch (err) {
            console.error("Error fetching ad:", err);
            setError(language === 'ar' ? "فشل في تحميل الإعلان" : "Failed to load ad");
        } finally {
            setLoading(false);
        }
    };

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
            if (!currentUser) {
                setError(language === 'ar' ? "يرجى تسجيل الدخول" : "Please log in");
                return;
            }

            // Upload new images if any
            const imageUrls = [...existingImages];
            if (newImages.length > 0) {
                for (const image of newImages) {
                    const fileExt = image.name.split('.').pop();
                    const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;
                    const filePath = `ads/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('images')
                        .upload(filePath, image, {
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (uploadError) {
                        console.error('Error uploading image:', uploadError);
                        throw new Error('Failed to upload image');
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('images')
                        .getPublicUrl(filePath);
                    imageUrls.push(publicUrl);
                }
            }

            // Update ad
            const updateData = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
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
            console.error("Failed to update ad:", err);
            setError(err.message || (language === 'ar' ? "حدث خطأ أثناء التحديث" : "Error updating ad"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    if (error && !formData.title) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-10">
                        <p className="text-red-600 font-bold text-xl">{error}</p>
                        <button onClick={() => router.back()} className="btn-saha-primary mt-4">
                            {language === 'ar' ? 'رجوع' : 'Go Back'}
                        </button>
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

                <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-md shadow-xl p-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 text-sm font-bold border-l-4 border-red-500 rounded-md mb-6">
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label className="text-sm font-bold text-black uppercase tracking-wide">
                                {t('professionalTitle')} *
                            </label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border border-gray-200 p-3 text-sm font-bold rounded-md outline-none focus:border-primary focus:bg-white transition-all mt-2"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-sm font-bold text-black uppercase tracking-wide">
                                    {t('category')} *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full bg-card border border-border-color p-3 text-sm font-bold rounded-md outline-none focus:border-primary focus:bg-card/80 cursor-pointer transition-all mt-2"
                                    required
                                >
                                    <option value="">{t('chooseCategory')}</option>
                                    <option value="realEstate">{t('realEstate')}</option>
                                    <option value="jobs">{t('jobs')}</option>
                                    <option value="cars">{t('cars')}</option>
                                    <option value="goods">{t('goods')}</option>
                                    <option value="services">{t('services')}</option>
                                    <option value="other">{t('other')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-black uppercase tracking-wide">
                                    {t('askingPrice')} *
                                </label>
                                <input
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="w-full bg-card border border-border-color p-3 text-sm font-bold rounded-md outline-none focus:border-primary focus:bg-card/80 transition-all mt-2"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-black uppercase tracking-wide">
                                {t('deploymentLocation')}
                            </label>
                            <input
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border border-gray-200 p-3 text-sm font-bold rounded-md outline-none focus:border-primary focus:bg-white transition-all mt-2"
                            />
                        </div>

                        {formData.category === 'realEstate' && (
                            <div>
                                <label className="text-sm font-bold text-black uppercase tracking-wide mb-2 block">
                                    <MapPin size={14} className="inline mr-1" />
                                    {language === 'ar' ? 'تحديد الموقع على الخريطة' : 'Select Location on Map'}
                                </label>
                                <MapSelector
                                    onLocationSelect={handleLocationSelect}
                                    initialLocation={coordinates ? [coordinates.lat, coordinates.lng] : undefined}
                                    height="250px"
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-bold text-black uppercase tracking-wide">
                                {t('detailedBriefing')}
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={5}
                                className="w-full bg-gray-50 border border-gray-200 p-4 text-sm font-medium rounded-md outline-none focus:border-primary focus:bg-white transition-all mt-2 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                                    {t('phone')}
                                </label>
                                <input
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border border-gray-200 p-3 text-sm font-medium rounded-md outline-none focus:border-primary focus:bg-white transition-all mt-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                                    {t('email')}
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border border-gray-200 p-3 text-sm font-medium rounded-md outline-none focus:border-primary focus:bg-white transition-all mt-2"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-black uppercase tracking-wide mb-2 block">
                                <Camera size={14} className="inline mr-1" />
                                {t('photos')} ({t('optional')})
                            </label>
                            {existingImages.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    {existingImages.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden">
                                            <Image src={img} alt={`Image ${idx + 1}`} fill className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full text-sm"
                            />
                            {newImages.length > 0 && (
                                <p className="text-xs text-green-600 mt-2">
                                    {newImages.length} {language === 'ar' ? 'صور جديدة محددة' : 'new images selected'}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-saha-primary flex-1 !py-3"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {saving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="btn-saha-outline !py-3 px-6"
                        >
                            <X size={20} />
                            {language === 'ar' ? 'إلغاء' : 'Cancel'}
                        </button>
                    </div>
                </form>
            </main>

            <Footer />
        </div>
    );
}
