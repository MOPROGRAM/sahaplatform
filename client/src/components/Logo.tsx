import React from 'react';

interface LogoProps {
    className?: string;
    color?: string;
    viewBox?: string;
    preserveAspectRatio?: string;
    strokeWidth?: string | number;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-auto h-8", color = "currentColor", viewBox = "0 0 100 80", preserveAspectRatio, strokeWidth = "8.11" }) => {
    return (
        <svg 
            viewBox={viewBox} 
            preserveAspectRatio={preserveAspectRatio}
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className={className}
            aria-label="Logo"
        >
            <path 
                d="M 32 28 L 20 40 H 80 L 68 52" 
                stroke={color} 
                strokeWidth={strokeWidth} 
                strokeLinecap="round" 
                strokeLinejoin="round" 
            />
        </svg>
    );
};
