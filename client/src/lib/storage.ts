import { supabase } from './supabase';

// خدمة رفع الملفات باستخدام Supabase Storage
export const storageService = {
    // رفع صورة إعلان
    async uploadAdImage(file: File, adId?: string): Promise<string> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // إنشاء اسم فريد للملف
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = `ads/${fileName}`;

        const { data, error } = await supabase.storage
            .from('images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error uploading image:', error);
            throw new Error('Failed to upload image');
        }

        // الحصول على الرابط العام للصورة
        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        return publicUrl;
    },

    // رفع صور متعددة للإعلان
    async uploadAdImages(files: File[], adId?: string): Promise<string[]> {
        const uploadPromises = files.map(file => this.uploadAdImage(file, adId));
        return Promise.all(uploadPromises);
    },

    // حذف صورة
    async deleteImage(imageUrl: string): Promise<void> {
        // استخراج المسار من الرابط العام
        const urlParts = imageUrl.split('/storage/v1/object/public/images/');
        if (urlParts.length < 2) {
            throw new Error('Invalid image URL');
        }

        const filePath = urlParts[1];

        const { error } = await supabase.storage
            .from('images')
            .remove([filePath]);

        if (error) {
            console.error('Error deleting image:', error);
            throw new Error('Failed to delete image');
        }
    },

    // رفع صورة الملف الشخصي
    async uploadProfileImage(file: File): Promise<string> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // إنشاء اسم فريد للملف
        const fileExt = file.name.split('.').pop();
        const fileName = `profile-${user.id}.${fileExt}`;
        const filePath = `profiles/${fileName}`;

        const { data, error } = await supabase.storage
            .from('images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true // السماح بالتحديث
            });

        if (error) {
            console.error('Error uploading profile image:', error);
            throw new Error('Failed to upload profile image');
        }

        // الحصول على الرابط العام للصورة
        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        // تحديث الصورة في جدول المستخدمين
        await supabase
            .from('users')
            .update({ image: publicUrl })
            .eq('id', user.id);

        return publicUrl;
    },

    // رفع ملف مرفق للرسالة
    async uploadMessageFile(file: File): Promise<string> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // إنشاء اسم فريد للملف
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = `messages/${fileName}`;

        const { data, error } = await supabase.storage
            .from('files')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error uploading file:', error);
            throw new Error('Failed to upload file');
        }

        // الحصول على الرابط العام للملف
        const { data: { publicUrl } } = supabase.storage
            .from('files')
            .getPublicUrl(filePath);

        return publicUrl;
    },

    // التحقق من حجم الملف
    validateFileSize(file: File, maxSizeMB: number = 10): boolean {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxSizeBytes;
    },

    // التحقق من نوع الملف
    validateFileType(file: File, allowedTypes: string[]): boolean {
        return allowedTypes.includes(file.type);
    },

    // التحقق من الصور
    validateImageFile(file: File): boolean {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSizeMB = 5; // 5MB للصور

        return this.validateFileType(file, allowedTypes) && this.validateFileSize(file, maxSizeMB);
    },

    // التحقق من الملفات العامة
    validateGeneralFile(file: File): boolean {
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        const maxSizeMB = 10; // 10MB للملفات

        return this.validateFileType(file, allowedTypes) && this.validateFileSize(file, maxSizeMB);
    }
};