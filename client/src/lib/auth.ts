import { supabase } from './supabase';

// استخدام Supabase Auth
export const authService = {
    async login(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw new Error(error.message || 'Login failed');
        }

        return {
            token: data.session?.access_token,
            user: {
                id: data.user?.id,
                email: data.user?.email,
                name: data.user?.user_metadata?.name,
                role: data.user?.role,
                userType: data.user?.user_metadata?.userType,
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
                },
            },
        });

        if (error) {
            throw new Error(error.message || 'Registration failed');
        }

        return {
            token: data.session?.access_token,
            user: {
                id: data.user?.id,
                email: data.user?.email,
                name: data.user?.user_metadata?.name,
                role: data.user?.role,
                userType: data.user?.user_metadata?.userType,
                verified: data.user?.email_confirmed_at ? true : false,
            },
        };
    },

    getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('supabase.auth.token');
    },

    setToken(token: string) {
        if (typeof window === 'undefined') return;
        localStorage.setItem('supabase.auth.token', token);
    },

    removeToken() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('supabase.auth.token');
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