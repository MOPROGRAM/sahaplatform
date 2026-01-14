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

            <main className="max-w-5xl mx-auto w-full p-4 md:p-8 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Info Column */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-primary p-8 rounded-md text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-150 transition-transform"></div>
                            <h2 className="text-2xl font-[1000] italic tracking-tighter uppercase relative z-10">{t('postAd')}</h2>
                            <p className="text-[12px] font-bold opacity-90 mt-4 leading-relaxed relative z-10">{t('joinThousands')}</p>

                            <div className="mt-8 flex flex-col gap-4 relative z-10">
                                <div className="flex items-center gap-4 bg-white/10 p-3 rounded-md border border-white/10">
                                    <CheckCircle2 size={20} />
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">{t('verified')}</span>
                                </div>
                                <div className="flex items-center gap-4 bg-white/10 p-3 rounded-md border border-white/10">
                                    <Tag size={20} />
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">{t('featured')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 p-6 rounded-md shadow-sm flex gap-4">
                            <i className="text-secondary shrink-0">
                                <Info size={24} className="text-primary" />
                            </i>
                            <div className="flex flex-col">
                                <span className="text-[13px] font-black uppercase text-black tracking-widest leading-none">{t('marketRules')}</span>
                                <p className="text-[12px] text-gray-500 font-bold mt-2.5 leading-relaxed">{t('marketRulesDesc')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Column */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-md shadow-xl shadow-black/[0.02] overflow-hidden flex flex-col">
                            <div className="p-8 space-y-8">
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-5 text-[14px] font-black border-r-4 border-red-500 rounded-md uppercase tracking-tight flex items-center gap-4">
                                        <Info size={20} />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-8">
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[13px] font-black text-black uppercase tracking-[0.15em] flex items-center gap-2">
                                            <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                                            {t('professionalTitle')} *
                                        </label>
                                        <input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className="bg-gray-50 border border-gray-200 p-5 text-[16px] font-black rounded-md outline-none focus:border-primary focus:bg-white transition-all shadow-inner uppercase tracking-tight placeholder:text-gray-300 placeholder:font-bold"
                                            placeholder={t('adTitlePlaceholder')}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="flex flex-col gap-3">
                                            <label className="text-[13px] font-black text-black uppercase tracking-[0.15em] flex items-center gap-2">
                                                <div className="w-1.5 h-4 bg-navy rounded-full"></div>
                                                {t('category')} *
                                            </label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                className="bg-gray-50 border border-gray-200 p-5 text-[15px] font-black rounded-md outline-none focus:border-primary focus:bg-white cursor-pointer transition-all shadow-inner uppercase tracking-tight"
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
                                        <div className="flex flex-col gap-3">
                                            <label className="text-[13px] font-black text-black uppercase tracking-[0.15em] flex items-center gap-2">
                                                <div className="w-1.5 h-4 bg-emerald rounded-full"></div>
                                                {t('askingPrice')} *
                                            </label>
                                            <input
                                                name="price"
                                                type="number"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                className="bg-gray-50 border border-gray-200 p-5 text-[16px] font-black rounded-md outline-none focus:border-primary focus:bg-white transition-all shadow-inner italic"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <label className="text-[13px] font-black text-black uppercase tracking-[0.15em] flex items-center gap-2">
                                            <div className="w-1.5 h-4 bg-amber rounded-full"></div>
                                            {t('deploymentLocation')} *
                                        </label>
                                        <div className="relative">
                                            <input
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-50 border border-gray-200 p-5 text-[16px] font-black rounded-md outline-none focus:border-primary focus:bg-white transition-all shadow-inner uppercase tracking-tight placeholder:text-gray-300"
                                                placeholder={t('locationPlaceholder')}
                                                required
                                            />
                                            <MapPin size={24} className="absolute right-5 top-5 text-primary opacity-30" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <label className="text-[13px] font-black text-black uppercase tracking-[0.15em] flex items-center gap-2">
                                            <div className="w-1.5 h-4 bg-black rounded-full"></div>
                                            {t('detailedBriefing')}
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={8}
                                            className="bg-gray-50 border border-gray-200 p-6 text-[16px] font-medium rounded-md outline-none focus:border-primary focus:bg-white transition-all shadow-inner resize-none leading-relaxed placeholder:text-gray-300"
                                            placeholder={t('descriptionPlaceholder')}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-gray-100 flex flex-col items-center">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary hover:bg-primary-hover text-white py-6 rounded-md text-[18px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 transition-all flex items-center justify-center gap-4 active:scale-95 group mb-6 border-b-8 border-primary-dark"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={24} /> : <PlusCircle size={24} className="group-hover:rotate-90 transition-transform" />}
                                        {loading ? t('loading') : t('deployListing')}
                                    </button>
                                    <div className="flex items-center gap-3 bg-gray-50 px-5 py-2 rounded-full border border-gray-100">
                                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">{t('secureProtocol')}</span>
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
