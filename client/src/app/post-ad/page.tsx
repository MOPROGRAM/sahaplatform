import { useState } from "react";
import { Camera, MapPin, Tag, Info, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api";

export default function PostAdPage() {
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
            setError("يرجى ملء جميع الحقول المطلوبة");
            return;
        }

        setLoading(true);
        try {
            // In a real app, we'd handle images too, but for now we send the text data
            const response = await apiService.post('/ads', {
                ...formData,
                price: Number(formData.price),
                images: "[]", // Placeholder for images logic as we don't have a storage backend set up yet
            });

            if (response && response.id) {
                router.push(`/ads/view?id=${response.id}`);
            }
        } catch (err: any) {
            console.error("Failed to post ad:", err);
            setError("حدث خطأ أثناء نشر الإعلان. يرجى التأكد من تسجيل الدخول.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#f2f4f7] dark:bg-slate-950 min-h-screen py-8 px-4" dir="rtl">
            <div className="max-w-[800px] mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <Link href="/" className="text-2xl font-black text-primary">ساحة</Link>
                    <div className="text-xs font-bold text-gray-400">نشر إعلان جديد</div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Tag className="text-primary" />
                        <span>ماذا تود أن تبيع أو تعرض اليوم؟</span>
                    </h2>

                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-sm text-xs font-bold mb-6">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Title & Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500">عنوان الإعلان *</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 dark:bg-slate-800 border-none outline-none p-3 text-sm rounded-sm focus:ring-1 ring-primary"
                                    placeholder="مثال: شقة للبيع في حي النرجس"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500">التصنيف الرئيسي *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 dark:bg-slate-800 border-none outline-none p-3 text-sm rounded-sm focus:ring-1 ring-primary appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="">اختر التصنيف</option>
                                    <option value="realEstate">عقارات</option>
                                    <option value="jobs">وظائف</option>
                                    <option value="cars">سيارات</option>
                                    <option value="goods">سلع</option>
                                    <option value="services">خدمات</option>
                                    <option value="other">أخرى</option>
                                </select>
                            </div>
                        </div>

                        {/* Price & Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500">السعر (ريال سعودي) *</label>
                                <input
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 dark:bg-slate-800 border-none outline-none p-3 text-sm rounded-sm focus:ring-1 ring-primary"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500">المدينة / الحي *</label>
                                <div className="relative">
                                    <input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 dark:bg-slate-800 border-none outline-none p-3 pr-10 text-sm rounded-sm focus:ring-1 ring-primary"
                                        placeholder="مثال: الرياض، حي النرجس"
                                        required
                                    />
                                    <MapPin size={16} className="absolute right-3 top-3.5 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-500">تفاصيل الإعلان</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={5}
                                className="bg-gray-50 dark:bg-slate-800 border-none outline-none p-3 text-sm rounded-sm focus:ring-1 ring-primary resize-none"
                                placeholder="اكتب وصفاً تفصيلياً لجذب المشترين..."
                            ></textarea>
                        </div>

                        {/* Image Upload simulation */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-2 block">صور الإعلان (قريباً)</label>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 opacity-50 cursor-not-allowed">
                                <div className="aspect-square bg-gray-50 dark:bg-slate-800 border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                                    <Camera className="text-gray-400 mb-1" size={24} />
                                    <span className="text-[10px] text-gray-400">إضافة صورة</span>
                                </div>
                            </div>
                        </div>

                        {/* Terms & Submit */}
                        <div className="flex flex-col gap-4 mt-8">
                            <p className="text-[11px] text-gray-400 text-center">
                                بالنقر على "نشر الإعلان"، فإنك توافق على <Link href="/" className="text-primary underline">شروط الاستخدام</Link>.
                            </p>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-sm shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading && <Loader2 className="animate-spin" size={20} />}
                                {loading ? "جاري النشر..." : "نشر الإعلان الآن"}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Tips Box */}
                <div className="mt-8 bg-blue-50 dark:bg-slate-900/50 border border-blue-100 dark:border-slate-800 p-4 rounded-sm flex gap-3">
                    <Info className="text-blue-500 shrink-0" size={20} />
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-400">نصيحة "ساحة" للبيع السريع:</span>
                        <p className="text-[11px] text-blue-600/80 dark:text-blue-400/60 leading-relaxed">
                            تأكد من اختيار التصنيف الصحيح لتصل إلى الجمهور المستهدف بسرعة أكبر.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
