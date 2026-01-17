"use client";

import { useState } from "react";
import { apiService } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function TestPostPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        price: "",
        location: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [error, setError] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setResponse(null);

        setLoading(true);
        try {
            const data = {
                ...formData,
                price: Number(formData.price),
                currencyId: 'sar',
                images: "[]",
                latitude: 24.7136,
                longitude: 46.6753
            };
            const res = await apiService.createAd(data);
            setResponse(res);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div>يرجى تسجيل الدخول</div>;

    return (
        <div className="p-10">
            <h1>Test Post Ad</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Title"
                    required
                    className="border p-2 w-full"
                />
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="border p-2 w-full"
                >
                    <option value="">Category</option>
                    <option value="cars">Cars</option>
                    <option value="realEstate">Real Estate</option>
                </select>
                <input
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Price"
                    required
                    className="border p-2 w-full"
                />
                <input
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Location"
                    required
                    className="border p-2 w-full"
                />
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Description"
                    className="border p-2 w-full"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white p-2"
                >
                    {loading ? "Posting..." : "Post Ad"}
                </button>
            </form>
            {error && <div className="text-red-500 mt-4">{error}</div>}
            {response && (
                <div className="mt-4">
                    <h2>Ad Created</h2>
                    <p>ID: {response.id}</p>
                    <a href={`/test-view?id=${response.id}`} className="text-blue-500 underline">View Ad</a>
                </div>
            )}
        </div>
    );
}