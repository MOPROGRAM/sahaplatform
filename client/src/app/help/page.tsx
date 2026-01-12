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
                ? "اضغط على زر 'أضف إعلان' في أعلى الصفحة واتبع الخطوات لإدخال تفاصيل الإعلان."
                : "Click the 'Post Ad' button at the top of the page and follow the steps to enter your ad details."
        },
        {
            question: language === 'ar' ? "كيف أتواصل مع البائع؟" : "How do I contact a seller?",
            answer: language === 'ar'
                ? "يمكنك التواصل مع البائع من خلال زر 'اتصل' في صفحة تفاصيل الإعلان."
                : "You can contact the seller using the 'Contact' button on the ad details page."
        },
        {
            question: language === 'ar' ? "ما هي سياسة الإعلانات المميزة؟" : "What is the featured ads policy?",
            answer: language === 'ar'
                ? "الإعلانات المميزة تظهر في أعلى قوائم البحث وتحصل على مشاهدات أكثر."
                : "Featured ads appear at the top of search results and get more views."
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                        <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 className="font-bold text-gray-900 mb-2">
                            {language === 'ar' ? 'الدردشة المباشرة' : 'Live Chat'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                            {language === 'ar' ? 'تحدث معنا مباشرة' : 'Chat with us directly'}
                        </p>
                        <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
                            {language === 'ar' ? 'ابدأ المحادثة' : 'Start Chat'}
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                        <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 className="font-bold text-gray-900 mb-2">Email</h3>
                        <p className="text-gray-600 text-sm mb-4">
                            support@saha.com
                        </p>
                        <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
                            {language === 'ar' ? 'أرسل بريد' : 'Send Email'}
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                        <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 className="font-bold text-gray-900 mb-2">
                            {language === 'ar' ? 'اتصل بنا' : 'Call Us'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                            +966 50 000 0000
                        </p>
                        <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
                            {language === 'ar' ? 'اتصل الآن' : 'Call Now'}
                        </button>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
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
                <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
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