import { create } from 'zustand';
import { AuthUser, authService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface AuthState {
    user: AuthUser | null;
    session: any;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string, userType?: string) => Promise<void>;
    logout: () => Promise<void>;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    loading: true,
    login: async (email, password) => {
        set({ loading: true });
        try {
            const response = await authService.login(email, password);
            set({
                user: response.user,
                session: response.token
            });
        } finally {
            set({ loading: false });
        }
    },
    register: async (email, password, name, userType = 'SEEKER') => {
        set({ loading: true });
        try {
            const response = await authService.register(email, password, name, userType);
            set({
                user: response.user,
                session: response.token
            });
        } finally {
            set({ loading: false });
        }
    },
    logout: async () => {
        await supabase.auth.signOut();
        authService.removeToken();
        set({ user: null, session: null });
    },
    initialize: async () => {
        set({ loading: true });
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                set({
                    user: {
                        id: session.user.id,
                        email: session.user.email,
                        name: session.user.user_metadata?.name,
                        role: session.user.role,
                        userType: session.user.user_metadata?.userType,
                        verified: session.user.email_confirmed_at ? true : false,
                    },
                    session: session.access_token
                });
            }
        } catch (e) {
            console.error("Failed to initialize auth:", e);
        } finally {
            set({ loading: false });
        }
    },
}));
