"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import {
    User,
    Settings,
    Package,
    MessageSquare,
    Heart,
    ShieldCheck,
    Trash2,
    Eye,
    MapPin,
    Calendar,
    Loader2,
    CheckCircle,
    AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { adsService, Ad } from "@/lib/ads";
import Header from "@/components/Header";
import Footer from "@/components/Footer";



export default function ProfilePage() {
    const { user, logout } = useAuthStore();
    const { language, t } = useLanguage();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [updateMessage, setUpdateMessage] = useState('');

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (activeTab === 'listings') {
            fetchUserAds();
        } else {
            setLoading(false);
        }
    }, [user, activeTab, router]);

    const fetchUserAds = async () => {
        try {
            const data = await adsService.getMyAds();
            setAds(data as any);
        } catch (error) {
            console.error('Failed to fetch user ads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        setUpdateMessage('');

        try {
            if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
                setUpdateMessage(language === 'ar' ? 'كلمة المرور غير متطابقة' : 'Passwords do not match');
                return;
            }

            const updateData = {
                name: profileData.name,
                email: profileData.email,
                ...(profileData.newPassword && {
                    currentPassword: profileData.currentPassword,
                    newPassword: profileData.newPassword
                })
            };

            // TODO: Implement profile update with Supabase
            alert(language === 'ar' ? 'ميزة تحديث الملف الشخصي ستكون متاحة قريباً' : 'Profile update coming soon');
            setUpdateMessage(language === 'ar' ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully');

            // Clear password fields
            setProfileData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (error: any) {
            setUpdateMessage(error.message || (language === 'ar' ? 'فشل في تحديث الملف الشخصي' : 'Failed to update profile'));
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deleteConfirm) {
            setDeleteConfirm(true);
            return;
        }

        setDeleting(true);
        try {
            // TODO: Implement account deletion with Supabase
            logout();
            router.push('/');
        } catch (error) {
            console.error('Failed to delete account:', error);
            alert(language === 'ar' ? 'فشل في حذف الحساب' : 'Failed to delete account');
        } finally {
            setDeleting(false);
            setDeleteConfirm(false);
        }
    };

    const handleDeleteAd = async (id: string) => {
        if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الإعلان؟' : 'Are you sure you want to delete this ad?')) {
            return;
        }

        try {
            await adsService.deleteAd(id);
            alert(language === 'ar' ? 'تم حذف الإعلان بنجاح' : 'Ad deleted successfully');
            fetchUserAds();
        } catch (error) {
            console.error('Failed to delete ad:', error);
            alert(language === 'ar' ? 'فشل في حذف الإعلان' : 'Failed to delete ad');
        }
    };

    if (!user) return null;

    const tabs = [
        { id: 'overview', label: language === 'ar' ? 'نظرة عامة' : 'Overview', icon: <User size={14} /> },
        { id: 'listings', label: language === 'ar' ? 'إعلاناتي' : 'My Listings', icon: <Package size={14} /> },
        { id: 'settings', label: language === 'ar' ? 'الإعدادات' : 'Settings', icon: <Settings size={14} /> },
    ];

    if (user.userType === 'PROVIDER') {
        tabs.splice(1, 0, { id: 'services', label: language === 'ar' ? 'خدماتي' : 'My Services', icon: <ShieldCheck size={14} /> });
    } else {
        tabs.splice(1, 0, { id: 'favorites', label: language === 'ar' ? 'المفضلة' : 'Favorites', icon: <Heart size={14} /> });
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-bg text-text-main">
            <Header />

            <div className="max-w-[1920px] mx-auto w-full flex-1 flex flex-col md:flex-row gap-4 p-4">
                {/* Left Sidebar */}
                <aside className="w-full md:w-56 space-y-3 shrink-0">
                    <div className="bg-card border border-border-color p-5 rounded-sm shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform"></div>
                        <div className="relative z-10 text-center">
                            <div className="w-14 h-14 bg-card border border-primary/20 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
                                <span className="text-lg font-black text-primary italic">{user.name?.substring(0, 2).toUpperCase()}</span>
                            </div>
                            <h4 className="text-[12px] font-black text-text-main uppercase tracking-tight truncate">{user.name}</h4>
                            <div className="flex items-center justify-center gap-1 mt-1 text-primary">
                                <ShieldCheck size={12} className="fill-primary/10" />
                                <span className="text-[8px] font-black uppercase tracking-widest">
                                    {user.userType === 'PROVIDER' ? (language === 'ar' ? 'مقدم خدمة' : 'PROVIDER') : (language === 'ar' ? 'باحث' : 'SEEKER')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <nav className="bg-card border border-border-color rounded-sm overflow-hidden shadow-sm">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b border-border-color last:border-0 transition-all ${activeTab === tab.id
                                    ? 'text-primary bg-primary/10 border-r-2 border-r-primary'
                                    : 'text-text-muted hover:bg-card hover:text-text-main'
                                    }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col gap-4">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-card border border-border-color p-6 rounded-sm shadow-sm">
                                <h3 className="text-lg font-black text-secondary uppercase tracking-tight mb-4">
                                    {language === 'ar' ? 'معلومات الحساب' : 'Account Information'}
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black text-text-muted uppercase tracking-widest">
                                            {language === 'ar' ? 'الاسم' : 'Name'}
                                        </span>
                                        <span className="text-[13px] font-bold text-secondary">{user.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black text-text-muted uppercase tracking-widest">
                                            {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                                        </span>
                                        <span className="text-[13px] font-bold text-secondary">{user.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black text-text-muted uppercase tracking-widest">
                                            {language === 'ar' ? 'نوع الحساب' : 'Account Type'}
                                        </span>
                                        <span className="text-[13px] font-bold text-primary uppercase">
                                            {user.userType === 'PROVIDER' ? (language === 'ar' ? 'مقدم خدمة' : 'Provider') : (language === 'ar' ? 'باحث' : 'Seeker')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black text-text-muted uppercase tracking-widest">
                                            {language === 'ar' ? 'تاريخ الانضمام' : 'Joined'}
                                        </span>
                                        <span className="text-[13px] font-bold text-secondary">
                                            {new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
                                <h3 className="text-lg font-black text-secondary uppercase tracking-tight mb-4">
                                    {language === 'ar' ? 'الإحصائيات' : 'Statistics'}
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-card rounded-sm">
                                        <div className="text-2xl font-black text-primary">0</div>
                                        <div className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                                            {language === 'ar' ? 'الإعلانات' : 'Ads'}
                                        </div>
                                    </div>
                                    <div className="text-center p-3 bg-card rounded-sm">
                                        <div className="text-2xl font-black text-primary">0</div>
                                        <div className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                                            {language === 'ar' ? 'المشاهدات' : 'Views'}
                                        </div>
                                    </div>
                                    <div className="text-center p-3 bg-card rounded-sm">
                                        <div className="text-2xl font-black text-primary">0</div>
                                        <div className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                                            {language === 'ar' ? 'الرسائل' : 'Messages'}
                                        </div>
                                    </div>
                                    <div className="text-center p-3 bg-card rounded-sm">
                                        <div className="text-2xl font-black text-primary">0</div>
                                        <div className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                                            {language === 'ar' ? 'المفضلة' : 'Favorites'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Listings/Services Tab */}
                    {(activeTab === 'listings' || activeTab === 'services') && (
                        <div className="bg-card border border-border-color rounded-sm shadow-sm overflow-hidden flex-1 flex flex-col">
                            <div className="px-4 py-3 bg-card border-b border-border-color flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package size={14} className="text-primary" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-text-main">
                                        {activeTab === 'services' ? (language === 'ar' ? 'خدماتي' : 'My Services') : (language === 'ar' ? 'إعلاناتي' : 'My Listings')}
                                    </h3>
                                </div>
                                <Link href="/post-ad" className="bg-primary text-white text-[9px] font-black px-3 py-1.5 rounded-xs flex items-center gap-2 hover:bg-primary-hover shadow-lg shadow-primary/20 active:scale-95 transition-all">
                                    <Package size={12} /> {language === 'ar' ? 'إضافة جديد' : 'Add New'}
                                </Link>
                            </div>

                            <div className="overflow-x-auto flex-1">
                                {loading ? (
                                    <div className="h-48 flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
                                ) : ads.length > 0 ? (
                                    <table className="w-full text-[10px] border-collapse">
                                        <thead>
                                            <tr className="bg-card/60 text-text-muted font-black uppercase text-[8px] tracking-widest border-b border-border-color">
                                                <th className="px-6 py-3 text-left">{language === 'ar' ? 'التفاصيل' : 'Details'}</th>
                                                <th className="px-6 py-3 text-center">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                                                <th className="px-6 py-3 text-center">{language === 'ar' ? 'المشاهدات' : 'Views'}</th>
                                                <th className="px-6 py-3 text-right">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {ads.map(ad => (
                                                <tr key={ad.id} className="hover:bg-primary/[0.02] transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 bg-card border border-border-color rounded-xs flex items-center justify-center shrink-0 shadow-inner group-hover:border-primary/20 transition-colors">
                                                                <Package size={16} className="text-text-muted group-hover:text-primary transition-colors" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <span className="font-black text-secondary block truncate group-hover:text-primary transition-colors uppercase tracking-tight">{ad.title}</span>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="text-primary font-black italic">{ad.price} SAR</span>
                                                                    <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                                                    <span className="text-[8px] font-black text-text-muted uppercase tracking-tighter">{ad.category}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest shadow-sm ${ad.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                                                            {ad.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'معطل' : 'Inactive')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-[13px] font-black text-secondary">{ad.views || 0}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link href={`/ads/view?id=${ad.id}`} title={language === 'ar' ? 'عرض' : 'View'} className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-xs hover:bg-secondary hover:text-white transition-all">
                                                                <Eye size={14} />
                                                            </Link>
                                                            <Link href={`/ads/${ad.id}/edit`} title={language === 'ar' ? 'تعديل' : 'Edit'} className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xs hover:bg-blue-600 hover:text-white transition-all">
                                                                <Settings size={14} />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDeleteAd(ad.id)}
                                                                title={language === 'ar' ? 'حذف' : 'Delete'}
                                                                className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 rounded-xs hover:bg-red-600 hover:text-white transition-all"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-text-muted gap-3 p-16">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-inner">
                                            <Package size={32} className="opacity-10" />
                                        </div>
                                        <div className="text-center">
                                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-300">
                                                {language === 'ar' ? 'لا توجد إعلانات' : 'No listings found'}
                                            </h4>
                                            <p className="text-[9px] font-bold text-gray-300 uppercase italic mt-1">
                                                {language === 'ar' ? 'ابدأ بنشر إعلانك الأول' : 'Start by posting your first ad'}
                                            </p>
                                        </div>
                                        <Link href="/post-ad" className="mt-4 bg-primary text-white text-[9px] font-black px-6 py-2 rounded-xs shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all uppercase tracking-widest">
                                            {language === 'ar' ? 'نشر إعلان' : 'Post Ad'}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Favorites Tab (for seekers) */}
                    {activeTab === 'favorites' && (
                        <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm text-center">
                            <Heart size={48} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-black text-text-muted uppercase tracking-tight">
                                {language === 'ar' ? 'المفضلة' : 'Favorites'}
                            </h3>
                            <p className="text-[12px] text-gray-500 mt-2">
                                {language === 'ar' ? 'لم تقم بإضافة أي إعلانات للمفضلة بعد' : 'You haven\'t added any favorites yet'}
                            </p>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="space-y-4">
                            <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
                                <h3 className="text-lg font-black text-secondary uppercase tracking-tight mb-4">
                                    {language === 'ar' ? 'تحديث الملف الشخصي' : 'Update Profile'}
                                </h3>

                                {updateMessage && (
                                    <div className={`p-3 rounded-sm mb-4 text-[12px] font-bold ${updateMessage.includes('successfully') || updateMessage.includes('نجاح') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {updateMessage}
                                    </div>
                                )}

                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div>
                                        <label className="block text-[12px] font-black text-gray-600 uppercase tracking-widest mb-2">
                                            {language === 'ar' ? 'الاسم' : 'Name'}
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-sm text-[14px] focus:border-primary focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[12px] font-black text-gray-600 uppercase tracking-widest mb-2">
                                            {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                                        </label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-sm text-[14px] focus:border-primary focus:outline-none"
                                        />
                                    </div>

                                    <div className="border-t border-gray-200 pt-4">
                                        <h4 className="font-black text-secondary text-[14px] mb-4">
                                            {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                                        </h4>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                                                    {language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                                                </label>
                                                <input
                                                    type="password"
                                                    value={profileData.currentPassword}
                                                    onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-sm text-[14px] focus:border-primary focus:outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                                                    {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                                                </label>
                                                <input
                                                    type="password"
                                                    value={profileData.newPassword}
                                                    onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-sm text-[14px] focus:border-primary focus:outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                                                    {language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                                                </label>
                                                <input
                                                    type="password"
                                                    value={profileData.confirmPassword}
                                                    onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-sm text-[14px] focus:border-primary focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="w-full bg-primary text-white py-3 rounded-sm font-black text-[12px] uppercase tracking-widest hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {updating ? (language === 'ar' ? 'جارٍ التحديث...' : 'Updating...') : (language === 'ar' ? 'تحديث الملف الشخصي' : 'Update Profile')}
                                    </button>
                                </form>
                            </div>

                            <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
                                <h3 className="text-lg font-black text-secondary uppercase tracking-tight mb-4">
                                    {language === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-sm">
                                        <div>
                                            <h4 className="font-black text-secondary text-[14px]">
                                                {language === 'ar' ? 'الإشعارات' : 'Notifications'}
                                            </h4>
                                            <p className="text-[10px] text-gray-500">
                                                {language === 'ar' ? 'تلقي إشعارات حول الإعلانات والرسائل' : 'Receive notifications about ads and messages'}
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-sm">
                                        <div>
                                            <h4 className="font-black text-secondary text-[14px]">
                                                {language === 'ar' ? 'الخصوصية' : 'Privacy'}
                                            </h4>
                                            <p className="text-[10px] text-gray-500">
                                                {language === 'ar' ? 'إظهار معلومات الاتصال للجميع' : 'Show contact information to everyone'}
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-red-50 border border-red-200 p-6 rounded-sm">
                                <h3 className="text-lg font-black text-red-600 uppercase tracking-tight mb-4 flex items-center gap-2">
                                    <AlertTriangle size={20} />
                                    {language === 'ar' ? 'منطقة خطرة' : 'Danger Zone'}
                                </h3>
                                <p className="text-[12px] text-red-600 mb-4">
                                    {language === 'ar'
                                        ? 'حذف الحساب سيؤدي إلى حذف جميع بياناتك نهائياً ولا يمكن التراجع عنه.'
                                        : 'Deleting your account will permanently delete all your data and cannot be undone.'
                                    }
                                </p>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleting}
                                    className={`px-4 py-2 rounded-sm text-[12px] font-black uppercase tracking-widest transition-all ${deleteConfirm
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                                        }`}
                                >
                                    {deleting ? (
                                        <Loader2 className="animate-spin" size={14} />
                                    ) : deleteConfirm ? (
                                        <>
                                            <CheckCircle size={14} className="inline mr-2" />
                                            {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={14} className="inline mr-2" />
                                            {language === 'ar' ? 'حذف الحساب' : 'Delete Account'}
                                        </>
                                    )}
                                </button>
                                {deleteConfirm && !deleting && (
                                    <button
                                        onClick={() => setDeleteConfirm(false)}
                                        className="ml-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-sm text-[12px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                                    >
                                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <Footer />
        </div>
    );
}