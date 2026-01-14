"use client";

import { useState } from "react";
import { Camera, MapPin, Tag, Info, CheckCircle2, Loader2, Search, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

export default function PostAdPage() {
    const { language, t } = useLanguage();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        price: "",
        location: "",
        description: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.title || !formData.category || !formData.price || !formData.location) {
            setError(language === 'ar' ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
            return;
        }

        setLoading(true);
        try {
            const response = await apiService.post('/ads', {
                ...formData,
                price: Number(formData.price),
                images: "[]",
            });

            if (response && response.id) {
                router.push(`/ads/view?id=${response.id}`);
            }
        } catch (err: any) {
            console.error("Failed to post ad:", err);
            setError(language === 'ar' ? "حدث خطأ أثناء نشر الإعلان. يرجى التأكد من تسجيل الدخول." : "Error posting ad. Please ensure you are logged in.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#f0f2f5] min-h-screen flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Unified Micro Header */}
            <header className="bg-white border-b border-gray-200 py-2 px-4 shadow-sm z-50 sticky top-0">
                <div className="max-w-7xl mx-auto flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center p-1.5 shadow-md">
                            <svg viewBox="0 0 100 40" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round">
                                <path d="M 10 15 L 10 10 L 90 10 L 90 20 M 10 20 L 10 30 L 90 30 L 90 25" />
                            </svg>
                        </div>
                        <span className="text-lg font-black tracking-tighter text-secondary">{t('siteName')}</span>
                    </Link>

                    <div className="flex-1 max-w-xl flex border border-gray-200 rounded-sm overflow-hidden bg-gray-50">
                        <input type="text" placeholder={t('searchPlaceholder')} className="flex-1 px-3 py-1 text-[10px] outline-none font-bold bg-transparent" />
                        <button className="px-2 text-gray-400"><Search size={12} /></button>
                    </div>

                    <Link href="/dashboard" className="text-[10px] font-black text-secondary hover:text-primary transition-colors">
                        {t('dashboard')}
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto w-full p-4 flex-1">
                <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden flex flex-col">
                    <div className="bg-gray-50 border-b border-gray-100 p-3 flex items-center justify-between">
                        <h2 className="text-[12px] font-black uppercase tracking-widest flex items-center gap-2">
                            <PlusCircle size={14} className="text-primary" />
                            {language === 'ar' ? 'نشر إعلان جديد' : 'CREATE NEW LISTING'}
                        </h2>
                    </div>

                    <div className="p-6 space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-2 text-[10px] font-black border-r-4 border-red-500 rounded-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{language === 'ar' ? 'عنوان الإعلان *' : 'Ad Title *'}</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 border border-gray-100 p-2 text-[11px] font-bold rounded-sm outline-none focus:border-primary transition-all"
                                    placeholder={language === 'ar' ? 'مثال: شقة للبيع...' : 'e.g. Apartment for sale...'}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{language === 'ar' ? 'التصنيف *' : 'Category *'}</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 border border-gray-100 p-2 text-[11px] font-bold rounded-sm outline-none focus:border-primary cursor-pointer"
                                    required
                                >
                                    <option value="">{language === 'ar' ? 'اختر النوع' : 'Select Type'}</option>
                                    <option value="realEstate">عقارات</option>
                                    <option value="jobs">وظائف</option>
                                    <option value="cars">سيارات</option>
                                    <option value="goods">سلع</option>
                                    <option value="services">خدمات</option>
                                    <option value="other">أخرى</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{language === 'ar' ? 'السعر *' : 'Price *'}</label>
                                <input
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 border border-gray-100 p-2 text-[11px] font-bold rounded-sm outline-none focus:border-primary"
                                    placeholder="0"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{language === 'ar' ? 'الموقع *' : 'Location *'}</label>
                                <div className="relative">
                                    <input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 border border-gray-100 p-2 text-[11px] font-bold rounded-sm outline-none focus:border-primary"
                                        placeholder={language === 'ar' ? 'الرياض، مكة...' : 'Riyadh, Jeddah...'}
                                        required
                                    />
                                    <MapPin size={12} className="absolute right-2 top-2.5 text-gray-300" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{language === 'ar' ? 'التفاصيل' : 'Description'}</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="bg-gray-50 border border-gray-100 p-3 text-[11px] font-bold rounded-sm outline-none focus:border-primary resize-none"
                                placeholder={language === 'ar' ? 'اكتب وصفاً مفصلاً...' : 'Write a detailed description...'}
                            ></textarea>
                        </div>

                        <div className="pt-4 flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-sm text-[12px] font-black uppercase tracking-widest shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : <PlusCircle size={16} />}
                                {loading ? (language === 'ar' ? 'جاري النشر...' : 'POSTING...') : (language === 'ar' ? 'نشر الإعلان الآن' : 'PUBLISH LISTING')}
                            </button>
                            <p className="text-[9px] text-gray-400 text-center font-bold">
                                BY PUBLISHING, YOU AGREE TO OUR TERMS OF SERVICE AND PRIVACY POLICY.
                            </p>
                        </div>
                    </div>
                </form>

                <div className="mt-4 bg-blue-50 border border-blue-100 p-3 rounded-sm flex gap-3">
                    <Info size={16} className="text-blue-500 shrink-0" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-blue-800 uppercase italic">Saha Pro Tip:</span>
                        <p className="text-[9px] text-blue-600 font-bold leading-tight mt-0.5">
                            Ads with clear titles and detailed descriptions get 3x more views and faster deals.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
