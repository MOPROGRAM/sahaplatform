"use client";

import { useEffect, useRef, useState } from "react";
import { 
    Car, 
    Home, 
    Briefcase, 
    Smartphone, 
    Wrench, 
    ShoppingBag, 
    Zap, 
    Star,
    Layers,
    Tag,
    Building2,
    Search
} from "lucide-react";

export default function HoneycombBackground() {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);

    // List of icons to randomly distribute
    const icons = [
        Car, Home, Briefcase, Smartphone, Wrench, ShoppingBag, 
        Zap, Star, Layers, Tag, Building2, Search
    ];

    // Handle mouse movement for parallax effect
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        
        // Calculate offset based on mouse position relative to center
        // Slow movement: divide by larger number (e.g., 40)
        const x = (e.clientX - left - width / 2) / 40;
        const y = (e.clientY - top - height / 2) / 40;
        
        setOffset({ x, y });
        setIsHovering(true);
    };

    const handleMouseLeave = () => {
        setOffset({ x: 0, y: 0 });
        setIsHovering(false);
    };

    // Determine if a cell should have an icon (random but deterministic based on index)
    const getIcon = (row: number, col: number) => {
        // Simple hash to decide if icon exists
        const hash = (row * 31 + col * 17) % 100;
        if (hash < 15) { // 15% chance
            const iconIndex = (row + col) % icons.length;
            const Icon = icons[iconIndex];
            return <Icon size={14} className="text-amber-500/40 opacity-70" />;
        }
        return null;
    };

    // Grid configuration
    // Enough to cover typical screen width/height for the banner
    const rows = 6; 
    const cols = 30;

    return (
        <div 
            ref={containerRef}
            className="absolute inset-0 overflow-hidden -z-10 bg-transparent pointer-events-auto"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div 
                className="absolute inset-[-100px] flex flex-col justify-center transition-transform ease-out"
                style={{ 
                    transform: `translate(${offset.x}px, ${offset.y}px)`,
                    transitionDuration: isHovering ? '100ms' : '250ms' // Fast response on hover, smooth reset
                }}
            >
                {Array.from({ length: rows }).map((_, r) => (
                    <div 
                        key={r} 
                        className={`flex ${r % 2 === 1 ? 'pl-[22px]' : ''} -mt-[8px]`}
                    >
                        {Array.from({ length: cols }).map((_, c) => (
                            <div 
                                key={`${r}-${c}`}
                                className="w-[44px] h-[50px] mx-[1px] relative flex items-center justify-center shrink-0 transition-all duration-300 hover:scale-105"
                                style={{
                                    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                                    backgroundColor: "rgba(245, 158, 11, 0.03)" // Very subtle orange
                                }}
                            >
                                {/* Inner border effect using inset shadow or a smaller inner hex */}
                                <div 
                                    className="absolute inset-[1px] flex items-center justify-center"
                                    style={{
                                        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                                        backgroundColor: "rgba(245, 158, 11, 0.05)" // Slightly darker inner
                                    }}
                                >
                                    {getIcon(r, c)}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
