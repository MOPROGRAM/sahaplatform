import { create } from 'zustand';
import { AuthUser, authService } from '@/lib/auth';

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
            authService.setToken(response.token);
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
            const loginResponse = await authService.login(email, password);
            authService.setToken(loginResponse.token);
            set({
                user: loginResponse.user,
                session: loginResponse.token
            });
        } finally {
            set({ loading: false });
        }
    },
    logout: async () => {
        authService.removeToken();
        set({ user: null, session: null });
    },
    initialize: async () => {
        set({ loading: true });
        try {
            const token = authService.getToken();
            if (token) {
                set({ session: token });
                try {
                    // Fetch real profile from backend
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const user = await response.json();
                        set({ user });
                    } else {
                        authService.removeToken();
                        set({ user: null, session: null });
                    }
                } catch (e) {
                    console.error("Failed to fetch profile:", e);
                }
            }
        } finally {
            set({ loading: false });
        }
    },
}));
