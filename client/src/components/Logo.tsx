import React from 'react';

interface LogoProps {
    className?: string;
    color?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-auto h-8", color = "currentColor" }) => {
    return (
        <svg 
            viewBox="0 0 100 80" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className={className}
            aria-label="Logo"
        >
            <path 
                d="M10 15 H 90 L 10 65 H 90" 
                stroke={color} 
                strokeWidth="12" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
            />
        </svg>
    );
};
