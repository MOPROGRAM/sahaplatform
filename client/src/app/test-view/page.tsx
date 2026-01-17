"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { apiService } from "@/lib/api";

export default function TestViewPage() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [ad, setAd] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (id) {
            fetchAd();
        }
    }, [id]);

    const fetchAd = async () => {
        setLoading(true);
        try {
            const data = await apiService.getAd(id!);
            setAd(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!id) return <div>No ID provided</div>;

    return (
        <div className="p-10">
            <h1>Test View Ad</h1>
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-500">Error: {error}</div>}
            {ad && (
                <div>
                    <h2>{ad.title}</h2>
                    <p>{ad.description}</p>
                    <p>Price: {ad.price}</p>
                    <p>Location: {ad.location}</p>
                    <p>Category: {ad.category}</p>
                </div>
            )}
            {!ad && !loading && !error && <div>Ad not found</div>}
        </div>
    );
}