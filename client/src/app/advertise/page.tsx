"use client";

import Link from 'next/link';
import { ArrowLeft, Star, MessageCircle, Mail, Phone, Zap, CheckCircle2, Loader2, Send } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useAuthStore } from '@/store/useAuthStore';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AdvertisePage() {
    const { language, t } = useLanguage();
    const { user } = useAuthStore();

    const [showForm, setShowForm] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    const contactEmail = 'motwasel@yahoo.com';
    const contactPhone = '+966582003887';
    const whatsappNumber = '966582003887'; // Without + for WhatsApp link

    const plans = [
        {
            name: language === 'ar' ? 'الباقة الأساسية' : 'Basic Plan',
            price: language === 'ar' ? '100 ر.س' : '100 SAR',
            features: [
                language === 'ar' ? 'إعلان مميز لمدة 7 أيام' : 'Featured ad for 7 days',
                language === 'ar' ? 'ظهور في أعلى النتائج' : 'Top search results',
                language === 'ar' ? 'أيقونة تميز' : 'Highlight badge',
            ],
            duration: language === 'ar' ? '7 أيام' : '7 Days',
        },
        {
            name: language === 'ar' ? 'الباقة المميزة' : 'Premium Plan',
            price: language === 'ar' ? '250 ر.س' : '250 SAR',
            features: [
                language === 'ar' ? 'جميع مميزات الباقة الأساسية' : 'All Basic features',
                language === 'ar' ? 'إعلان مميز لمدة 30 يوم' : 'Featured ad for 30 days',
                language === 'ar' ? 'ظهور في الصفحة الرئيسية' : 'Homepage placement',
                language === 'ar' ? 'إحصائيات تفصيلية' : 'Detailed analytics',
            ],
            duration: language === 'ar' ? '30 يوم' : '30 Days',
            popular: true
        },
        {
            name: language === 'ar' ? 'الباقة الذهبية' : 'VIP Plan',
            price: language === 'ar' ? '500 ر.س' : '500 SAR',
            features: [
                language === 'ar' ? 'جميع مميزات الباقات السابقة' : 'All previous features',
                language === 'ar' ? 'إعلانات غير محدودة' : 'Unlimited ads',
                language === 'ar' ? 'أولوية قصوى في البحث' : 'Top priority in search',
                language === 'ar' ? 'شهادة موثوق' : 'Verified badge',
                language === 'ar' ? 'دعم فني مخصص' : 'Dedicated support',
            ],
            duration: language === 'ar' ? '90 يوم' : '90 Days',
        }
    ];

    const handleWhatsAppContact = (planName: string) => {
        const message = language === 'ar'
            ? `مرحباً، أرغب في الاشتراك في ${planName} للإعلانات المدفوعة`
            : `Hello, I would like to subscribe to ${planName} for premium ads`;
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleEmailContact = (planName: string) => {
        const subject = language === 'ar'
            ? `طلب اشتراك: ${planName}`
            : `Subscription Request: ${planName}`;
        const body = language === 'ar'
            ? `مرحباً،\n\nأرغب في الاشتراك في ${planName} للإعلانات المدفوعة.\n\nيرجى إرسال تفاصيل الدفع والخطوات التالية.\n\nشكراً`
            : `Hello,\n\nI would like to subscribe to ${planName} for premium ads.\n\nPlease send payment details and next steps.\n\nThank you`;
        window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const openSubscriptionForm = (plan: any) => {
        if (!user) {
            alert(language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
            window.location.href = '/login?redirect=/advertise';
            return;
        }
        setSelectedPlan(plan);
        setFormData({
            ...formData,
            name: user.name || '',
            email: user.email || '',
            phone: (user as any).phone || ''
        });
        setShowForm(true);
        setMessage('');
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userName: formData.name,
                    userEmail: formData.email,
                    userPhone: formData.phone,
                    packageName: selectedPlan.name,
                    packagePrice: selectedPlan.price,
                    message: formData.message,
                    userId: user?.id
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage(language === 'ar'
                    ? 'تم إرسال طلبك بنجاح! سنتواصل معك قريباً.'
                    : 'Your request has been sent successfully! We will contact you soon.');
                setFormData({ name: '', email: '', phone: '', message: '' });
                setTimeout(() => setShowForm(false), 3000);
            } else {
                setMessage(language === 'ar' ? `خطأ: ${result.error}` : `Error: ${result.error}`);
            }
        } catch (error) {
            setMessage(language === 'ar' ? 'فشل في إرسال الطلب. يرجى المحاولة لاحقاً.' : 'Failed to send request. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Header />

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary to-emerald text-white py-16">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <Star className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                    <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tight">
                        {language === 'ar' ? 'أعلن معنا' : 'Advertise With Us'}
                    </h1>
                    <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                        {language === 'ar'
                            ? 'زد من مبيعاتك ووصولك للعملاء مع باقات الترويج المتقدمة'
                            : 'Increase your sales and reach more customers with our advanced promotion packages'
                        }
                    </p>
                </div>
            </section>

            <main className="max-w-6xl mx-auto px-4 py-12 flex-1">
                {/* Contact Info Banner */}
                <div className="bg-white border-2 border-primary rounded-lg p-6 mb-12 shadow-xl">
                    <h2 className="text-2xl font-black text-center mb-6 text-gray-900">
                        {language === 'ar' ? 'للاشتراك تواصل معنا' : 'Contact Us to Subscribe'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a
                            href={`https://wa.me/${whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 bg-green-500 text-white px-6 py-4 rounded-lg font-bold hover:bg-green-600 transition-all shadow-lg hover:shadow-xl active:scale-95"
                        >
                            <MessageCircle size={24} />
                            <span>{language === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                        </a>
                        <a
                            href={`mailto:${contactEmail}`}
                            className="flex items-center justify-center gap-3 bg-blue-500 text-white px-6 py-4 rounded-lg font-bold hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl active:scale-95"
                        >
                            <Mail size={24} />
                            <span>{language === 'ar' ? 'بريد إلكتروني' : 'Email'}</span>
                        </a>
                        <a
                            href={`tel:${contactPhone}`}
                            className="flex items-center justify-center gap-3 bg-primary text-white px-6 py-4 rounded-lg font-bold hover:bg-primary-hover transition-all shadow-lg hover:shadow-xl active:scale-95"
                        >
                            <Phone size={24} />
                            <span>{language === 'ar' ? 'اتصال' : 'Call'}</span>
                        </a>
                    </div>
                    <p className="text-center mt-4 text-gray-600 font-medium">
                        {language === 'ar' ? 'رقم التواصل: ' : 'Contact: '}{contactPhone}
                    </p>
                </div>

                {/* Pricing Plans */}
                <h2 className="text-3xl font-black text-center mb-8 text-gray-900">
                    {language === 'ar' ? 'باقات الإعلانات المدفوعة' : 'Premium Ad Packages'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {plans.map((plan, index) => (
                        <div key={index} className={`bg-white rounded-xl shadow-lg border-2 p-8 relative flex flex-col ${plan.popular ? 'border-primary ring-4 ring-primary/10 transform scale-105' : 'border-gray-200'}`}>
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-1 rounded-full text-sm font-black uppercase tracking-wider">
                                    {language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-black text-gray-900 mb-2">{plan.name}</h3>
                                <div className="text-4xl font-black text-primary mb-1">{plan.price}</div>
                                <div className="text-gray-500 font-bold">{plan.duration}</div>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                        <span className="text-gray-700 font-medium text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="space-y-2">
                                <button
                                    onClick={() => openSubscriptionForm(plan)}
                                    className={`w-full py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 ${plan.popular ? 'bg-primary text-white hover:bg-primary-hover' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
                                >
                                    <Zap size={18} />
                                    {language === 'ar' ? 'اشترك الآن' : 'Subscribe Now'}
                                </button>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleWhatsAppContact(plan.name)}
                                        className="bg-green-500 text-white py-2 rounded-lg font-bold hover:bg-green-600 transition-all text-xs flex items-center justify-center gap-1"
                                    >
                                        <MessageCircle size={14} />
                                        {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                                    </button>
                                    <button
                                        onClick={() => handleEmailContact(plan.name)}
                                        className="bg-blue-500 text-white py-2 rounded-lg font-bold hover:bg-blue-600 transition-all text-xs flex items-center justify-center gap-1"
                                    >
                                        <Mail size={14} />
                                        {language === 'ar' ? 'بريد' : 'Email'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Subscription Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-solid-overlay">
                        <div className="bg-card rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="bg-primary p-6 text-white relative">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="absolute top-4 right-4 hover:bg-primary/10 p-1 rounded-full transition-colors"
                                >
                                    <ArrowLeft size={24} className={language === 'ar' ? '' : 'rotate-180'} />
                                </button>
                                <h3 className="text-2xl font-black">{language === 'ar' ? 'طلب اشتراك' : 'Subscription Request'}</h3>
                                <p className="opacity-90">{selectedPlan?.name} - {selectedPlan?.price}</p>
                            </div>

                            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                                {message && (
                                    <div className={`p-4 rounded-lg text-sm font-bold ${message.includes('نجاح') || message.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {message}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-1 uppercase tracking-wider">{language === 'ar' ? 'الاسم' : 'Name'}</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-1 uppercase tracking-wider">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-1 uppercase tracking-wider">{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-1 uppercase tracking-wider">{language === 'ar' ? 'رسالة (اختياري)' : 'Message (Optional)'}</label>
                                    <textarea
                                        rows={3}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-white py-4 rounded-lg font-black uppercase tracking-widest hover:bg-primary-hover shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                    {loading ? (language === 'ar' ? 'جارٍ الإرسال...' : 'Sending...') : (language === 'ar' ? 'إرسال الطلب' : 'Send Request')}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Benefits Section */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50"></div>
                    <Zap className="w-16 h-16 text-primary mx-auto mb-6 relative z-10" />
                    <h3 className="text-3xl font-black mb-4 text-white relative z-10">
                        {language === 'ar' ? 'لماذا الإعلانات المدفوعة؟' : 'Why Premium Ads?'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 relative z-10">
                        <div className="bg-white rounded-lg p-6">
                            <div className="text-4xl font-black text-primary mb-2">5x</div>
                            <p className="text-black font-bold">{language === 'ar' ? 'زيادة في المشاهدات' : 'More Views'}</p>
                        </div>
                        <div className="bg-white rounded-lg p-6">
                            <div className="text-4xl font-black text-primary mb-2">3x</div>
                            <p className="text-black font-bold">{language === 'ar' ? 'زيادة في التواصل' : 'More Contacts'}</p>
                        </div>
                        <div className="bg-white rounded-lg p-6">
                            <div className="text-4xl font-black text-primary mb-2">10x</div>
                            <p className="text-black font-bold">{language === 'ar' ? 'فرص بيع أكبر' : 'Better Sales'}</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
