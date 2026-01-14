const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    if (typeof window !== 'undefined') {
        const host = window.location.origin;
        // If we are on render but env is missing, try to use current origin + /api
        return `${host}/api`;
    }
    return 'http://localhost:5000/api';
};

const API_URL = getBaseUrl();

const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

export const apiService = {
    async get(endpoint: string, params: Record<string, any> = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_URL}${endpoint}${query ? `?${query}` : ''}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('API Error');
        return response.json();
    },

    async post(endpoint: string, data: any) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('API Error');
        return response.json();
    },

    // Countries and Cities
    async getCountries() {
        return this.get('/countries');
    },

    async getCountry(id: string) {
        return this.get(`/countries/${id}`);
    },

    // Ads
    async getAds(filters: Record<string, any> = {}) {
        return this.get('/ads', filters);
    },

    async getAd(id: string) {
        return this.get(`/ads/${id}`);
    },

    async createAd(adData: any) {
        return this.post('/ads', adData);
    },

    // Auth
    async register(userData: { email: string; password: string; name: string }) {
        return this.post('/auth/register', userData);
    },

    async login(credentials: { email: string; password: string }) {
        return this.post('/auth/login', credentials);
    },

    // Conversations
    async getConversations() {
        return this.get('/conversations');
    },

    async sendMessage(conversationId: string, message: string) {
        return this.post(`/conversations/${conversationId}/messages`, { content: message });
    }
};
