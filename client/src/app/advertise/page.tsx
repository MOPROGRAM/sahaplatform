"use client";

import Link from 'next/link';
import { ArrowLeft, Star, TrendingUp, Users, Eye, Zap } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';

export default function AdvertisePage() {
    const { language, t } = useLanguage();
    const { user } = useAuthStore();
    const router = useRouter();

    const plans = [
        {
            name: language === 'ar' ? 'الباقة الأساسية' : 'Basic Plan',
            price: '49 ر.س',
            features: [
                language === 'ar' ? 'إعلان مميز' : 'Featured Ad',
                language === 'ar' ? 'أيقونة تميز' : 'Highlight Icon',
                language === 'ar' ? 'إشعارات فورية' : 'Instant Notifications'
            ],
            duration: language === 'ar' ? '3 أيام' : '3 Days',
        },
        {
            name: language === 'ar' ? 'الباقة المتقدمة' : 'Premium Plan',
            price: '99 ر.س',
            features: [
                language === 'ar' ? 'جميع مميزات الباقة الأساسية' : 'All Basic Features',
                language === 'ar' ? 'ظهور في الأعلى' : 'Top Placement',
                language === 'ar' ? 'إحصائيات تفصيلية' : 'Detailed Analytics',
                language === 'ar' ? 'دعم فني' : 'Technical Support'
            ],
            duration: language === 'ar' ? '7 أيام' : '7 Days',
            popular: true
        },
        {
            name: language === 'ar' ? 'الباقة الذهبية' : 'Gold Plan',
            price: '199 ر.س',
            features: [
                language === 'ar' ? 'جميع مميزات الباقات السابقة' : 'All Previous Features',
                language === 'ar' ? 'إعلانات غير محدودة' : 'Unlimited Ads',
                language === 'ar' ? 'أولوية في البحث' : 'Search Priority',
                language === 'ar' ? 'شهادة موثوق' : 'Trusted Badge'
            ],
            duration: language === 'ar' ? '30 يوم' : '30 Days',
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

    const handleSubscription = async (plan: any) => {
        if (!user) {
            alert(language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
            router.push('/login');
            return;
        }

        try {
            const priceValue = parseFloat(plan.price.replace(/[^0-9.]/g, ''));
            const response = await apiService.post('/subscriptions', {
                planName: plan.name,
                price: priceValue
            });

            if (response && response.id) {
                alert(language === 'ar' ? 'تم الاشتراك بنجاح!' : 'Subscription active!');
                router.push('/dashboard');
            }
        } catch (error) {
            console.error("Subscription failed:", error);
            alert(language === 'ar' ? 'حدث خطأ أثناء تفعيل الاشتراك' : 'Failed to activate subscription');
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors">
                            <ArrowLeft className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                            <span className="font-bold">{t('home')}</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Star className="w-6 h-6 text-primary" />
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? 'أعلن معنا' : 'Advertise With Us'}
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary to-primary-hover text-white py-16">
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
                </div>
            </section>

            <main className="max-w-6xl mx-auto px-4 py-12">
                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 text-center transition-transform hover:scale-105">
                            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                                {benefit.icon}
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">{benefit.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
                        </div>
                    ))}
                </div>

                {/* Pricing Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <div key={index} className={`bg-white dark:bg-slate-900 rounded-xl shadow-lg border p-10 relative flex flex-col ${plan.popular ? 'border-primary ring-4 ring-primary/10' : 'border-gray-200 dark:border-gray-800'}`}>
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-1 rounded-full text-sm font-black uppercase tracking-wider">
                                    {language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                                <div className="text-4xl font-black text-primary mb-1">{plan.price}</div>
                                <div className="text-gray-500 font-bold">{plan.duration}</div>
                            </div>

                            <ul className="space-y-4 mb-10 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <Zap className="w-4 h-4 text-primary shrink-0" />
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSubscription(plan)}
                                className={`w-full py-4 rounded-sm font-black transition-all active:scale-95 ${plan.popular
                                    ? 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/30'
                                    : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700'
                                    }`}>
                                {language === 'ar' ? 'اختر الباقة' : 'Choose Plan'}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-20 bg-slate-900 rounded-2xl p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50"></div>
                    <Zap className="w-16 h-16 text-primary mx-auto mb-6 relative z-10" />
                    <h3 className="text-3xl font-black mb-4 text-white relative z-10">
                        {language === 'ar' ? 'ابدأ اليوم وشاهد الفرق' : 'Start Today and See the Difference'}
                    </h3>
                    <p className="text-gray-400 mb-10 text-lg max-w-2xl mx-auto relative z-10">
                        {language === 'ar'
                            ? 'انضم لآلاف التجار الناجحين الذين زادوا مبيعاتهم مع ساحة'
                            : 'Join thousands of successful merchants who increased their sales with Saha'
                        }
                    </p>
                    <Link
                        href="/post-ad"
                        className="inline-block bg-primary text-white px-10 py-4 rounded-sm font-black text-lg hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 relative z-10 active:scale-95"
                    >
                        {language === 'ar' ? 'أضف إعلانك الأول' : 'Post Your First Ad'}
                    </Link>
                </div>
            </main>
        </div>
    );
}