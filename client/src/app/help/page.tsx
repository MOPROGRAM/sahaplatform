"use client";

import Link from 'next/link';
import { ArrowLeft, HelpCircle, MessageSquare, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

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
        <div className="min-h-screen" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="glass-card border-b border-gray-200/50 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-bold">{t('home')}</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <HelpCircle className="w-6 h-6 text-primary" />
                            <h1 className="text-xl font-bold text-gray-900">
                                {language === 'ar' ? 'المساعدة والدعم' : 'Help & Support'}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Contact Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <div className="glass-card p-6 text-center">
                        <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 className="font-bold text-gray-900 mb-2">
                            {language === 'ar' ? 'الدردشة المباشرة' : 'Live Chat'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                            {language === 'ar' ? 'تحدث معنا مباشرة' : 'Chat with us directly'}
                        </p>
                        <button className="glass-button text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors" onClick={() => window.open('https://wa.me/96650000000', '_blank')}>
                            {language === 'ar' ? 'ابدأ المحادثة' : 'Start Chat'}
                        </button>
                    </div>

                    <div className="glass-card p-6 text-center">
                        <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 className="font-bold text-gray-900 mb-2">Email</h3>
                        <p className="text-gray-600 text-sm mb-4">
                            support@saha.com
                        </p>
                        <button className="glass-button text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors" onClick={() => window.location.href = 'mailto:support@saha.com'}>
                            {language === 'ar' ? 'أرسل بريد' : 'Send Email'}
                        </button>
                    </div>

                    <div className="glass-card p-6 text-center">
                        <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 className="font-bold text-gray-900 mb-2">
                            {language === 'ar' ? 'اتصل بنا' : 'Call Us'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                            +966 50 000 0000
                        </p>
                        <button className="glass-button text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors" onClick={() => window.location.href = 'tel:+96650000000'}>
                            {language === 'ar' ? 'اتصل الآن' : 'Call Now'}
                        </button>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="glass-card p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
                    </h2>

                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
                                <h3 className="font-bold text-gray-900 mb-3">{faq.question}</h3>
                                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Additional Help */}
                <div className="mt-8 glass-card p-6">
                    <div className="flex items-start gap-4">
                        <MapPin className="w-6 h-6 text-blue-600 mt-1" />
                        <div>
                            <h3 className="font-bold text-blue-900 mb-2">
                                {language === 'ar' ? 'مكتبنا الرئيسي' : 'Our Main Office'}
                            </h3>
                            <p className="text-blue-800">
                                {language === 'ar'
                                    ? 'الرياض، المملكة العربية السعودية'
                                    : 'Riyadh, Saudi Arabia'
                                }
                            </p>
                            <p className="text-blue-700 text-sm mt-1">
                                {language === 'ar'
                                    ? 'متوفرون للمساعدة من الأحد إلى الخميس، 9 صباحاً - 6 مساءً'
                                    : 'Available for help Sunday to Thursday, 9 AM - 6 PM'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}