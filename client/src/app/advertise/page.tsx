"use client";

import Link from 'next/link';
import { ArrowLeft, Star, TrendingUp, Users, Eye, Zap } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export default function AdvertisePage() {
    const { language, t } = useLanguage();

    const plans = [
        {
            name: language === 'ar' ? 'الباقة الأساسية' : 'Basic Plan',
            price: '49 ر.س',
            duration: language === 'ar' ? '3 أيام' : '3 Days',
            features: [
                language === 'ar' ? 'إعلان مميز' : 'Featured Ad',
                language === 'ar' ? 'أيقونة تميز' : 'Highlight Icon',
                language === 'ar' ? 'إشعارات فورية' : 'Instant Notifications'
            ]
        },
        {
            name: language === 'ar' ? 'الباقة المتقدمة' : 'Premium Plan',
            price: '99 ر.س',
            duration: language === 'ar' ? '7 أيام' : '7 Days',
            features: [
                language === 'ar' ? 'جميع مميزات الباقة الأساسية' : 'All Basic Features',
                language === 'ar' ? 'ظهور في الأعلى' : 'Top Placement',
                language === 'ar' ? 'إحصائيات تفصيلية' : 'Detailed Analytics',
                language === 'ar' ? 'دعم فني' : 'Technical Support'
            ],
            popular: true
        },
        {
            name: language === 'ar' ? 'الباقة الذهبية' : 'Gold Plan',
            price: '199 ر.س',
            duration: language === 'ar' ? '30 يوم' : '30 Days',
            features: [
                language === 'ar' ? 'جميع مميزات الباقات السابقة' : 'All Previous Features',
                language === 'ar' ? 'إعلانات غير محدودة' : 'Unlimited Ads',
                language === 'ar' ? 'أولوية في البحث' : 'Search Priority',
                language === 'ar' ? 'شهادة موثوق' : 'Trusted Badge'
            ]
        }
    ];

    const benefits = [
        {
            icon: <Eye className="w-6 h-6" />,
            title: language === 'ar' ? 'زيادة المشاهدات' : 'Increase Views',
            description: language === 'ar' ? 'حصل على 5x أكثر مشاهدات' : 'Get 5x more views'
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: language === 'ar' ? 'جمهور أوسع' : 'Wider Audience',
            description: language === 'ar' ? 'تواصل مع المزيد من العملاء' : 'Reach more customers'
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: language === 'ar' ? 'مبيعات أكبر' : 'Higher Sales',
            description: language === 'ar' ? 'زد من مبيعاتك بنسبة 300%' : 'Increase sales by 300%'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-bold">{t('home')}</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Star className="w-6 h-6 text-primary" />
                            <h1 className="text-xl font-bold text-gray-900">
                                {language === 'ar' ? 'أعلن معنا' : 'Advertise With Us'}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary to-primary-hover text-white py-16">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-4">
                        {language === 'ar' ? 'اجعل إعلانك مميزاً' : 'Make Your Ad Stand Out'}
                    </h2>
                    <p className="text-xl opacity-90 mb-8">
                        {language === 'ar'
                            ? 'زد من مبيعاتك ووصولك للعملاء مع باقات الترويج المتقدمة'
                            : 'Increase your sales and reach more customers with our advanced promotion packages'
                        }
                    </p>
                    <div className="flex items-center justify-center gap-8 text-lg">
                        <div className="flex items-center gap-2">
                            <Eye className="w-5 h-5" />
                            <span>5x {language === 'ar' ? 'المشاهدات' : 'Views'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            <span>3x {language === 'ar' ? 'العملاء' : 'Customers'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            <span>300% {language === 'ar' ? 'المبيعات' : 'Sales'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Benefits */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                {benefit.icon}
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                            <p className="text-gray-600">{benefit.description}</p>
                        </div>
                    ))}
                </div>

                {/* Pricing Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <div key={index} className={`bg-white rounded-xl shadow-sm border p-8 relative ${plan.popular ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'}`}>
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                                    {language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <div className="text-3xl font-bold text-primary mb-1">{plan.price}</div>
                                <div className="text-gray-600">{plan.duration}</div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        <span className="text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full py-3 rounded-lg font-bold transition-colors ${plan.popular
                                    ? 'bg-primary text-white hover:bg-primary-hover'
                                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                }`}>
                                {language === 'ar' ? 'اختر الباقة' : 'Choose Plan'}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-12 bg-gray-900 text-white rounded-xl p-8 text-center">
                    <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-4">
                        {language === 'ar' ? 'ابدأ اليوم وشاهد الفرق' : 'Start Today and See the Difference'}
                    </h3>
                    <p className="text-gray-300 mb-6">
                        {language === 'ar'
                            ? 'انضم لآلاف التجار الناجحين الذين زادوا مبيعاتهم مع ساحة'
                            : 'Join thousands of successful merchants who increased their sales with Saha'
                        }
                    </p>
                    <Link
                        href="/post-ad"
                        className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-hover transition-colors"
                    >
                        {language === 'ar' ? 'أضف إعلانك الأول' : 'Post Your First Ad'}
                    </Link>
                </div>
            </div>
        </div>
    );
}