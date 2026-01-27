"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { useMap } from "react-leaflet";
import Link from "next/link";
import Image from "next/image";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

interface Ad {
    id: string;
    title: string;
    price: number | null;
    location: string | null;
    latitude?: number | null;
    longitude?: number | null;
    images: string;
    is_boosted?: boolean;
}

interface AdsMapProps {
    ads: Ad[];
    highlightedAdId: string | null;
    setHighlightedAdId: (adId: string | null) => void;
    mapCenter: [number, number];
    mapZoom: number;
    t: (key: string) => string; // Translation function
    language: string; // Current language
}

// Component to handle map center changes
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

export default function AdsMap({
    ads,
    highlightedAdId,
    setHighlightedAdId,
    mapCenter,
    mapZoom,
    t,
}: AdsMapProps) {
    const highlightedAd = ads.find((ad) => ad.id === highlightedAdId);

    return (
        <div className="relative h-full w-full bg-gray-100 rounded-lg overflow-hidden border border-border-color shadow-lg">
            <MapContainer
                {...({ center: mapCenter, zoom: mapZoom, scrollWheelZoom: false } as any)}
                className="h-full w-full rounded-lg"
                style={{ zIndex: 0 }}
            >
                <ChangeView center={mapCenter} zoom={mapZoom} />
                <TileLayer
                    {...({ url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors" } as any)}
                />
                {ads.map((ad) => (
                    ad.latitude && ad.longitude ? (
                        <Marker
                            key={ad.id}
                            position={[ad.latitude, ad.longitude]}
                            eventHandlers={{
                                click: () => setHighlightedAdId(ad.id),
                            }}
                        >
                            <Popup>
                                <Link href={`/ads/${ad.id}`} className="font-bold text-primary hover:underline">
                                    {ad.title}
                                </Link>
                                <p className="text-sm text-gray-600">{ad.price?.toLocaleString()} SAR</p>
                            </Popup>
                        </Marker>
                    ) : null
                ))}
            </MapContainer>
            {highlightedAdId && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-white border-t border-border-color shadow-lg z-10 animate-in slide-in-from-bottom-5">
                    <Link href={`/ads/${highlightedAdId}`} className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-md overflow-hidden shrink-0">
                            {highlightedAd?.images && highlightedAd.images.length > 0 ? (
                                <Image
                                    src={highlightedAd.images[0]}
                                    alt={highlightedAd.title}
                                    width={64}
                                    height={64}
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                                    {t("noImage")}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h4 className="text-sm font-bold text-text-main line-clamp-1">{highlightedAd?.title}</h4>
                            <p className="text-xs text-text-muted">{highlightedAd?.price?.toLocaleString()} SAR</p>
                        </div>
                    </Link>
                </div>
            )}
        </div>
    );
}
