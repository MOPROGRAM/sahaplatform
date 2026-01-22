import { supabase } from './supabase';

// استخدام Supabase Auth مباشرة
export const authService = {
    async login(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw new Error(error.message);
        }

        // مزامنة بيانات المستخدم في جدول users
        if (data.user) {
            await this.syncUserData(data.user, data.session?.access_token);
        }

        return {
            token: data.session?.access_token || '',
            user: {
                id: data.user?.id || '',
                email: data.user?.email || '',
                name: data.user?.user_metadata?.name || '',
                role: data.user?.user_metadata?.role || 'USER',
                userType: data.user?.user_metadata?.userType || 'SEEKER',
                verified: data.user?.email_confirmed_at ? true : false,
            },
        };
    },

    async register(email: string, password: string, name: string, userType: string = 'SEEKER') {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    userType,
                    role: 'USER',
                },
            },
        });

        if (error) {
            throw new Error(error.message);
        }

        // مزامنة بيانات المستخدم في جدول users
        if (data.user) {
            await this.syncUserData(data.user, data.session?.access_token);
        }

        return {
            token: data.session?.access_token || '',
            user: {
                id: data.user?.id || '',
                email: data.user?.email || '',
                name: data.user?.user_metadata?.name || '',
                role: data.user?.user_metadata?.role || 'USER',
                userType: data.user?.user_metadata?.userType || 'SEEKER',
                verified: data.user?.email_confirmed_at ? true : false,
            },
        };
    },

    async syncUserData(user: any, token?: string) {
        try {
            // محاولة إدراج أو تحديث بيانات المستخدم في جدول users
            const { error } = await (supabase as any)
                .from('users')
                .upsert({
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.name || '',
                    role: user.user_metadata?.role || 'USER',
                    userType: user.user_metadata?.userType || 'SEEKER',
                    verified: !!user.email_confirmed_at,
                }, {
                    onConflict: 'id'
                });

            if (error) {
                console.warn('Failed to sync user data:', error);
            }
        } catch (error) {
            console.warn('Error syncing user data:', error);
        }
    },

    async getCurrentSession() {
        if (typeof window === 'undefined') return null;
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    async getCurrentUser() {
        if (typeof window === 'undefined') return null;
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    getToken(): string | null {
        // لا نحتاج لتخزين token محلياً، Supabase يدير الجلسة
        return null;
    },

    setToken(token: string) {
        // لا نحتاج لتخزين token محلياً
    },

    removeToken() {
        // لا نحتاج لإزالة token محلياً
    }
};

export type AuthUser = {
    id: string;
    email: string;
    name?: string;
    role?: string;
    userType?: string;
    verified?: boolean;
    image?: string;
};