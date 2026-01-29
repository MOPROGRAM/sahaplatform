"use client";

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useMapEvents } from 'react-leaflet';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapSelectorProps {
    onLocationSelect: (lat: number, lng: number, address?: string) => void;
    initialLocation?: [number, number];
    height?: string;
}

// Component to handle map events
function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number, address?: string) => void }) {
    const [position, setPosition] = useState<L.LatLng | null>(null);

    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng, `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`);
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
}

export default function MapSelector({ onLocationSelect, initialLocation = [24.7136, 46.6753], height = "300px" }: MapSelectorProps) {
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [isClient, setIsClient] = useState(false);

    // Ensure component only renders on client
    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleLocationInput = useCallback((location: string) => {
        setSelectedLocation(location);
        // If we have an initial/current location, keep it, or just pass null for coordinates
        // to indicate manual address only. But ads service usually expects both.
        // For now, let's just update the address part if we don't have better geocoding.
        onLocationSelect(initialLocation[0], initialLocation[1], location);
    }, [onLocationSelect, initialLocation]);

    if (!isClient) {
        return (
            <div className="w-full space-y-3">
                <div
                    className="bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
                    style={{ height }}
                >
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-gray-600 font-medium mt-2">Loading map...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-3">
            <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height }}>
                <MapContainer
                    {...({ center: initialLocation, zoom: 10 } as any)}
                    style={{ height: '100%', width: '100%' }}
                    className="rounded-lg"
                >
                    <TileLayer
                        {...({ url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' } as any)}
                    />
                    <LocationMarker onLocationSelect={onLocationSelect} />
                </MapContainer>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    أو أدخل العنوان يدوياً
                </label>
                <input
                    type="text"
                    placeholder="مثال: جدة، حي الروضة"
                    value={selectedLocation}
                    onChange={(e) => handleLocationInput(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
            </div>
        </div>
    );
}