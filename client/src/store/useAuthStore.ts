import { create } from 'zustand';
import { AuthUser, authService } from '@/lib/auth';

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
            const response = await authService.login(email, password);

            authService.setToken(response.token);

            // Decode user info from token (simplified)
            const user = { id: 'temp', email, name: 'User', role: 'USER' };

            set({
                user,
                session: response.token
            });
        } finally {
            set({ loading: false });
        }
    },
    register: async (email, password, name) => {
        set({ loading: true });
        try {
            const response = await authService.register(email, password, name);

            // After registration, automatically log in
            const loginResponse = await authService.login(email, password);
            authService.setToken(loginResponse.token);

            set({
                user: {
                    id: response.user.id,
                    email: response.user.email,
                    name: response.user.name,
                    role: response.user.role || 'USER'
                },
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
                // TODO: Validate token with backend
                set({ session: token });
            }
        } finally {
            set({ loading: false });
        }
    },
}));
