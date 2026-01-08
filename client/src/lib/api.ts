const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiService = {
    async get(endpoint: string, params: Record<string, any> = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_URL}${endpoint}${query ? `?${query}` : ''}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) throw new Error('API Error');
        return response.json();
    },

    async post(endpoint: string, data: any) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('API Error');
        return response.json();
    }
};
