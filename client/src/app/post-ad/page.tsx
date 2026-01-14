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
                latitude: 24.7136,
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
        <div className="bg-[#f8fafc] min-h-screen flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Header />

            <main className="max-w-5xl mx-auto w-full p-2 md:p-4 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Left Info Column */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-primary p-5 rounded-md text-white shadow-xl shadow-primary/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform"></div>
                            <h2 className="text-xl font-[1000] italic tracking-tighter uppercase relative z-10">{t('postAd')}</h2>
                            <p className="text-[10px] font-bold opacity-90 mt-2 leading-tight relative z-10">{t('joinThousands')}</p>

                            <div className="mt-5 flex flex-col gap-2 relative z-10">
                                <div className="flex items-center gap-3 bg-white/10 p-2 rounded-md border border-white/10">
                                    <CheckCircle2 size={16} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{t('verified')}</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white/10 p-2 rounded-md border border-white/10">
                                    <Tag size={16} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{t('featured')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm flex gap-3">
                            <i className="text-secondary shrink-0">
                                <Info size={18} className="text-primary" />
                            </i>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase text-black tracking-widest leading-none">{t('marketRules')}</span>
                                <p className="text-[10px] text-gray-500 font-bold mt-2 leading-relaxed">{t('marketRulesDesc')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Column */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-md shadow-xl shadow-black/[0.01] overflow-hidden flex flex-col">
                            <div className="p-5 space-y-5">
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 text-[12px] font-black border-r-4 border-red-500 rounded-md uppercase tracking-tight flex items-center gap-3">
                                        <Info size={16} />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-5">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1 h-3 bg-primary rounded-full"></div>
                                            {t('professionalTitle')} *
                                        </label>
                                        <input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className="bg-gray-50 border border-gray-200 p-3 text-[14px] font-black rounded-md outline-none focus:border-primary focus:bg-white transition-all shadow-inner uppercase tracking-tight"
                                            placeholder={t('adTitlePlaceholder')}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-1 h-3 bg-navy rounded-full"></div>
                                                {t('category')} *
                                            </label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                className="bg-gray-50 border border-gray-200 p-3 text-[13px] font-black rounded-md outline-none focus:border-primary focus:bg-white cursor-pointer transition-all shadow-inner"
                                                required
                                            >
                                                <option value="">{language === 'ar' ? '-- اختر القسم --' : '-- Choose Category --'}</option>
                                                <option value="realEstate">{t('realEstate')}</option>
                                                <option value="jobs">{t('jobs')}</option>
                                                <option value="cars">{t('cars')}</option>
                                                <option value="goods">{t('goods')}</option>
                                                <option value="services">{t('services')}</option>
                                                <option value="other">{t('other')}</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-1 h-3 bg-emerald rounded-full"></div>
                                                {t('askingPrice')} *
                                            </label>
                                            <input
                                                name="price"
                                                type="number"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                className="bg-gray-50 border border-gray-200 p-3 text-[14px] font-black rounded-md outline-none focus:border-primary focus:bg-white transition-all shadow-inner italic"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1 h-3 bg-amber rounded-full"></div>
                                            {t('deploymentLocation')} *
                                        </label>
                                        <div className="relative">
                                            <input
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-50 border border-gray-200 p-3 text-[14px] font-black rounded-md outline-none focus:border-primary focus:bg-white transition-all shadow-inner uppercase tracking-tight"
                                                placeholder={t('locationPlaceholder')}
                                                required
                                            />
                                            <MapPin size={18} className="absolute right-3 top-3 text-primary opacity-30" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1 h-3 bg-black rounded-full"></div>
                                            {t('detailedBriefing')}
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={5}
                                            className="bg-gray-50 border border-gray-200 p-4 text-[14px] font-medium rounded-md outline-none focus:border-primary focus:bg-white transition-all shadow-inner resize-none leading-relaxed"
                                            placeholder={t('descriptionPlaceholder')}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="pt-5 border-t border-gray-100 flex flex-col items-center">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-saha-primary !w-full !py-4 !text-[16px] mb-4"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />}
                                        {loading ? t('loading') : t('deployListing')}
                                    </button>
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{t('secureProtocol')}</span>
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
