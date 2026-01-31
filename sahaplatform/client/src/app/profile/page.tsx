"use client";

export const runtime = 'edge';

import { Suspense, useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, useSearchParams } from "next/navigation";
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
    AlertTriangle,
    RefreshCcw,
    Clock,
    Search,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { adsService, Ad } from "@/lib/ads";
import { conversationsService, Conversation } from "@/lib/conversations";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdCard from "@/components/AdCard";
import ChatWindow from "@/components/ChatWindow";
import { formatRelativeTime } from "@/lib/utils";



function ProfileContent() {
    const { user, logout } = useAuthStore();
    const { language, t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
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
    const [favorites, setFavorites] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);

    // Messages State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [showDeletedConversations, setShowDeletedConversations] = useState(false);
    const [messagesLoading, setMessagesLoading] = useState(false);

    useEffect(() => {
        const tab = searchParams.get('tab');
        const convId = searchParams.get('conversationId');
        if (tab) setActiveTab(tab);
        if (convId) setSelectedConversationId(convId);
    }, [searchParams]);

    useEffect(() => {
        if (activeTab === 'messages' && user) {
            fetchConversations();
        }
    }, [activeTab, showDeletedConversations, user]);

    const fetchConversations = async () => {
        setMessagesLoading(true);
        try {
            const data = await conversationsService.getConversations(showDeletedConversations);
            setConversations(data);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setMessagesLoading(false);
        }
    };

    const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        // First Confirmation
        if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه المحادثة؟ ستتمكن من استعادتها خلال 30 يوم.' : 'Are you sure you want to delete this conversation? You can restore it within 30 days.')) {
            return;
        }
        // Second Confirmation (Double Check)
        if (!confirm(language === 'ar' ? 'تأكيد نهائي: هل تريد حقاً حذف المحادثة؟' : 'Final Confirmation: Do you really want to delete this conversation?')) {
            return;
        }
        try {
            await conversationsService.deleteConversation(id);
            fetchConversations();
        } catch (error) {
            console.error('Failed to delete conversation:', error);
            alert(language === 'ar' ? 'فشل حذف المحادثة' : 'Failed to delete conversation');
        }
    };

    const handleRestoreConversation = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await conversationsService.restoreConversation(id);
            fetchConversations();
            alert(language === 'ar' ? 'تم استعادة المحادثة' : 'Conversation restored');
        } catch (error) {
            console.error('Failed to restore conversation:', error);
            alert(language === 'ar' ? 'فشل استعادة المحادثة' : 'Failed to restore conversation');
        }
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!user) {
            router.push('/login');
            return;
        }
        if (activeTab === 'listings') {
            fetchUserAds();
        } else {
            setLoading(false);
        }
    }, [user, activeTab, router, mounted]);

    useEffect(() => {
        if (user && mounted) {
             setProfileData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || ''
            }));
        }
    }, [user, mounted]);

    if (!mounted) return <div className="min-h-screen bg-background"></div>;

    useEffect(() => {
        if (activeTab !== 'favorites') return;
        try {
            const raw = typeof window !== 'undefined' ? window.localStorage.getItem('saha:favorites') : null;
            const list = raw ? JSON.parse(raw) : [];
            setFavorites(Array.isArray(list) ? list : []);
        } catch {
            setFavorites([]);
        }
    }, [activeTab]);

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
        { id: 'messages', label: language === 'ar' ? 'الرسائل' : 'Messages', icon: <MessageSquare size={14} /> },
        { id: 'favorites', label: language === 'ar' ? 'المفضلة' : 'Favorites', icon: <Heart size={14} /> },
        { id: 'settings', label: language === 'ar' ? 'الإعدادات' : 'Settings', icon: <Settings size={14} /> },
    ];

    if (user.userType === 'PROVIDER') {
        tabs.splice(2, 0, { id: 'services', label: language === 'ar' ? 'خدماتي' : 'My Services', icon: <ShieldCheck size={14} /> });
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
                            {/* Admin Link for motwasel@yahoo.com */}
                            {user.email === 'motwasel@yahoo.com' && (
                                <Link href="/admin" className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-red-600/10 text-red-600 border border-red-600/20 rounded-full hover:bg-red-600 hover:text-white transition-all group/admin">
                                    <ShieldCheck size={12} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{language === 'ar' ? 'لوحة التحكم الرئيسية' : 'MASTER ADMIN'}</span>
                                </Link>
                            )}
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
                                                        <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest shadow-sm ${ad.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                                                            {ad.is_active ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'معطل' : 'Inactive')}
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

                    {/* Messages Tab */}
                    {activeTab === 'messages' && (
                        <div className="h-[600px] bg-card border border-border-color rounded-sm shadow-sm overflow-hidden flex flex-col">
                            {selectedConversationId ? (
                                <div className="flex-1 flex flex-col h-full relative">
                                    <button 
                                        onClick={() => setSelectedConversationId(null)}
                                        className="absolute top-2 left-2 z-10 p-2 bg-white/80 backdrop-blur rounded-full shadow-sm hover:bg-gray-100 md:hidden"
                                    >
                                        <ArrowLeft size={20} className={language === 'ar' ? 'rotate-180' : ''} />
                                    </button>
                                    <ChatWindow 
                                        conversationId={selectedConversationId} 
                                        onClose={() => setSelectedConversationId(null)} 
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="px-4 py-3 bg-card border-b border-border-color flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare size={14} className="text-primary" />
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-text-main">
                                                {language === 'ar' ? 'الرسائل' : 'Messages'}
                                            </h3>
                                        </div>
                                        <button 
                                            onClick={() => setShowDeletedConversations(!showDeletedConversations)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xs text-[9px] font-black uppercase tracking-widest transition-all ${showDeletedConversations ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'}`}
                                        >
                                            <Trash2 size={12} />
                                            {showDeletedConversations 
                                                ? (language === 'ar' ? 'إخفاء المحذوفات' : 'Hide Deleted')
                                                : (language === 'ar' ? 'عرض المحذوفات' : 'Show Deleted')
                                            }
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                        {messagesLoading ? (
                                            <div className="flex items-center justify-center h-48">
                                                <Loader2 className="animate-spin text-primary" size={24} />
                                            </div>
                                        ) : conversations.length > 0 ? (
                                            conversations.map(conv => (
                                                <div 
                                                    key={conv.id}
                                                    onClick={() => setSelectedConversationId(conv.id)}
                                                    className="flex items-center gap-3 p-3 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-lg hover:border-primary/30 hover:bg-primary/[0.02] cursor-pointer transition-all group"
                                                >
                                                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center shrink-0">
                                                        {conv.ad?.images ? (
                                                            <img src={JSON.parse(conv.ad.images)[0]} alt={conv.ad.title} className="w-full h-full object-cover rounded-full" />
                                                        ) : (
                                                            <User size={20} className="text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className="font-bold text-sm text-text-main truncate">
                                                                {conv.participants.find(p => p.id !== user.id)?.name || (language === 'ar' ? 'مستخدم' : 'User')}
                                                            </h4>
                                                            <span className="text-[10px] text-text-muted flex items-center gap-1">
                                                                <Clock size={10} />
                                                                {formatRelativeTime(conv.last_message_time || conv.created_at, language)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-text-muted truncate">
                                                            {conv.ad?.title}
                                                        </p>
                                                        {conv.last_message && (
                                                            <p className="text-[11px] text-gray-400 mt-1 truncate max-w-[80%]">
                                                                {conv.last_message}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {showDeletedConversations ? (
                                                            <button 
                                                                onClick={(e) => handleRestoreConversation(conv.id, e)}
                                                                className="p-1.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100"
                                                                title={language === 'ar' ? 'استعادة' : 'Restore'}
                                                            >
                                                                <RefreshCcw size={14} />
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={(e) => handleDeleteConversation(conv.id, e)}
                                                                className="p-1.5 bg-red-50 text-red-600 rounded-full hover:bg-red-100"
                                                                title={language === 'ar' ? 'حذف' : 'Delete'}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-64 text-text-muted">
                                                <MessageSquare size={48} className="opacity-10 mb-4" />
                                                <p className="text-sm font-bold">
                                                    {language === 'ar' ? 'لا توجد محادثات' : 'No conversations found'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Favorites Tab */}
                    {activeTab === 'favorites' && (
                        <div className="bg-card border border-border-color rounded-sm shadow-sm overflow-hidden flex-1 flex flex-col">
                            <div className="px-4 py-3 bg-card border-b border-border-color flex items-center gap-2">
                                <Heart size={14} className="text-red-500" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-text-main">
                                    {language === 'ar' ? 'المفضلة' : 'Favorites'}
                                </h3>
                            </div>
                            
                            <div className="p-4">
                                {loading ? (
                                    <div className="h-48 flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
                                ) : favorites.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {favorites.map((ad: any) => (
                                            <AdCard key={ad.id} ad={ad} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-text-muted">
                                        <Heart size={48} className="opacity-10 mb-4" />
                                        <p className="text-sm font-bold">
                                            {language === 'ar' ? 'لا توجد إعلانات مفضلة' : 'No favorite listings'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="bg-card border border-border-color p-6 rounded-sm shadow-sm">
                            <h3 className="text-lg font-black text-secondary uppercase tracking-tight mb-6">
                                {language === 'ar' ? 'تحديث المعلومات' : 'Update Profile'}
                            </h3>
                            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                                <div>
                                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5">
                                        {language === 'ar' ? 'الاسم' : 'Name'}
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xs text-sm focus:border-primary focus:ring-0 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5">
                                        {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xs text-sm focus:border-primary focus:ring-0 transition-colors"
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <h4 className="text-sm font-bold text-secondary mb-4">
                                        {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5">
                                                {language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                                            </label>
                                            <input
                                                type="password"
                                                value={profileData.currentPassword}
                                                onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xs text-sm focus:border-primary focus:ring-0 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5">
                                                {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                                            </label>
                                            <input
                                                type="password"
                                                value={profileData.newPassword}
                                                onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xs text-sm focus:border-primary focus:ring-0 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5">
                                                {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                                            </label>
                                            <input
                                                type="password"
                                                value={profileData.confirmPassword}
                                                onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xs text-sm focus:border-primary focus:ring-0 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {updateMessage && (
                                    <div className={`p-3 rounded-xs text-xs font-bold ${updateMessage.includes('success') || updateMessage.includes('بنجاح') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {updateMessage}
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="flex-1 bg-primary text-white py-2.5 rounded-xs font-black uppercase tracking-widest hover:bg-primary-hover disabled:opacity-50 transition-colors"
                                    >
                                        {updating ? (
                                            <Loader2 className="animate-spin mx-auto" size={16} />
                                        ) : (
                                            language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'
                                        )}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-12 pt-8 border-t border-border-color">
                                <h4 className="text-sm font-bold text-red-600 mb-2">
                                    {language === 'ar' ? 'منطقة الخطر' : 'Danger Zone'}
                                </h4>
                                <p className="text-xs text-text-muted mb-4">
                                    {language === 'ar' 
                                        ? 'حذف الحساب هو إجراء نهائي لا يمكن التراجع عنه. سيتم حذف جميع بياناتك وإعلاناتك.' 
                                        : 'Deleting your account is permanent. All your data and listings will be removed.'}
                                </p>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleting}
                                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xs text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                                >
                                    {deleting ? (
                                        <Loader2 className="animate-spin" size={14} />
                                    ) : (
                                        deleteConfirm 
                                            ? (language === 'ar' ? 'تأكيد الحذف النهائي' : 'Confirm Permanent Deletion') 
                                            : (language === 'ar' ? 'حذف الحساب' : 'Delete Account')
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>}>
            <ProfileContent />
        </Suspense>
    );
}