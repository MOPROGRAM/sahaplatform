"use client";

import { useState } from "react";
import { Camera, MapPin, Tag, Info, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function PostAdPage() {
    const [step, setStep] = useState(1);

    return (
        <div className="bg-[#f2f4f7] dark:bg-slate-950 min-h-screen py-8 px-4">
            <div className="max-w-[800px] mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <Link href="/" className="text-2xl font-black text-primary">SAHA</Link>
                    <div className="flex gap-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`w-8 h-1 rounded-full ${step >= i ? 'bg-primary' : 'bg-gray-300'}`}></div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Tag className="text-primary" />
                        <span>ماذا تود أن تبيع أو تعرض اليوم؟</span>
                    </h2>

                    <div className="space-y-6">
                        {/* Title & Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500">عنوان الإعلان</label>
                                <input
                                    className="bg-gray-50 dark:bg-slate-800 border-none outline-none p-3 text-sm rounded-sm focus:ring-1 ring-primary"
                                    placeholder="مثال: شقة للبيع في حي النرجس"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500">التصنيف الرئيسي</label>
                                <select className="bg-gray-50 dark:bg-slate-800 border-none outline-none p-3 text-sm rounded-sm focus:ring-1 ring-primary appearance-none">
                                    <option>اختر التصنيف</option>
                                    <option>عقارات</option>
                                    <option>وظائف</option>
                                    <option>سيارات</option>
                                </select>
                            </div>
                        </div>

                        {/* Price & Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500">السعر (ريال سعودي)</label>
                                <input
                                    type="number"
                                    className="bg-gray-50 dark:bg-slate-800 border-none outline-none p-3 text-sm rounded-sm focus:ring-1 ring-primary"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500">المدينة / الحي</label>
                                <div className="relative">
                                    <input
                                        className="w-full bg-gray-50 dark:bg-slate-800 border-none outline-none p-3 pr-10 text-sm rounded-sm focus:ring-1 ring-primary"
                                        placeholder="ابحث عن الموقع..."
                                    />
                                    <MapPin size={16} className="absolute right-3 top-3.5 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-500">تفاصيل الإعلان</label>
                            <textarea
                                rows={5}
                                className="bg-gray-50 dark:bg-slate-800 border-none outline-none p-3 text-sm rounded-sm focus:ring-1 ring-primary resize-none"
                                placeholder="اكتب وصفاً تفصيلياً لجذب المشترين..."
                            ></textarea>
                        </div>

                        {/* Image Upload Simulation */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-2 block">صور الإعلان (حتى 10 صور)</label>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                <div className="aspect-square bg-gray-50 dark:bg-slate-800 border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary group transition-colors">
                                    <Camera className="text-gray-400 group-hover:text-primary mb-1" size={24} />
                                    <span className="text-[10px] text-gray-400">إضافة صورة</span>
                                </div>
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="aspect-square bg-gray-100 dark:bg-slate-800 rounded-sm"></div>
                                ))}
                            </div>
                        </div>

                        {/* Premium Options */}
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                            <h3 className="text-sm font-bold mb-4">خيارات الترويج</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="border border-primary/20 bg-primary/5 p-4 rounded-sm relative cursor-pointer group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-black text-primary">إعلان عاجل</span>
                                            <p className="text-[11px] text-gray-500 mt-1">يظهر بتمييز أحمر لمدة 3 أيام</p>
                                        </div>
                                        <span className="text-sm font-bold text-primary">49 ريال</span>
                                    </div>
                                    <CheckCircle2 size={16} className="absolute -top-2 -left-2 text-primary bg-white rounded-full" />
                                </div>
                                <div className="border border-gray-100 dark:border-gray-800 p-4 rounded-sm cursor-pointer hover:border-primary transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-bold">إعلان مثبت</span>
                                            <p className="text-[11px] text-gray-400 mt-1">يظهر في أعلى قائمة البحث</p>
                                        </div>
                                        <span className="text-sm font-bold">99 ريال</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Terms & Submit */}
                        <div className="flex flex-col gap-4 mt-8">
                            <p className="text-[11px] text-gray-400 text-center">
                                بالنقر على "نشر الإعلان"، فإنك توافق على <Link href="/" className="text-primary underline">شروط الاستخدام</Link> وسياسة المحتوى.
                            </p>
                            <button className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-sm shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
                                نشر الإعلان الآن
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tips Box */}
                <div className="mt-8 bg-blue-50 dark:bg-slate-900/50 border border-blue-100 dark:border-slate-800 p-4 rounded-sm flex gap-3">
                    <Info className="text-blue-500 shrink-0" size={20} />
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-400">نصيحة "ساحة" للبيع السريع:</span>
                        <p className="text-[11px] text-blue-600/80 dark:text-blue-400/60 leading-relaxed">
                            الإعلانات التي تحتوي على أكثر من 5 صور واضحة ووصف مفصل تحصل على مشاهدات وتفاعل أكثر بنسبة 70%.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
