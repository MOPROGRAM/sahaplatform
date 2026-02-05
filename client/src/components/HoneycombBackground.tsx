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

interface HoneycombBackgroundProps {
    mouseX: number;
    mouseY: number;
    isActive: boolean;
}

export default function HoneycombBackground({ mouseX, mouseY, isActive }: HoneycombBackgroundProps) {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    
    useEffect(() => {
        if (!isActive) {
            setOffset({ x: 0, y: 0 });
            return;
        }
        // Smooth follow with damping
        // We assume mouseX/Y are relative to the center of the container passed from parent
        // Slow movement factor
        setOffset({
            x: mouseX / 40,
            y: mouseY / 40
        });
    }, [mouseX, mouseY, isActive]);

    // List of icons to randomly distribute
    const icons = [
        Car, Home, Briefcase, Smartphone, Wrench, ShoppingBag, 
        Zap, Star, Layers, Tag, Building2, Search
    ];

    // Determine if a cell should have an icon (random but deterministic based on index)
    const getIcon = (row: number, col: number) => {
        // Simple hash to decide if icon exists
        const hash = (row * 31 + col * 17) % 100;
        if (hash < 20) { // Increased to 20% chance
            const iconIndex = (row + col) % icons.length;
            const Icon = icons[iconIndex];
            return <Icon size={14} className="text-amber-700 dark:text-amber-500 opacity-90" />; // Increased visibility
        }
        return null;
    };

    // Grid configuration
    const rows = 6; 
    const cols = 30;

    return (
        <div 
            className="absolute inset-0 overflow-hidden -z-10 pointer-events-none bg-amber-50/50 dark:bg-amber-900/10"
        >
            <div 
                className="absolute inset-[-100px] flex flex-col justify-center transition-transform ease-out"
                style={{ 
                    transform: `translate(${offset.x}px, ${offset.y}px)`,
                    transitionDuration: isActive ? '300ms' : '250ms'
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
                                className="w-[44px] h-[50px] mx-[1px] relative flex items-center justify-center shrink-0 transition-colors duration-300"
                                style={{
                                    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                                    backgroundColor: "rgba(245, 158, 11, 0.2)" // Stronger orange
                                }}
                            >
                                {/* Inner border effect */}
                                <div 
                                    className="absolute inset-[1px] flex items-center justify-center"
                                    style={{
                                        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                                        backgroundColor: "rgba(255, 255, 255, 0.1)" // Reduced washout
                                    }}
                                >
                                     <div 
                                        className="absolute inset-[1px] flex items-center justify-center bg-white/10 dark:bg-black/10 hover:bg-amber-500/20 transition-colors"
                                        style={{
                                            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                                        }}
                                    >
                                        {getIcon(r, c)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
