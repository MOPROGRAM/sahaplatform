"use client";

export const runtime = "edge";


import { useState, useEffect, useCallback } from "react";
import { Camera, MapPin, Tag, Info, CheckCircle2, Loader2, Search, PlusCircle, X, Rocket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { adsService } from "@/lib/ads";
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
        boostDays: 1,
        enableLocation: true,
        area: "",
        listingType: "sale", // 'rent' or 'sale'
    });
    const [images, setImages] = useState<File[]>([]);
    const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(null);

    const subCategoriesMap: Record<string, string[]> = {
        realestate: ['apartments', 'villas', 'lands', 'commercial', 'rent', 'offices', 'chalets', 'compounds', 'stores'],
        cars: ['toyota', 'hyundai', 'ford', 'mercedes', 'bmw', 'trucks', 'honda', 'nissan', 'chevrolet', 'kia', 'lexus', 'mazda', 'jeep', 'landrover'],
        jobs: ['it', 'sales', 'engineering', 'medical', 'education', 'marketing', 'accounting', 'management', 'technicians', 'drivers', 'security', 'customer_service'],
        electronics: ['phones', 'computers', 'appliances', 'gaming', 'laptops', 'tvs', 'cameras', 'tablets', 'smartwatches', 'accessories'],
        services: ['cleaning', 'moving', 'maintenance', 'legal', 'design', 'delivery', 'events', 'transport', 'teaching', 'contracting'],
        goods: ['furniture', 'fashion', 'sports', 'books', 'clothes', 'watches', 'perfumes', 'antiques', 'camping', 'other'],
    };

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as any;
        
        setFormData(prev => {
            const newData = { ...prev, [name]: type === 'checkbox' ? checked : value };
            
            // Reset subCategory when category changes
            if (name === 'category') {
                newData.subCategory = "";
            }
            
            return newData;
        });
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
            setError(language === 'ar' ? "بعض الصور غير صالحة (الحد الأقصى 5 ميجابايت)" : "Some images are invalid (Max 5MB)");
        }

        if (images.length + validFiles.length > 5) {
             setError(language === 'ar' ? "الحد الأقصى 5 صور" : "Maximum 5 images");
             return;
        }

        setImages(prev => [...prev, ...validFiles]);
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
            
            // Try to sync/check points, but don't fail the whole process if it fails
            // This prevents 500 errors if the users table is not perfectly synced
            try {
                 await supabase.from('users').select('points').eq('id', currentUser.id).maybeSingle();
            } catch (syncErr) {
                console.warn("Could not verify points, proceeding anyway:", syncErr);
            }

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

            const adData = {
                title: formData.title,
                description: finalDescription,
                price: parseFloat(formData.price),
                category: formData.category,
                subCategory: formData.subCategory || null,
                location: formData.enableLocation && formData.location ? formData.location : null,
                latitude: coordinates?.lat || null,
                longitude: coordinates?.lng || null,
                images: imageUrls,
                currencyId: 'sar',
                paymentMethod: formData.paymentMethod || null,
                isBoosted: false, // Create as regular first, then promote if needed
                phone: formData.phone || null,
                email: formData.email || null,
            };

            const createdAd = await adsService.createAd(adData);

            // Handle Promotion
            if (formData.isBoosted && formData.boostDays) {
                try {
                     await adsService.promoteAd(createdAd.id, formData.boostDays);
                } catch (promoteError) {
                    console.error("Promotion failed:", promoteError);
                    // We don't block the flow, just maybe show a toast or alert?
                    // Since we are redirecting, maybe passing a query param?
                    // For now, we'll just proceed. The ad is created.
                }
            }

            router.push(`/ads/${createdAd.id}`);
        } catch (err: any) {
            console.error("Error creating ad:", err);
            setError(err.message || "Error posting ad");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;
    if (!user) return null;

    return (
        <div className="bg-gray-bg min-h-screen flex flex-col">
            <Header />

            <main className="max-w-7xl mx-auto w-full p-4 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Info Column */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bento-card bg-primary text-white p-8 relative overflow-hidden group min-h-[300px] border-none shadow-lg">
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
                        <form onSubmit={handleSubmit} className="bento-card p-8 space-y-8 bg-white dark:bg-[#1a1a1a] shadow-premium border-none">
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
                                                    <option key={sub} value={sub}>{t(sub as any)}</option>
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

                                {/* Images Section */}
                                <div>
                                    <label className="text-[11px] font-black uppercase tracking-widest block mb-2">{t('photos')} ({t('optional')})</label>
                                    <div 
                                        className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-primary transition-colors cursor-pointer relative bg-gray-50 dark:bg-black/20"
                                        onClick={() => document.getElementById('images-input')?.click()}
                                    >
                                        <input 
                                            id="images-input"
                                            type="file" 
                                            multiple 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={handleImageChange}
                                        />
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <Camera size={32} className="text-primary/50" />
                                            <span className="text-sm font-bold">{t('clickToAddPhotos')}</span>
                                            <span className="text-xs opacity-70">{t('max5Images')}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Image Previews */}
                                    {images.length > 0 && (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
                                            {images.map((file, idx) => (
                                                <div key={idx} className="aspect-square relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm group">
                                                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setImages(prev => prev.filter((_, i) => i !== idx));
                                                        }}
                                                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-[11px] font-black uppercase tracking-widest block mb-2">{t('detailedBriefing')}</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="bento-input min-h-[150px]"
                                        placeholder={t('descriptionPlaceholder')}
                                    />
                                </div>

                                {/* Promotion Section */}
                                <div className={`bento-card p-6 border-2 transition-all ${formData.isBoosted ? 'border-primary bg-primary/5' : 'border-transparent bg-gray-50 dark:bg-white/5'}`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl transition-colors ${formData.isBoosted ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                                            <Rocket size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-bold text-lg">{t('promoteAd')}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-black uppercase tracking-widest ${user.points >= (formData.boostDays || 7) ? 'text-green-500' : 'text-red-500'}`}>
                                                        {t('pointsBalance')}: {user.points}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-text-muted mb-4 leading-relaxed">
                                                {t('promoteAdDesc')}
                                            </p>
                                            
                                            <div className="flex flex-col gap-4">
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${formData.isBoosted ? 'border-primary bg-primary text-white' : 'border-gray-300 dark:border-gray-600 group-hover:border-primary'}`}>
                                                        {formData.isBoosted && <CheckCircle2 size={16} />}
                                                    </div>
                                                    <input 
                                                        type="checkbox" 
                                                        name="isBoosted" 
                                                        checked={formData.isBoosted} 
                                                        onChange={(e) => {
                                                            if (user.points < (formData.boostDays || 7) && e.target.checked) {
                                                                setError(language === 'ar' ? "رصيد النقاط غير كافٍ" : "Insufficient points balance");
                                                                return;
                                                            }
                                                            handleInputChange(e);
                                                            if (!e.target.checked) setError("");
                                                        }}
                                                        className="hidden" 
                                                    />
                                                    <span className="font-bold">{language === 'ar' ? 'نعم، أريد تمييز إعلاني' : 'Yes, I want to promote my ad'}</span>
                                                </label>

                                                {formData.isBoosted && (
                                                    <div className="flex items-center gap-3 animate-in slide-in-from-top-2 fade-in flex-wrap">
                                                        <div className="flex items-center gap-2 bg-white dark:bg-black/20 p-1 rounded-lg border border-border-color">
                                                            <input 
                                                                type="number"
                                                                name="boostDays" 
                                                                min="1"
                                                                max="30"
                                                                value={formData.boostDays} 
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    if (!val) {
                                                                        setFormData(prev => ({ ...prev, boostDays: 0 })); // Temporarily 0 to allow typing
                                                                        return;
                                                                    }
                                                                    const days = parseInt(val);
                                                                    if (days > 30) return; // Max 30
                                                                    
                                                                    if (user.points < days) {
                                                                        setError(language === 'ar' ? "رصيد النقاط غير كافٍ لهذه المدة" : "Insufficient points for this duration");
                                                                    } else {
                                                                        setError("");
                                                                    }
                                                                    setFormData(prev => ({ ...prev, boostDays: days }));
                                                                }}
                                                                className="bento-input py-2 text-sm w-20 text-center font-bold !border-none !ring-0 !shadow-none bg-transparent"
                                                            />
                                                            <span className="text-xs font-black uppercase tracking-widest text-text-muted pr-3 border-r border-border-color h-full flex items-center">
                                                                {t('days')}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-2 rounded-lg">
                                                            {language === 'ar' ? `التكلفة: ${formData.boostDays || 0} نقطة` : `Cost: ${formData.boostDays || 0} Points`}
                                                        </span>
                                                        {user.points < (formData.boostDays || 1) && (
                                                            <Link href="/dashboard" className="text-xs font-bold text-primary hover:underline ml-auto">
                                                                {t('buyPoints')}
                                                            </Link>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || (formData.isBoosted && user.points < formData.boostDays)}
                                    className="btn-saha-primary w-full py-4 text-lg shadow-xl shadow-primary/20"
                                >
                                    {loading ? <Loader2 className="animate-spin mx-auto" /> : (formData.isBoosted ? (language === 'ar' ? `نشر وترويج (-${formData.boostDays} نقطة)` : `Post & Promote (-${formData.boostDays} Points)`) : t('deployListing'))}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
