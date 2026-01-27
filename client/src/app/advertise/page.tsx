"use client";

import { ArrowLeft, Star, MessageCircle, Mail, Phone, Zap, CheckCircle2, Loader2, Send, Info } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useAuthStore } from '@/store/useAuthStore';
import { useState, useEffect, useCallback } from "react";
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

    const contactEmail = t('contactEmail');
    const contactPhone = t('contactPhone');
    const whatsappNumber = t('contactWhatsApp').replace('+', ''); // Without + for WhatsApp link

    const plans = [
        {
            name: t('basicPlan'),
            price: t('100SAR'),
            features: [
                t('featuredAd7Days'),
                t('topSearchResults'),
                t('highlightBadge'),
            ],
            duration: t('7Days'),
        },
        {
            name: t('premiumPlan'),
            price: t('250SAR'),
            features: [
                t('allBasicFeatures'),
                t('featuredAd30Days'),
                t('homepagePlacement'),
                t('detailedAnalytics'),
            ],
            duration: t('30Days'),
            popular: true
        },
        {
            name: t('vipPlan'),
            price: t('500SAR'),
            features: [
                t('allPreviousFeatures'),
                t('unlimitedAds'),
                t('topPriorityInSearch'),
                t('verifiedBadge'),
                t('dedicatedSupport'),
            ],
            duration: t('90Days'),
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
            alert(t('pleaseLoginFirst'));
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
                setMessage(t('requestSentSuccessfully'));
                setFormData({ name: '', email: '', phone: '', message: '' });
                setTimeout(() => setShowForm(false), 3000);
            } else {
                setMessage(`${t('error')}: ${result.error}`);
            }
        } catch (error) {
            setMessage(t('failedToSendRequest'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-bg flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Header />

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary to-primary-hover text-white py-8">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <Star className="w-12 h-12 mx-auto mb-3 animate-pulse" />
                    <h1 className="text-3xl md:text-4xl font-black mb-3 uppercase tracking-tight">
                        {t("advertiseWithUs")}
                    </h1>
                    <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
                        {t("increaseSalesReach")}
                    </p>
                </div>
            </section>

            <main className="max-w-6xl mx-auto px-4 py-8 flex-1">
                {/* Contact Info Banner */}
                <div className="bg-card-bg border border-border-color rounded-lg p-4 mb-8 shadow-sm">
                    <h2 className="text-xl font-black text-center mb-4 text-text-main">
                        {t("contactUsToSubscribe")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <a
                            href={`https://wa.me/${whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-saha-primary !flex !items-center !justify-center !gap-2 !px-4 !py-3 !text-sm"
                        >
                            <MessageCircle size={20} />
                            <span>{t("whatsapp")}</span>
                        </a>
                        <a
                            href={`mailto:${contactEmail}`}
                            className="btn-saha-primary !flex !items-center !justify-center !gap-2 !px-4 !py-3 !text-sm"
                        >
                            <Mail size={20} />
                            <span>{t("email")}</span>
                        </a>
                        <a
                            href={`tel:${contactPhone}`}
                            className="btn-saha-primary !flex !items-center !justify-center !gap-2 !px-4 !py-3 !text-sm"
                        >
                            <Phone size={20} />
                            <span>{t("call")}</span>
                        </a>
                    </div>
                    <p className="text-center mt-3 text-text-muted text-xs font-medium">
                        {t('contact')}: {contactPhone}
                    </p>
                </div>

                {/* Pricing Plans */}
                <h2 className="text-2xl font-black text-center mb-6 text-text-main">
                    {t("premiumAdPackages")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {plans.map((plan, index) => (
                        <div key={index} className={`depth-card p-6 relative flex flex-col ${plan.popular ? 'border-2 border-primary ring-2 ring-primary/10' : ''}`}>
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-0.5 rounded-full text-xs font-black uppercase tracking-wider">
                                    {t("mostPopular")}
                                </div>
                            )}

                            <div className="text-center mb-4">
                                <h3 className="text-xl font-black text-text-main mb-1">{plan.name}</h3>
                                <div className="text-3xl font-black text-primary mb-0.5">{plan.price}</div>
                                <div className="text-text-muted font-bold text-sm">{plan.duration}</div>
                            </div>

                            <ul className="space-y-2 mb-6 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                        <span className="text-text-muted font-medium text-xs">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="space-y-2">
                                <button
                                    onClick={() => openSubscriptionForm(plan)}
                                    className={`w-full py-2.5 rounded-lg font-bold transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary-hover text-sm uppercase tracking-wider`}
                                >
                                    <Zap size={16} />
                                    {t("subscribeNow")}
                                </button>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleWhatsAppContact(plan.name)}
                                        className="btn-saha-outline !py-2 !text-xs !flex !items-center !justify-center !gap-1"
                                    >
                                        <MessageCircle size={12} />
                                        {t("whatsapp")}
                                    </button>
                                    <button
                                        onClick={() => handleEmailContact(plan.name)}
                                        className="btn-saha-outline !py-2 !text-xs !flex !items-center !justify-center !gap-1"
                                    >
                                        <Mail size={12} />
                                        {t("email")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Subscription Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-solid-overlay">
                        <div className="bg-card-bg rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="bg-primary p-4 text-white relative">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="absolute top-3 right-3 hover:bg-primary/10 p-1 rounded-full transition-colors"
                                >
                                    <ArrowLeft size={20} className={language === 'ar' ? '' : 'rotate-180'} />
                                </button>
                                <h3 className="text-xl font-black">{t("subscriptionRequest")}</h3>
                                <p className="opacity-90 text-sm">{selectedPlan?.name} - {selectedPlan?.price}</p>
                            </div>

                            <form onSubmit={handleFormSubmit} className="p-4 space-y-3">
                                {message && (
                                    <div className={`p-3 rounded-lg text-xs font-bold ${message.includes('نجاح') || message.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {message}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-black text-text-muted mb-1 uppercase tracking-wider">{t("name")}</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full border border-border-color bg-gray-bg text-text-main p-2.5 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-text-muted mb-1 uppercase tracking-wider">{t("email")}</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full border border-border-color bg-gray-bg text-text-main p-2.5 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-text-muted mb-1 uppercase tracking-wider">{t("phone")}</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full border border-border-color bg-gray-bg text-text-main p-2.5 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-text-muted mb-1 uppercase tracking-wider">{t("messageOptional")}</label>
                                    <textarea
                                        rows={3}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full border border-border-color bg-gray-bg text-text-main p-2.5 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-white py-3 rounded-lg font-black uppercase tracking-widest hover:bg-primary-hover shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 text-sm"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                    {loading ? t("sending") : t("sendRequest")}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Benefits Section */}
                <div className="bg-card-bg rounded-lg p-6 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50"></div>
                    <Zap className="w-10 h-10 text-primary mx-auto mb-3 relative z-10" />
                    <h3 className="text-xl font-black mb-2 text-text-main relative z-10">
                        {t("whyPremiumAds")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 relative z-10">
                        <div className="bg-gray-bg rounded-md p-4">
                            <div className="text-3xl font-black text-primary mb-1">5x</div>
                            <p className="text-text-main font-bold text-sm">{t("moreViews")}</p>
                        </div>
                        <div className="bg-gray-bg rounded-md p-4">
                            <div className="text-3xl font-black text-primary mb-1">3x</div>
                            <p className="text-text-main font-bold text-sm">{t("moreContacts")}</p>
                        </div>
                        <div className="bg-gray-bg rounded-md p-4">
                            <div className="text-3xl font-black text-primary mb-1">10x</div>
                            <p className="text-text-main font-bold text-sm">{t("betterSales")}</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
