// Simple internationalization system
export const translations = {
    ar: {
        // Brand
        siteName: 'ساحة',
        siteBrand: 'ساحة للمزادات والعقارات',
        taglineFooter: 'بوابة الخليج العقارية والمهنية',

        // Navigation
        home: 'الرئيسية',
        ads: 'الإعلانات',
        postAd: 'أضف إعلانك',
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

        // Regional
        country: 'الدولة',
        currency: 'العملة',
        sar: 'ريال سعودي',
        aed: 'درهم إماراتي',
        kwd: 'دينار كويتي',
        qar: 'ريال قطري',
        bhd: 'دينار بحريني',
        omr: 'ريال عماني',
        egp: 'جنيه مصري',
        ae: 'الإمارات',
        sa: 'السعودية',
        kw: 'الكويت',
        qa: 'قطر',
        bh: 'البحرين',
        om: 'عمان',
        eg: 'مصر',

        // Actions
        search: 'ابحث',
        filter: 'فلتر',
        help: 'المساعدة',
        advertiseWithUs: 'أعلن معنا',
        addToFavorites: 'أضف للمفضلة',
        share: 'مشاركة',
        details: 'التفاصيل',
        contact: 'اتصل الآن',
        save: 'حفظ',
        cancel: 'إلغاء',
        choosePlan: 'اختر الباقة',
        startToday: 'ابدأ اليوم وشاهد الفرق',
        joinThousands: 'انضم لآلاف التجار الناجحين الذين زادوا مبيعاتهم مع ساحة',
        postYourFirst: 'أضف إعلانك الأول',
        viewAll: 'عرض الكل',

        // Forms & Labels
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        name: 'الاسم',
        phone: 'الهاتف',
        location: 'الموقع',
        title: 'عنوان الإعلان',
        description: 'وصف الإعلان',
        price: 'السعر',
        category: 'التصنيف',
        professionalTitle: 'عنوان الإعلان الإحترافي',
        detailedBriefing: 'تفاصيل الإعلان / الوصف الدقيق',
        askingPrice: 'السعر المطلوب',
        deploymentLocation: 'موقع التسليم / المدينة',
        deployListing: 'نشر الإعلان الآن',
        secureProtocol: 'اتصال آمن وموثوق لبياناتك',
        marketRules: 'قواعد السوق',
        marketRulesDesc: 'كن دقيقاً في السعر والتصنيف لجذب المشترين الجادين فوراً.',
        photos: 'الصور',
        optional: 'اختياري',
        imagesSelected: 'صورة محددة',
        clickToAddPhotos: 'انقر لإضافة الصور',
        max5Images: 'الحد الأقصى 5 صور',
        each: 'لكل',

        // Messages & Ticker
        loading: 'جارٍ التحميل...',
        noResults: 'لا توجد نتائج',
        error: 'حدث خطأ',
        success: 'تم بنجاح',
        newAd: 'جديد',
        hotOffer: 'عرض ساخن',
        trending: 'رائج الآن',
        tickerMessage1: 'عروض حصرية لمشتركي باقة "ساحة بيزنس" - خصم 50%',
        tickerMessage2: 'أفضل وقت لنشر إعلانات السيارات: الآن!',
        footerNotice: 'جميع الحقوق محفوظة لمنصة ساحة 2026',

        // Placeholders
        searchPlaceholder: 'ابحث عن وظائف، عقارات، سيارات...',
        locationPlaceholder: 'الرياض، جدة، دبي...',
        priceFrom: 'السعر من',
        priceTo: 'إلى',
        adTitlePlaceholder: 'مثال: شقة استثمارية في حي النرجس...',
        descriptionPlaceholder: 'اكتب وصفاً تقنياً دقيقاً وشاملاً...',
        chooseCategory: '-- اختر القسم --',

        // Status
        active: 'نشط',
        inactive: 'غير نشط',
        verified: 'موثوق',
        featured: 'مميز',
        trustedMerchant: 'تاجر موثوق',
        merchantLabel: 'تاجر / معلن',
        adminLabel: 'مدير النظام',

        // Dashboard
        overview: 'نظرة عامة',
        myAds: 'إعلاناتي',
        myListings: 'إعلاناتي',
        messages: 'الرسائل',
        settings: 'الإعدادات',
        operationalFleet: 'الأسطول التشغيلي / الإعلانات',
        unitIdentification: 'تحديد الوحدة / التفاصيل',
        statusMatrix: 'مصفوفة الحالة',
        engagement: 'المشاركة',
        actions: 'الإجراءات',
        code: 'الرمز',
        totalImprints: 'إجمالي الطباعات',
        matrix: 'المصفوفة',
        noMissionData: 'لا توجد بيانات مهمة',
        startYourJourney: 'ابدأ رحلتك بنشر إعلانك الأول الآن',

        // Modals
        confirmDelete: 'تأكيد الحذف',
        deleteWarning: 'هل أنت متأكد من حذف هذا الإعلان؟',
        thisActionCannotBeUndone: 'لا يمكن التراجع عن هذا الإجراء',
        delete: 'حذف',

        // Auth Pages
        loginTitle: 'تسجيل الدخول للنظام',
        registerTitle: 'إنشاء حساب جديد',
        placeholderEmail: 'أدخل البريد الإلكتروني...',
        placeholderPassword: 'أدخل كلمة المرور...',
        placeholderName: 'الاسم الكامل باللغة العربية...',
        btnSubmitLogin: 'دخول آمن',
        btnSubmitRegister: 'بدء الرحلة الآن',
        backToHome: 'العودة للرئيسية',
        alreadyHaveAccount: 'هل لديك حساب بالفعل؟',
        noAccount: 'ليس لديك حساب؟',
        processing: 'جارٍ المعالجة...',
    },
    en: {
        // Brand
        siteName: 'Saha',
        siteBrand: 'Saha Auctions & Real Estate',
        taglineFooter: 'GCC Real Estate & Career Portal',

        // Navigation
        home: 'Home',
        ads: 'Ads',
        postAd: 'Post Your Ad',
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

        // Regional
        country: 'Country',
        currency: 'Currency',
        sar: 'SAR (Saudi Riyal)',
        aed: 'AED (UAE Dirham)',
        kwd: 'KWD (Kuwaiti Dinar)',
        qar: 'QAR (Qatari Riyal)',
        bhd: 'BHD (Bahraini Dinar)',
        omr: 'OMR (Omani Rial)',
        egp: 'EGP (Egyptian Pound)',
        ae: 'UAE',
        sa: 'Saudi Arabia',
        kw: 'Kuwait',
        qa: 'Qatar',
        bh: 'Bahrain',
        om: 'Oman',
        eg: 'Egypt',

        // Actions
        search: 'Search',
        filter: 'Filter',
        help: 'Help',
        advertiseWithUs: 'Advertise with us',
        addToFavorites: 'Add to Favorites',
        share: 'Share',
        details: 'Details',
        contact: 'Contact Now',
        save: 'Save',
        cancel: 'Cancel',
        choosePlan: 'Choose Plan',
        startToday: 'Start Today and See the Difference',
        joinThousands: 'Join thousands of successful merchants who increased their sales with Saha',
        postYourFirst: 'Post Your First Ad',
        viewAll: 'View All',

        // Forms & Labels
        email: 'Email',
        password: 'Password',
        name: 'Name',
        phone: 'Phone',
        location: 'Location',
        title: 'Ad Title',
        description: 'Description',
        price: 'Price',
        category: 'Category',
        professionalTitle: 'Professional Ad Title',
        askingPrice: 'Asking Price',
        deploymentLocation: 'Deployment Location / City',
        detailedBriefing: 'Detailed Briefing / Description',
        deployListing: 'Post Ad Now',
        secureProtocol: 'Secure and Encrypted Data Connection',
        marketRules: 'Market Rules',
        marketRulesDesc: 'Be precise with price and category to attract high-quality buyers instantly.',
        photos: 'Photos',
        optional: 'Optional',
        imagesSelected: 'image selected',
        clickToAddPhotos: 'Click to add photos',
        max5Images: 'Max 5 images',
        each: 'each',

        // Messages & Ticker
        loading: 'Loading...',
        noResults: 'No results found',
        error: 'An error occurred',
        success: 'Success',
        newAd: 'New',
        hotOffer: 'HOT OFFER',
        trending: 'TRENDING',
        tickerMessage1: 'Exclusive offers for Saha Business members - 50% OFF',
        tickerMessage2: 'Best time to post Car ads: NOW!',
        footerNotice: 'All rights reserved to Saha Platform 2026',

        // Placeholders
        searchPlaceholder: 'Search for jobs, real estate, cars...',
        locationPlaceholder: 'Riyadh, Jeddah, Dubai...',
        priceFrom: 'Price from',
        priceTo: 'to',
        adTitlePlaceholder: 'e.g. Investment Apartment in District 5...',
        descriptionPlaceholder: 'Write a technical and comprehensive description...',
        chooseCategory: '-- Choose Category --',

        // Status
        active: 'Active',
        inactive: 'Inactive',
        verified: 'Verified',
        featured: 'Featured',
        trustedMerchant: 'Trusted Merchant',
        merchantLabel: 'Merchant / Seller',
        adminLabel: 'System Admin',

        // Dashboard
        overview: 'Overview',
        myAds: 'My Ads',
        myListings: 'My Listings',
        messages: 'Messages',
        settings: 'Settings',
        operationalFleet: 'Operational Fleet / Listings',
        unitIdentification: 'Unit Identification / Details',
        statusMatrix: 'Status Matrix',
        engagement: 'Engagement',
        actions: 'Actions',
        code: 'Code',
        totalImprints: 'Total Imprints',
        matrix: 'Matrix',
        noMissionData: 'No Mission Data Found',
        startYourJourney: 'Start your journey by posting your first ad now',

        // Modals
        confirmDelete: 'Confirm Delete',
        deleteWarning: 'Are you sure you want to delete this ad?',
        thisActionCannotBeUndone: 'This action cannot be undone',
        delete: 'Delete',

        // Auth Pages
        loginTitle: 'System Login',
        registerTitle: 'Create New Account',
        placeholderEmail: 'Enter email address...',
        placeholderPassword: 'Enter your password...',
        placeholderName: 'Full Name...',
        btnSubmitLogin: 'Secure Login',
        btnSubmitRegister: 'Start Journey Now',
        backToHome: 'Back to Home',
        alreadyHaveAccount: 'Already have an account?',
        noAccount: 'Don\'t have an account?',
        processing: 'Processing...',
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