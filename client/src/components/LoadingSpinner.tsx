"use client";

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
    size?: number;
    className?: string;
}

export default function LoadingSpinner({ size = 40, className = "" }: LoadingSpinnerProps) {
    return (
        <Loader2
            className={`animate-spin text-primary ${className}`}
            size={size}
        />
    );
}

// Alternative Domino Loading Spinner
export function DominoSpinner({ size = 60 }: { size?: number }) {
    return (
        <div className="loading-domino" style={{ width: size, height: size }}>
            {Array.from({ length: 8 }, (_, i) => (
                <span key={i} />
            ))}
        </div>
    );
}