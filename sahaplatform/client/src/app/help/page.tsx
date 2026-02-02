"use client";

// export const runtime = 'edge';

import Link from 'next/link';
import { ArrowLeft, HelpCircle, MessageSquare, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HelpPage() {
    const { language, t } = useLanguage();

    const faqs = [
        {
            question: language === 'ar' ? "ط¸ئ’ط¸ظ¹ط¸ظ¾ ط·آ£ط·آ¶ط¸ظ¹ط¸ظ¾ ط·آ¥ط·آ¹ط¸â€‍ط·آ§ط¸â€  ط·آ¬ط·آ¯ط¸ظ¹ط·آ¯ط·ع؛" : "How do I post a new ad?",
            answer: language === 'ar'
                ? "ط·آ§ط·آ¶ط·ط›ط·آ· ط·آ¹ط¸â€‍ط¸â€° ط·آ²ط·آ± 'ط·آ£ط·آ¶ط¸ظ¾ ط·آ¥ط·آ¹ط¸â€‍ط·آ§ط¸â€ ' ط¸ظ¾ط¸ظ¹ ط·آ£ط·آ¹ط¸â€‍ط¸â€° ط·آ§ط¸â€‍ط·آµط¸ظ¾ط·آ­ط·آ© ط¸ث†ط·آ§ط·ع¾ط·آ¨ط·آ¹ ط·آ§ط¸â€‍ط·آ®ط·آ·ط¸ث†ط·آ§ط·ع¾ ط¸â€‍ط·آ¥ط·آ¯ط·آ®ط·آ§ط¸â€‍ ط·ع¾ط¸ظ¾ط·آ§ط·آµط¸ظ¹ط¸â€‍ ط·آ§ط¸â€‍ط·آ¥ط·آ¹ط¸â€‍ط·آ§ط¸â€ . ط·ع¾ط·آ£ط¸ئ’ط·آ¯ ط¸â€¦ط¸â€  ط·آ¥ط·آ¶ط·آ§ط¸ظ¾ط·آ© ط·آµط¸ث†ط·آ± ط¸ث†ط·آ§ط·آ¶ط·آ­ط·آ© ط¸ث†ط¸ث†ط·آµط¸ظ¾ ط¸â€¦ط¸ظ¾ط·آµط¸â€‍ ط¸â€‍ط·آ¬ط·آ°ط·آ¨ ط·آ§ط¸â€‍ط¸â€¦ط·آ´ط·ع¾ط·آ±ط¸ظ¹ط¸â€ ."
                : "Click the 'Post Ad' button at the top of the page and follow the steps to enter your ad details. Make sure to add clear images and detailed description to attract buyers."
        },
        {
            question: language === 'ar' ? "ط¸ئ’ط¸ظ¹ط¸ظ¾ ط·آ£ط·ع¾ط¸ث†ط·آ§ط·آµط¸â€‍ ط¸â€¦ط·آ¹ ط·آ§ط¸â€‍ط·آ¨ط·آ§ط·آ¦ط·آ¹ط·ع؛" : "How do I contact a seller?",
            answer: language === 'ar'
                ? "ط¸ظ¹ط¸â€¦ط¸ئ’ط¸â€ ط¸ئ’ ط·آ§ط¸â€‍ط·ع¾ط¸ث†ط·آ§ط·آµط¸â€‍ ط¸â€¦ط·آ¹ ط·آ§ط¸â€‍ط·آ¨ط·آ§ط·آ¦ط·آ¹ ط¸â€¦ط¸â€  ط·آ®ط¸â€‍ط·آ§ط¸â€‍ ط·آ²ط·آ± 'ط·آ§ط·ع¾ط·آµط¸â€‍' ط¸ظ¾ط¸ظ¹ ط·آµط¸ظ¾ط·آ­ط·آ© ط·ع¾ط¸ظ¾ط·آ§ط·آµط¸ظ¹ط¸â€‍ ط·آ§ط¸â€‍ط·آ¥ط·آ¹ط¸â€‍ط·آ§ط¸â€ . ط¸ظ¹ط¸â€¦ط¸ئ’ط¸â€ ط¸ئ’ ط·آ¥ط·آ±ط·آ³ط·آ§ط¸â€‍ ط·آ±ط·آ³ط·آ§ط¸â€‍ط·آ© ط¸â€¦ط·آ¨ط·آ§ط·آ´ط·آ±ط·آ© ط·آ£ط¸ث† ط·آ§ط¸â€‍ط·آ§ط·ع¾ط·آµط·آ§ط¸â€‍ ط·آ¨ط·آ§ط¸â€‍ط·آ±ط¸â€ڑط¸â€¦ ط·آ§ط¸â€‍ط¸â€¦ط·آ¹ط·آ±ط¸ث†ط·آ¶."
                : "You can contact the seller using the 'Contact' button on the ad details page. You can send a direct message or call the displayed number."
        },
        {
            question: language === 'ar' ? "ط¸â€¦ط·آ§ ط¸â€،ط¸ظ¹ ط·آ³ط¸ظ¹ط·آ§ط·آ³ط·آ© ط·آ§ط¸â€‍ط·آ¥ط·آ¹ط¸â€‍ط·آ§ط¸â€ ط·آ§ط·ع¾ ط·آ§ط¸â€‍ط¸â€¦ط¸â€¦ط¸ظ¹ط·آ²ط·آ©ط·ع؛" : "What is the featured ads policy?",
            answer: language === 'ar'
                ? "ط·آ§ط¸â€‍ط·آ¥ط·آ¹ط¸â€‍ط·آ§ط¸â€ ط·آ§ط·ع¾ ط·آ§ط¸â€‍ط¸â€¦ط¸â€¦ط¸ظ¹ط·آ²ط·آ© ط·ع¾ط·آ¸ط¸â€،ط·آ± ط¸ظ¾ط¸ظ¹ ط·آ£ط·آ¹ط¸â€‍ط¸â€° ط¸â€ڑط¸ث†ط·آ§ط·آ¦ط¸â€¦ ط·آ§ط¸â€‍ط·آ¨ط·آ­ط·آ« ط¸ث†ط·ع¾ط·آ­ط·آµط¸â€‍ ط·آ¹ط¸â€‍ط¸â€° ط¸â€¦ط·آ´ط·آ§ط¸â€،ط·آ¯ط·آ§ط·ع¾ ط·آ£ط¸ئ’ط·آ«ط·آ±. ط·ع¾ط¸ئ’ط¸â€‍ط¸ظ¾ط·آ© ط·آ§ط¸â€‍ط·ع¾ط·آ±ط¸â€ڑط¸ظ¹ط·آ© 50 ط·آ±ط¸ظ¹ط·آ§ط¸â€‍ ط·آ³ط·آ¹ط¸ث†ط·آ¯ط¸ظ¹ ط¸ث†ط·ع¾ط·آ³ط·ع¾ط¸â€¦ط·آ± ط¸â€‍ط¸â€¦ط·آ¯ط·آ© 30 ط¸ظ¹ط¸ث†ط¸â€¦ط·آ§ط¸â€¹."
                : "Featured ads appear at the top of search results and get more views. The upgrade costs 50 SAR and lasts for 30 days."
        },
        {
            question: language === 'ar' ? "ط¸ئ’ط¸ظ¹ط¸ظ¾ ط·آ£ط·آ­ط·آ°ط¸ظ¾ ط·آ¥ط·آ¹ط¸â€‍ط·آ§ط¸â€ ط¸ظ¹ط·ع؛" : "How do I delete my ad?",
            answer: language === 'ar'
                ? "ط¸ظ¹ط¸â€¦ط¸ئ’ط¸â€ ط¸ئ’ ط·آ­ط·آ°ط¸ظ¾ ط·آ¥ط·آ¹ط¸â€‍ط·آ§ط¸â€ ط¸ئ’ ط¸â€¦ط¸â€  ط·آ®ط¸â€‍ط·آ§ط¸â€‍ ط·آ§ط¸â€‍ط·آ°ط¸â€،ط·آ§ط·آ¨ ط·آ¥ط¸â€‍ط¸â€° 'ط·آ¥ط·آ¹ط¸â€‍ط·آ§ط¸â€ ط·آ§ط·ع¾ط¸ظ¹' ط¸ظ¾ط¸ظ¹ ط¸â€‍ط¸ث†ط·آ­ط·آ© ط·آ§ط¸â€‍ط·ع¾ط·آ­ط¸ئ’ط¸â€¦ط·إ’ ط·آ«ط¸â€¦ ط·آ§ط¸â€‍ط¸â€ ط¸â€ڑط·آ± ط·آ¹ط¸â€‍ط¸â€° 'ط·آ­ط·آ°ط¸ظ¾' ط·آ¨ط·آ¬ط·آ§ط¸â€ ط·آ¨ ط·آ§ط¸â€‍ط·آ¥ط·آ¹ط¸â€‍ط·آ§ط¸â€  ط·آ§ط¸â€‍ط¸â€¦ط·آ·ط¸â€‍ط¸ث†ط·آ¨."
                : "You can delete your ad by going to 'My Ads' in the dashboard, then clicking 'Delete' next to the desired ad."
        },
        {
            question: language === 'ar' ? "ط¸â€¦ط·آ§ ط¸â€،ط¸ظ¹ ط·آ´ط·آ±ط¸ث†ط·آ· ط·آ§ط¸â€‍ط·آ§ط·آ³ط·ع¾ط·آ®ط·آ¯ط·آ§ط¸â€¦ط·ع؛" : "What are the terms of use?",
            answer: language === 'ar'
                ? "ط¸ظ¹ط·آ¬ط·آ¨ ط·آ£ط¸â€  ط·ع¾ط¸ئ’ط¸ث†ط¸â€  ط·آ¬ط¸â€¦ط¸ظ¹ط·آ¹ ط·آ§ط¸â€‍ط·آ¥ط·آ¹ط¸â€‍ط·آ§ط¸â€ ط·آ§ط·ع¾ ط¸â€ڑط·آ§ط¸â€ ط¸ث†ط¸â€ ط¸ظ¹ط·آ© ط¸ث†ط·ط›ط¸ظ¹ط·آ± ط¸â€¦ط·آ³ط¸ظ¹ط·آ¦ط·آ©. ط¸â€ ط·آ­ط¸â€  ط¸â€ ط·آ­ط·ع¾ط¸ظ¾ط·آ¸ ط·آ¨ط·آ§ط¸â€‍ط·آ­ط¸â€ڑ ط¸ظ¾ط¸ظ¹ ط·آ­ط·آ°ط¸ظ¾ ط·آ£ط¸ظ¹ ط·آ¥ط·آ¹ط¸â€‍ط·آ§ط¸â€  ط¸ظ¹ط¸â€ ط·ع¾ط¸â€،ط¸ئ’ ط·آ´ط·آ±ط¸ث†ط·آ·ط¸â€ ط·آ§."
                : "All ads must be legal and non-offensive. We reserve the right to delete any ad that violates our terms."
        },
        {
            question: language === 'ar' ? "ط¸ئ’ط¸ظ¹ط¸ظ¾ ط·آ£ط·ط›ط¸ظ¹ط·آ± ط¸ئ’ط¸â€‍ط¸â€¦ط·آ© ط·آ§ط¸â€‍ط¸â€¦ط·آ±ط¸ث†ط·آ±ط·ع؛" : "How do I change my password?",
            answer: language === 'ar'
                ? "ط¸ظ¹ط¸â€¦ط¸ئ’ط¸â€ ط¸ئ’ ط·ع¾ط·ط›ط¸ظ¹ط¸ظ¹ط·آ± ط¸ئ’ط¸â€‍ط¸â€¦ط·آ© ط·آ§ط¸â€‍ط¸â€¦ط·آ±ط¸ث†ط·آ± ط¸â€¦ط¸â€  ط·آ®ط¸â€‍ط·آ§ط¸â€‍ ط·آ§ط¸â€‍ط·آ¥ط·آ¹ط·آ¯ط·آ§ط·آ¯ط·آ§ط·ع¾ > ط·آ§ط¸â€‍ط·آ­ط·آ³ط·آ§ط·آ¨ > ط·ع¾ط·ط›ط¸ظ¹ط¸ظ¹ط·آ± ط¸ئ’ط¸â€‍ط¸â€¦ط·آ© ط·آ§ط¸â€‍ط¸â€¦ط·آ±ط¸ث†ط·آ±."
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
                            {language === 'ar' ? 'ط·آ§ط¸â€‍ط¸â€¦ط·آ³ط·آ§ط·آ¹ط·آ¯ط·آ© ط¸ث†ط·آ§ط¸â€‍ط·آ¯ط·آ¹ط¸â€¦' : 'Help & Support'}
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
                            {language === 'ar' ? 'ط·آ§ط¸â€‍ط·آ¯ط·آ±ط·آ¯ط·آ´ط·آ© ط·آ§ط¸â€‍ط¸â€¦ط·آ¨ط·آ§ط·آ´ط·آ±ط·آ©' : 'Live Chat'}
                        </h3>
                        <p className="text-text-muted text-sm mb-4">
                            {language === 'ar' ? 'ط·ع¾ط·آ­ط·آ¯ط·آ« ط¸â€¦ط·آ¹ط¸â€ ط·آ§ ط¸â€¦ط·آ¨ط·آ§ط·آ´ط·آ±ط·آ©' : 'Chat with us directly'}
                        </p>
                        <button className="btn-saha-primary w-full py-2 rounded-lg text-sm" onClick={() => window.open('https://wa.me/96650000000', '_blank')}>
                            {language === 'ar' ? 'ط·آ§ط·آ¨ط·آ¯ط·آ£ ط·آ§ط¸â€‍ط¸â€¦ط·آ­ط·آ§ط·آ¯ط·آ«ط·آ©' : 'Start Chat'}
                        </button>
                    </div>

                    <div className="bento-card p-6 text-center group hover:border-primary transition-all">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Mail size={24} />
                        </div>
                        <h3 className="font-bold text-text-main mb-2">
                            {language === 'ar' ? 'ط·آ§ط¸â€‍ط·آ¨ط·آ±ط¸ظ¹ط·آ¯ ط·آ§ط¸â€‍ط·آ¥ط¸â€‍ط¸ئ’ط·ع¾ط·آ±ط¸ث†ط¸â€ ط¸ظ¹' : 'Email Support'}
                        </h3>
                        <p className="text-text-muted text-sm mb-4">
                            {language === 'ar' ? 'ط·آ±ط·آ§ط·آ³ط¸â€‍ط¸â€ ط·آ§ ط¸ظ¾ط¸ظ¹ ط·آ£ط¸ظ¹ ط¸ث†ط¸â€ڑط·ع¾' : 'Write to us anytime'}
                        </p>
                        <button className="btn-saha-primary w-full py-2 rounded-lg text-sm" onClick={() => window.location.href = 'mailto:support@saha.com'}>
                            {language === 'ar' ? 'ط·آ£ط·آ±ط·آ³ط¸â€‍ ط·آ¨ط·آ±ط¸ظ¹ط·آ¯' : 'Send Email'}
                        </button>
                    </div>

                    <div className="bento-card p-6 text-center group hover:border-primary transition-all">
                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Phone size={24} />
                        </div>
                        <h3 className="font-bold text-text-main mb-2">
                            {language === 'ar' ? 'ط·آ§ط·ع¾ط·آµط¸â€‍ ط·آ¨ط¸â€ ط·آ§' : 'Call Us'}
                        </h3>
                        <p className="text-text-muted text-sm mb-4">
                            {language === 'ar' ? 'ط·آ¯ط·آ¹ط¸â€¦ ط¸â€،ط·آ§ط·ع¾ط¸ظ¾ط¸ظ¹ ط¸â€¦ط·آ¨ط·آ§ط·آ´ط·آ±' : 'Live phone support'}
                        </p>
                        <button className="btn-saha-primary w-full py-2 rounded-lg text-sm" onClick={() => window.location.href = 'tel:+96650000000'}>
                            {language === 'ar' ? 'ط·آ§ط·ع¾ط·آµط¸â€‍ ط·آ§ط¸â€‍ط·آ¢ط¸â€ ' : 'Call Now'}
                        </button>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-black text-text-main mb-8 text-center uppercase tracking-tight">
                        {language === 'ar' ? 'ط·آ§ط¸â€‍ط·آ£ط·آ³ط·آ¦ط¸â€‍ط·آ© ط·آ§ط¸â€‍ط·آ´ط·آ§ط·آ¦ط·آ¹ط·آ©' : 'Frequently Asked Questions'}
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