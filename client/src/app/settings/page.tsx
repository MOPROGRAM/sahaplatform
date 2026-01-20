"use client";

import { useState } from "react";
import { Moon, Sun, Globe, Bell, Shield, User, Palette } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SettingsPage() {
    const { language, setLanguage, t } = useLanguage();
    const [notifications, setNotifications] = useState(true);
    const [emailUpdates, setEmailUpdates] = useState(false);

    return (
        <div className="min-h-screen bg-gray-bg flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Header />

            <main className="max-w-4xl mx-auto w-full p-4 flex-1">
                <div className="mb-6">
                    <h1 className="text-2xl font-black text-text-main uppercase tracking-tight">
                        {language === 'ar' ? 'الإعدادات' : 'Settings'}
                    </h1>
                    <p className="text-text-muted mt-2">
                        {language === 'ar' ? 'إدارة إعدادات حسابك وتفضيلاتك' : 'Manage your account settings and preferences'}
                    </p>
                </div>

                <div className="grid gap-6">
                    {/* Appearance Settings */}
                    <div className="saha-card">
                        <div className="flex items-center gap-3 mb-4">
                            <Palette className="text-primary" size={20} />
                            <h2 className="text-lg font-bold text-text-main">
                                {language === 'ar' ? 'المظهر' : 'Appearance'}
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Globe size={18} className="text-primary" />
                                    <div>
                                        <p className="font-semibold text-text-main">
                                            {language === 'ar' ? 'اللغة' : 'Language'}
                                        </p>
                                        <p className="text-sm text-text-muted">
                                            {language === 'ar' ? 'اختر لغة التطبيق' : 'Choose application language'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                                    className="btn-saha-primary !px-4 !py-2"
                                >
                                    {language === 'ar' ? 'العربية' : 'English'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notifications Settings */}
                    <div className="saha-card">
                        <div className="flex items-center gap-3 mb-4">
                            <Bell className="text-primary" size={20} />
                            <h2 className="text-lg font-bold text-text-main">
                                {language === 'ar' ? 'الإشعارات' : 'Notifications'}
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-text-main">
                                        {language === 'ar' ? 'إشعارات الدفع' : 'Push Notifications'}
                                    </p>
                                    <p className="text-sm text-text-muted">
                                        {language === 'ar' ? 'تلقي إشعارات حول العروض الجديدة' : 'Receive notifications about new offers'}
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={notifications}
                                        onChange={(e) => setNotifications(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-text-main">
                                        {language === 'ar' ? 'تحديثات البريد الإلكتروني' : 'Email Updates'}
                                    </p>
                                    <p className="text-sm text-text-muted">
                                        {language === 'ar' ? 'تلقي تحديثات عبر البريد الإلكتروني' : 'Receive updates via email'}
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={emailUpdates}
                                        onChange={(e) => setEmailUpdates(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Account Settings */}
                    <div className="saha-card">
                        <div className="flex items-center gap-3 mb-4">
                            <User className="text-primary" size={20} />
                            <h2 className="text-lg font-bold text-text-main">
                                {language === 'ar' ? 'الحساب' : 'Account'}
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <button className="btn-saha-outline w-full justify-center">
                                {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                            </button>
                            <button className="btn-saha-outline w-full justify-center">
                                {language === 'ar' ? 'تحديث الملف الشخصي' : 'Update Profile'}
                            </button>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="saha-card">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="text-primary" size={20} />
                            <h2 className="text-lg font-bold text-text-main">
                                {language === 'ar' ? 'الأمان' : 'Security'}
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <button className="btn-saha-outline w-full justify-center">
                                {language === 'ar' ? 'تفعيل المصادقة الثنائية' : 'Enable Two-Factor Authentication'}
                            </button>
                            <button className="btn-saha-outline w-full justify-center text-red-600 border-red-200 hover:bg-red-50">
                                {language === 'ar' ? 'حذف الحساب' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}