import { create } from 'zustand';
import { AuthUser, supabase } from '@/lib/auth';

interface AuthState {
    user: AuthUser | null;
    session: any;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
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
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            set({
                user: {
                    id: data.user.id,
                    email: data.user.email!,
                    name: data.user.user_metadata?.name,
                    role: data.user.user_metadata?.role || 'USER'
                },
                session: data.session
            });
        } finally {
            set({ loading: false });
        }
    },
    register: async (email, password, name) => {
        set({ loading: true });
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        role: 'USER'
                    }
                }
            });

            if (error) throw error;

            if (data.user) {
                set({
                    user: {
                        id: data.user.id,
                        email: data.user.email!,
                        name,
                        role: 'USER'
                    },
                    session: data.session
                });
            }
        } finally {
            set({ loading: false });
        }
    },
    logout: async () => {
        await supabase.auth.signOut();
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
                        email: session.user.email!,
                        name: session.user.user_metadata?.name,
                        role: session.user.user_metadata?.role || 'USER'
                    },
                    session
                });
            }
        } finally {
            set({ loading: false });
        }
    },
}));
