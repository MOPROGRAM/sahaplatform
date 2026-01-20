import { create } from 'zustand';
import { AuthUser, authService } from '@/lib/auth';

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string, userType?: string) => Promise<void>;
    logout: () => void;
    initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    loading: true,
    login: async (email, password) => {
        set({ loading: true });
        try {
            const response = await authService.login(email, password);
            authService.setToken(response.token);
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
    register: async (email, password, name, userType = 'SEEKER') => {
        set({ loading: true });
        try {
            const response = await authService.register(email, password, name, userType);
            authService.setToken(response.token);
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
    logout: () => {
        authService.removeToken();
        set({ user: null, token: null });
    },
    initialize: () => {
        set({ loading: true });
        try {
            const token = authService.getToken();
            if (token) {
                // TODO: Validate token with backend and get user info
                // For now, we'll just set the token
                set({ token });
            }
        } catch (e) {
            console.error("Failed to initialize auth:", e);
        } finally {
            set({ loading: false });
        }
    },
}));
