import { create } from 'zustand';
import { AuthUser, authService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    register: (email: string, password: string, name: string, userType?: string) => Promise<void>;
    logout: () => void;
    initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    loading: true,
    login: async (email, password) => {
        set({ loading: true });
        try {
            const response = await authService.login(email, password);
            set({
                user: response.user,
                token: response.token
            });
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    },
    loginWithGoogle: async () => {
        set({ loading: true });
        try {
            await authService.loginWithGoogle();
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },
    register: async (email, password, name, userType = 'SEEKER') => {
        set({ loading: true });
        try {
            const response = await authService.register(email, password, name, userType);
            set({
                user: response.user,
                token: response.token
            });
        } catch (error) {
            throw error;
        } finally {
            set({ loading: false });
        }
    },
    logout: async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        }
        set({ user: null, token: null });
    },
    initialize: async () => {
        set({ loading: true });
        try {
            const session = await authService.getCurrentSession();
            if (session?.user) {
                // Ensure user data is synced to DB
                await authService.syncUserData(session.user, session.access_token);
                
                set({
                    user: {
                        id: session.user.id,
                        email: session.user.email || '',
                        name: session.user.user_metadata?.name || '',
                        role: session.user.user_metadata?.role || 'USER',
                        userType: session.user.user_metadata?.userType || 'SEEKER',
                        verified: !!session.user.email_confirmed_at,
                        points: 0,
                        created_at: session.user.created_at,
                    },
                    token: session.access_token
                });
            }
        } catch (e) {
            console.error("Failed to initialize auth:", e);
        } finally {
            set({ loading: false });
        }
    },
}));
