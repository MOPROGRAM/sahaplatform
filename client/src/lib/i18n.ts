// Simple internationalization system
export const translations = {
    ar: {
        // Navigation
        home: 'الرئيسية',
        ads: 'الإعلانات',
        postAd: 'أضف إعلان',
        login: 'دخول',
        register: 'إنشاء حساب',
        dashboard: 'لوحة التحكم',
        logout: 'تسجيل الخروج',
        latestOffers: 'أحدث العروض الحصرية',
        categories: 'بوابة الأقسام',
        tagline: 'مساحة واسعة من الفرص',

        // Categories
        jobs: 'وظائف',
        realEstate: 'عقارات',
        cars: 'سيارات',
        goods: 'سلع',
        services: 'خدمات',
        other: 'أخرى',

        // Actions
        search: 'ابحث',
        filter: 'فلتر',
        help: 'المساعدة',
        advertiseWithUs: 'أعلن معنا',
        addToFavorites: 'أضف للمفضلة',
        share: 'مشاركة',
        details: 'التفاصيل',
        contact: 'اتصل',
        save: 'حفظ',
        cancel: 'إلغاء',

        // Forms
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        name: 'الاسم',
        phone: 'الهاتف',
        location: 'الموقع',
        title: 'العنوان',
        description: 'الوصف',
        price: 'السعر',
        category: 'التصنيف',

        // Messages
        loading: 'جارٍ التحميل...',
        noResults: 'لا توجد نتائج',
        error: 'حدث خطأ',
        success: 'تم بنجاح',
        newAd: 'جديد',

        // Placeholders
        searchPlaceholder: 'ابحث عن وظائف، عقارات، سيارات...',
        locationPlaceholder: 'ابحث عن الموقع...',
        priceFrom: 'السعر من',
        priceTo: 'إلى',

        // Status
        active: 'نشط',
        inactive: 'غير نشط',
        verified: 'موثوق',
        featured: 'مميز',
    },
    en: {
        // Navigation
        home: 'Home',
        ads: 'Ads',
        postAd: 'Post Ad',
        login: 'Login',
        register: 'Register',
        dashboard: 'Dashboard',
        logout: 'Logout',
        latestOffers: 'Latest Exclusive Offers',
        categories: 'Categories Portal',
        tagline: 'A Vast Space of Opportunities',

        // Categories
        jobs: 'Jobs',
        realEstate: 'Real Estate',
        cars: 'Cars',
        goods: 'Goods',
        services: 'Services',
        other: 'Other',

        // Actions
        search: 'Search',
        filter: 'Filter',
        help: 'Help',
        advertiseWithUs: 'Advertise with us',
        addToFavorites: 'Add to Favorites',
        share: 'Share',
        details: 'Details',
        contact: 'Contact',
        save: 'Save',
        cancel: 'Cancel',

        // Forms
        email: 'Email',
        password: 'Password',
        name: 'Name',
        phone: 'Phone',
        location: 'Location',
        title: 'Title',
        description: 'Description',
        price: 'Price',
        category: 'Category',

        // Messages
        loading: 'Loading...',
        noResults: 'No results found',
        error: 'An error occurred',
        success: 'Success',
        newAd: 'New',

        // Placeholders
        searchPlaceholder: 'Search for jobs, real estate, cars...',
        locationPlaceholder: 'Search location...',
        priceFrom: 'Price from',
        priceTo: 'to',

        // Status
        active: 'Active',
        inactive: 'Inactive',
        verified: 'Verified',
        featured: 'Featured',
    }
};

export type Language = 'ar' | 'en';
export type TranslationKey = keyof typeof translations.ar;

export const getTranslation = (key: TranslationKey, lang: Language = 'ar'): string => {
    return translations[lang][key] || translations.ar[key] || key;
};

export const getCurrentLanguage = (): Language => {
    if (typeof window === 'undefined') return 'ar';
    return (localStorage.getItem('language') as Language) || 'ar';
};

export const setLanguage = (lang: Language): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('language', lang);
    window.location.reload(); // Reload to apply RTL/LTR changes
};