"use client";

import Link from 'next/link';
import { ArrowLeft, HelpCircle, MessageSquare, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HelpPage() {
    const { language, t } = useLanguage();

    const faqs = [
        {
            question: language === 'ar' ? "كيف أضيف إعلان جديد؟" : "How do I post a new ad?",
            answer: language === 'ar'
                ? "اضغط على زر 'أضف إعلان' في أعلى الصفحة واتبع الخطوات لإدخال تفاصيل الإعلان. تأكد من إضافة صور واضحة ووصف مفصل لجذب المشترين."
                : "Click the 'Post Ad' button at the top of the page and follow the steps to enter your ad details. Make sure to add clear images and detailed description to attract buyers."
        },
        {
            question: language === 'ar' ? "كيف أتواصل مع البائع؟" : "How do I contact a seller?",
            answer: language === 'ar'
                ? "يمكنك التواصل مع البائع من خلال زر 'اتصل' في صفحة تفاصيل الإعلان. يمكنك إرسال رسالة مباشرة أو الاتصال بالرقم المعروض."
                : "You can contact the seller using the 'Contact' button on the ad details page. You can send a direct message or call the displayed number."
        },
        {
            question: language === 'ar' ? "ما هي سياسة الإعلانات المميزة؟" : "What is the featured ads policy?",
            answer: language === 'ar'
                ? "الإعلانات المميزة تظهر في أعلى قوائم البحث وتحصل على مشاهدات أكثر. تكلفة الترقية 50 ريال سعودي وتستمر لمدة 30 يوماً."
                : "Featured ads appear at the top of search results and get more views. The upgrade costs 50 SAR and lasts for 30 days."
        },
        {
            question: language === 'ar' ? "كيف أحذف إعلاني؟" : "How do I delete my ad?",
            answer: language === 'ar'
                ? "يمكنك حذف إعلانك من خلال الذهاب إلى 'إعلاناتي' في لوحة التحكم، ثم النقر على 'حذف' بجانب الإعلان المطلوب."
                : "You can delete your ad by going to 'My Ads' in the dashboard, then clicking 'Delete' next to the desired ad."
        },
        {
            question: language === 'ar' ? "ما هي شروط الاستخدام؟" : "What are the terms of use?",
            answer: language === 'ar'
                ? "يجب أن تكون جميع الإعلانات قانونية وغير مسيئة. نحن نحتفظ بالحق في حذف أي إعلان ينتهك شروطنا."
                : "All ads must be legal and non-offensive. We reserve the right to delete any ad that violates our terms."
        },
        {
            question: language === 'ar' ? "كيف أغير كلمة المرور؟" : "How do I change my password?",
            answer: language === 'ar'
                ? "يمكنك تغيير كلمة المرور من خلال الإعدادات > الحساب > تغيير كلمة المرور."
                : "You can change your password through Settings > Account > Change Password."
        }
    ];

    return (
        <div className="bg-gray-bg min-h-screen flex flex-col">
            <Header />

            <main className="max-w-[1920px] mx-auto w-full p-4 flex-1">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className={language === 'ar' ? '' : 'rotate-180'} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-text-main uppercase tracking-tight">
                            {language === 'ar' ? 'المساعدة والدعم' : 'Help & Support'}
                        </h1>
                        <p className="text-text-muted text-sm mt-1">{t('siteName')} Assistance Portal</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bento-card p-6 text-center group hover:border-primary transition-all">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <MessageSquare size={24} />
                        </div>
                        <h3 className="font-bold text-text-main mb-2">
                            {language === 'ar' ? 'الدردشة المباشرة' : 'Live Chat'}
                        </h3>
                        <p className="text-text-muted text-sm mb-4">
                            {language === 'ar' ? 'تحدث معنا مباشرة' : 'Chat with us directly'}
                        </p>
                        <Link href="/messages" className="btn-saha-primary w-full py-2 rounded-lg text-sm inline-block">
                            {language === 'ar' ? 'ابدأ المحادثة' : 'Start Chat'}
                        </Link>
                    </div>

                    <div className="bento-card p-6 text-center group hover:border-primary transition-all">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Mail size={24} />
                        </div>
                        <h3 className="font-bold text-text-main mb-2">
                            {language === 'ar' ? 'البريد الإلكتروني' : 'Email Support'}
                        </h3>
                        <p className="text-text-muted text-sm mb-4">
                            {language === 'ar' ? 'راسلنا في أي وقت' : 'Write to us anytime'}
                        </p>
                        <button className="btn-saha-primary w-full py-2 rounded-lg text-sm" onClick={() => window.location.href = 'mailto:support@saha.com'}>
                            {language === 'ar' ? 'أرسل بريد' : 'Send Email'}
                        </button>
                    </div>

                    <div className="bento-card p-6 text-center group hover:border-primary transition-all">
                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Phone size={24} />
                        </div>
                        <h3 className="font-bold text-text-main mb-2">
                            {language === 'ar' ? 'اتصل بنا' : 'Call Us'}
                        </h3>
                        <p className="text-text-muted text-sm mb-4">
                            {language === 'ar' ? 'دعم هاتفي مباشر' : 'Live phone support'}
                        </p>
                        <button className="btn-saha-primary w-full py-2 rounded-lg text-sm" onClick={() => window.location.href = 'tel:+96650000000'}>
                            {language === 'ar' ? 'اتصل الآن' : 'Call Now'}
                        </button>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-black text-text-main mb-8 text-center uppercase tracking-tight">
                        {language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bento-card p-6 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors cursor-default">
                                <h3 className="font-black text-text-main mb-3 flex items-start gap-3">
                                    <HelpCircle size={18} className="text-primary shrink-0 mt-0.5" />
                                    {faq.question}
                                </h3>
                                <p className="text-text-muted text-sm leading-relaxed pr-7">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
