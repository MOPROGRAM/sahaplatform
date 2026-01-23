"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Globe, Bell, Shield, User, Palette, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SettingsPage() {
    const { language, setLanguage, t, theme, toggleTheme } = useLanguage();
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const [notifications, setNotifications] = useState(true);
    const [emailUpdates, setEmailUpdates] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Profile update states
    const [showProfileUpdate, setShowProfileUpdate] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "",
        phone: "",
    });

    // Password change states
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [passwordData, setPasswordData] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        // Load user data
        setProfileData({
            name: user.name || "",
            phone: user.phone || "",
        });
    }, [user]);

    const handleProfileUpdate = async () => {
        if (!profileData.name.trim()) {
            setMessage(language === 'ar' ? "الاسم مطلوب" : "Name is required");
            return;
        }

        setLoading(true);
        setMessage("");
        try {
            const { error } = await supabase
                .from('User')
                .update({
                    name: profileData.name,
                    phone: profileData.phone || null,
                })
                .eq('id', user?.id);

            if (error) throw error;

            setMessage(language === 'ar' ? "تم تحديث الملف الشخصي بنجاح" : "Profile updated successfully");
            setShowProfileUpdate(false);

            // Refresh user data
            setTimeout(() => window.location.reload(), 1500);
        } catch (error: any) {
            console.error("Error updating profile:", error);
            setMessage(error.message || (language === 'ar' ? "فشل التحديث" : "Update failed"));
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwordData.newPassword.length < 6) {
            setMessage(language === 'ar' ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters");
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage(language === 'ar' ? "كلمات المرور غير متطابقة" : "Passwords don't match");
            return;
        }

        setLoading(true);
        setMessage("");
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (error) throw error;

            setMessage(language === 'ar' ? "تم تغيير كلمة المرور بنجاح" : "Password changed successfully");
            setShowPasswordChange(false);
            setPasswordData({ newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            console.error("Error changing password:", error);
            setMessage(error.message || (language === 'ar' ? "فشل تغيير كلمة المرور" : "Password change failed"));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            language === 'ar'
                ? "هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه!"
                : "Are you sure you want to delete your account? This action cannot be undone!"
        );

        if (!confirmed) return;

        setLoading(true);
        try {
            // Delete user's ads first
            await supabase
                .from('Ad')
                .delete()
                .eq('author_id', user?.id);

            // Delete user record
            await supabase
                .from('User')
                .delete()
                .eq('id', user?.id);

            // Sign out
            await supabase.auth.signOut();
            logout();
            router.push('/');
        } catch (error: any) {
            console.error("Error deleting account:", error);
            setMessage(error.message || (language === 'ar' ? "فشل حذف الحساب" : "Account deletion failed"));
        } finally {
            setLoading(false);
        }
    };

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

                {message && (
                    <div className={`mb-6 p-4 rounded-md ${message.includes('نجاح') || message.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message}
                    </div>
                )}

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

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {theme === 'light' ? <Sun size={18} className="text-primary" /> : <Moon size={18} className="text-primary" />}
                                    <div>
                                        <p className="font-semibold text-text-main">
                                            {language === 'ar' ? 'المظهر' : 'Theme'}
                                        </p>
                                        <p className="text-sm text-text-muted">
                                            {language === 'ar' ? 'فاتح أو داكن' : 'Light or dark mode'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className="btn-saha-outline !px-4 !py-2"
                                >
                                    {theme === 'light' ? (language === 'ar' ? 'فاتح' : 'Light') : (language === 'ar' ? 'داكن' : 'Dark')}
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
                            {!showPasswordChange && !showProfileUpdate && (
                                <>
                                    <button
                                        onClick={() => setShowPasswordChange(true)}
                                        className="btn-saha-outline w-full justify-center"
                                    >
                                        {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                                    </button>
                                    <button
                                        onClick={() => setShowProfileUpdate(true)}
                                        className="btn-saha-outline w-full justify-center"
                                    >
                                        {language === 'ar' ? 'تحديث الملف الشخصي' : 'Update Profile'}
                                    </button>
                                </>
                            )}

                            {showPasswordChange && (
                                <div className="space-y-3 p-4 bg-gray-50 rounded-md">
                                    <input
                                        type="password"
                                        placeholder={language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                        className="w-full p-3 border border-gray-200 rounded-md"
                                    />
                                    <input
                                        type="password"
                                        placeholder={language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        className="w-full p-3 border border-gray-200 rounded-md"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handlePasswordChange}
                                            disabled={loading}
                                            className="btn-saha-primary flex-1"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={16} /> : null}
                                            {language === 'ar' ? 'حفظ' : 'Save'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowPasswordChange(false);
                                                setPasswordData({ newPassword: "", confirmPassword: "" });
                                            }}
                                            className="btn-saha-outline"
                                        >
                                            {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {showProfileUpdate && (
                                <div className="space-y-3 p-4 bg-gray-50 rounded-md">
                                    <input
                                        type="text"
                                        placeholder={language === 'ar' ? 'الاسم' : 'Name'}
                                        value={profileData.name}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full p-3 border border-gray-200 rounded-md"
                                    />
                                    <input
                                        type="tel"
                                        placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full p-3 border border-gray-200 rounded-md"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleProfileUpdate}
                                            disabled={loading}
                                            className="btn-saha-primary flex-1"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={16} /> : null}
                                            {language === 'ar' ? 'حفظ' : 'Save'}
                                        </button>
                                        <button
                                            onClick={() => setShowProfileUpdate(false)}
                                            className="btn-saha-outline"
                                        >
                                            {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                        </button>
                                    </div>
                                </div>
                            )}
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
                            <button
                                onClick={handleDeleteAccount}
                                disabled={loading}
                                className="btn-saha-outline w-full justify-center text-red-600 border-red-200 hover:bg-red-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : null}
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
