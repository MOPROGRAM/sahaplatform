"use client";

import { useState } from "react";
import { Camera, MapPin, Tag, Info, CheckCircle2, Loader2, Search, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import Header from "@/components/Header";

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
                latitude: 24.7136, // Default for now
                longitude: 46.6753
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
            <Header />

            <main className="max-w-4xl mx-auto w-full p-4 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Info Column */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-primary p-6 rounded-sm text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform"></div>
                            <h2 className="text-lg font-black italic tracking-tighter uppercase relative z-10">{t('postAd')}</h2>
                            <p className="text-[10px] font-bold opacity-80 mt-2 leading-relaxed relative z-10">Start your professional selling journey on GCC's fastest growing marketplace.</p>
                            <div className="mt-6 flex flex-col gap-3 relative z-10">
                                <div className="flex items-center gap-3 bg-white/10 p-2 rounded-xs border border-white/10">
                                    <CheckCircle2 size={16} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Global Exposure</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white/10 p-2 rounded-xs border border-white/10">
                                    <Tag size={16} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Instant Liquidity</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 p-4 rounded-sm shadow-sm flex gap-3">
                            <Info size={18} className="text-secondary shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-secondary tracking-widest leading-none">Market Rules</span>
                                <p className="text-[9px] text-gray-500 font-bold mt-1.5 leading-[1.3] italic">Be precise with price and category to attract high-quality buyers instantly.</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Column */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden flex flex-col animate-in fade-in slide-in-from-right-4">
                            <div className="p-6 space-y-5">
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-4 text-[13px] font-black border-r-4 border-red-500 rounded-sm uppercase tracking-tighter italic flex items-center gap-3">
                                        <Info className="shrink-0" size={18} />
                                        <div>
                                            <span className="block text-[11px] opacity-70">SYSTEM ERROR CODE: 401_AUTH_FAILURE</span>
                                            {error}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[12px] font-black text-secondary uppercase tracking-[0.15em] pl-1 flex items-center gap-2">
                                            <div className="w-1 h-3 bg-primary rounded-full"></div>
                                            {language === 'ar' ? 'عنوان الإعلان الإحترافي *' : 'Professional Ad Title *'}
                                        </label>
                                        <input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className="bg-gray-50 border border-gray-200 p-4 text-[14px] font-black rounded-sm outline-none focus:border-primary focus:bg-white transition-all shadow-inner uppercase tracking-tighter"
                                            placeholder={language === 'ar' ? 'مثال: شقة استثمارية في حي النرجس...' : 'e.g. Investment Apartment in District 5...'}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[12px] font-black text-secondary uppercase tracking-[0.15em] pl-1 flex items-center gap-2">
                                                <div className="w-1 h-3 bg-navy rounded-full"></div>
                                                {t('category')} *
                                            </label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                className="bg-gray-50 border border-gray-200 p-4 text-[13px] font-black rounded-sm outline-none focus:border-primary focus:bg-white cursor-pointer transition-all shadow-inner uppercase tracking-tighter"
                                                required
                                            >
                                                <option value="">{language === 'ar' ? 'اختر تصنيف الوحدة' : 'SELECT UNIT CATEGORY'}</option>
                                                <option value="realEstate">Real Estate / عقارات</option>
                                                <option value="jobs">Jobs / وظائف</option>
                                                <option value="cars">Automotive / سيارات</option>
                                                <option value="goods">Retail / سلع</option>
                                                <option value="services">Services / خدمات</option>
                                                <option value="other">Other / أخرى</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[12px] font-black text-secondary uppercase tracking-[0.15em] pl-1 flex items-center gap-2">
                                                <div className="w-1 h-3 bg-emerald rounded-full"></div>
                                                ASKING PRICE (SAR) *
                                            </label>
                                            <input
                                                name="price"
                                                type="number"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                className="bg-gray-50 border border-gray-200 p-4 text-[14px] font-black rounded-sm outline-none focus:border-primary focus:bg-white transition-all shadow-inner italic"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[12px] font-black text-secondary uppercase tracking-[0.15em] pl-1 flex items-center gap-2">
                                            <div className="w-1 h-3 bg-amber rounded-full"></div>
                                            Deployment Location *
                                        </label>
                                        <div className="relative">
                                            <input
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-50 border border-gray-200 p-4 text-[14px] font-black rounded-sm outline-none focus:border-primary focus:bg-white transition-all shadow-inner uppercase tracking-tighter"
                                                placeholder={language === 'ar' ? 'الرياض، مكة، دبي...' : 'Riyadh, Dubai...'}
                                                required
                                            />
                                            <MapPin size={18} className="absolute right-4 top-4 text-primary opacity-40" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[12px] font-black text-secondary uppercase tracking-[0.15em] pl-1 flex items-center gap-2">
                                            <div className="w-1 h-3 bg-secondary rounded-full"></div>
                                            detailed Briefing / description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={6}
                                            className="bg-gray-50 border border-gray-200 p-5 text-[14px] font-medium rounded-sm outline-none focus:border-primary focus:bg-white transition-all shadow-inner resize-none leading-relaxed"
                                            placeholder={language === 'ar' ? 'اكتب وصفاً تقنياً دقيقاً...' : 'Write a technical and accurate description...'}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary hover:bg-primary-hover text-white py-5 rounded-sm text-[15px] font-black uppercase tracking-[0.25em] shadow-2xl shadow-primary/40 transition-all flex items-center justify-center gap-4 active:scale-95 group mb-4 border-b-4 border-primary-dark"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />}
                                        {loading ? 'INITIATING DEPLOYMENT...' : 'DEPLOY LISTING TO MATRIX'}
                                    </button>
                                    <div className="mt-4 flex items-center justify-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Saha Secure Transmission Protocol Active</span>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
