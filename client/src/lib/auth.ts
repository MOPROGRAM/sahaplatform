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

        // Fetch user points and other details from DB
        const { data: userProfile } = await (supabase as any)
            .from('users')
            .select('points')
            .eq('id', data.user?.id)
            .single();

        return {
            token: data.session?.access_token || '',
            user: {
                id: data.user?.id || '',
                email: data.user?.email || '',
                name: data.user?.user_metadata?.name || '',
                role: data.user?.user_metadata?.role || 'USER',
                userType: data.user?.user_metadata?.userType || 'SEEKER',
                verified: data.user?.email_confirmed_at ? true : false,
                points: userProfile?.points || 0,
                created_at: data.user?.created_at,
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

        // For new registration, points should be 10 (handled in syncUserData)
        return {
            token: data.session?.access_token || '',
            user: {
                id: data.user?.id || '',
                email: data.user?.email || '',
                name: data.user?.user_metadata?.name || '',
                role: data.user?.user_metadata?.role || 'USER',
                userType: data.user?.user_metadata?.userType || 'SEEKER',
                verified: data.user?.email_confirmed_at ? true : false,
                points: 10, // Default for new user
                created_at: data.user?.created_at,
            },
        };
    },

    async loginWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });

        if (error) throw new Error(error.message);
        return data;
    },

    async syncUserData(user: any, token?: string) {
        try {
            // Ensure we have the latest user data from Supabase Auth
            const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
            
            if (authError || !currentUser) {
                console.warn('Could not verify user for sync:', authError);
                // Fallback to the passed user if getUser fails (though it shouldn't if session is valid)
            }
            
            const targetUser = currentUser || user;

            // Check if user exists first to decide on points allocation
            // We use maybeSingle() to avoid 400 errors if multiple rows exist (though id is unique)
            const { data: existingUser, error: fetchError } = await (supabase as any)
                .from('users')
                .select('id, points')
                .eq('id', targetUser.id)
                .maybeSingle();

            if (fetchError) {
                console.warn('Error fetching existing user:', fetchError);
            }

            const userData: any = {
                id: targetUser.id,
                email: targetUser.email,
                name: targetUser.user_metadata?.name || '',
                role: targetUser.user_metadata?.role || 'USER',
                user_type: targetUser.user_metadata?.userType || 'SEEKER',
                verified: !!targetUser.email_confirmed_at,
            };

            // Only set default points for new users (if not found in DB)
            if (!existingUser) {
                userData.points = 10;
            } else {
                // If user exists, we might want to preserve their points or update if needed
                // For now, we don't overwrite points in the upsert unless necessary
                // If existingUser has points, we don't put points in userData to avoid resetting it
                // UNLESS we want to sync other fields.
            }

            // Remove undefined values to avoid 400 errors
            Object.keys(userData).forEach(key => userData[key] === undefined && delete userData[key]);

            // Upsert user data
            const { error: upsertError } = await (supabase as any)
                .from('users')
                .upsert(userData, {
                    onConflict: 'id'
                });

            if (upsertError) {
                console.warn('Failed to sync user data:', upsertError);
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
    points?: number;
    created_at?: string;
};