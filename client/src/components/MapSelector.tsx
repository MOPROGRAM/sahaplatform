"use client";

import { useState } from 'react';

interface MapSelectorProps {
    onLocationSelect: (lat: number, lng: number, address?: string) => void;
    initialLocation?: [number, number];
    height?: string;
}

export default function MapSelector({ onLocationSelect, height = "300px" }: MapSelectorProps) {
    const [selectedLocation, setSelectedLocation] = useState<string>('');

    const handleLocationInput = (location: string) => {
        setSelectedLocation(location);
        // For now, just pass a placeholder. In production, you'd use geocoding
        onLocationSelect(24.7136, 46.6753, location);
    };

    return (
        <div className="w-full space-y-3">
            <div
                className="bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
                style={{ height }}
            >
                <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <p className="text-gray-600 font-medium mb-2">تحديد الموقع على الخريطة</p>
                    <p className="text-sm text-gray-500">اضغط لاختيار موقع الإعلان</p>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    أو أدخل العنوان يدوياً
                </label>
                <input
                    type="text"
                    placeholder="مثال: الرياض، حي العليا"
                    value={selectedLocation}
                    onChange={(e) => handleLocationInput(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
            </div>
        </div>
    );
}