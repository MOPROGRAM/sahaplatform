"use client";

import { useEffect, useState } from "react";

interface HoneycombBackgroundProps {
    mouseX: number;
    mouseY: number;
    isActive: boolean;
}

export default function HoneycombBackground({ mouseX, mouseY, isActive }: HoneycombBackgroundProps) {
    const [mounted, setMounted] = useState(false);
    
    // Smooth mouse position for the spotlight effect
    const [smoothMouse, setSmoothMouse] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isActive) return;
        // Simple easing for smoother spotlight movement
        const move = () => {
            setSmoothMouse(prev => ({
                x: prev.x + (mouseX - prev.x) * 0.1,
                y: prev.y + (mouseY - prev.y) * 0.1
            }));
        };
        const frame = requestAnimationFrame(move);
        return () => cancelAnimationFrame(frame);
    }, [mouseX, mouseY, isActive]);

    if (!mounted) return null;

    // Hexagon configuration
    // Side length s = 8px -> Width ≈ 14px, Height = 16px
    // This provides a high-density "professional" mesh look.
    const s = 8;
    const w = Math.sqrt(3) * s; 
    
    // Pattern tile dimensions (Minimal tiling unit)
    const pWidth = w;
    const pHeight = 3 * s;

    // Optimized Hex Path for seamless tiling:
    // 1. Full Hexagon centered at top
    // 2. Vertical line segment extending to bottom to connect to next tile
    const hexPath = `
        M ${w/2} 0 
        L ${w} ${s/2} 
        L ${w} ${s*1.5} 
        L ${w/2} ${s*2} 
        L 0 ${s*1.5} 
        L 0 ${s/2} 
        Z 
        M ${w/2} ${s*2} 
        L ${w/2} ${s*3}
    `;

    return (
        <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none bg-gray-50/50 dark:bg-black transition-colors duration-500">
            <svg className="absolute inset-0 w-full h-full">
                <defs>
                    {/* Define the hexagon path for the pattern */}
                    <pattern 
                        id="hex-pattern" 
                        x="0" 
                        y="0" 
                        width={pWidth} 
                        height={pHeight} 
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d={hexPath}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="0.5"
                            className="text-amber-900/5 dark:text-amber-500/10"
                        />
                    </pattern>

                    {/* Brighter pattern for the spotlight */}
                    <pattern 
                        id="hex-pattern-active" 
                        x="0" 
                        y="0" 
                        width={pWidth} 
                        height={pHeight} 
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d={hexPath}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            className="text-amber-600/30 dark:text-amber-400/40"
                        />
                        {/* Subtle fill for the active hexes */}
                        <path
                             d={`M ${w/2} 0 L ${w} ${s/2} L ${w} ${s*1.5} L ${w/2} ${s*2} L 0 ${s*1.5} L 0 ${s/2} Z`}
                             className="fill-amber-500/5 dark:fill-amber-400/5"
                             stroke="none"
                        />
                    </pattern>

                    {/* Spotlight Mask */}
                    <radialGradient id="spotlight-gradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="white" stopOpacity="1" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </radialGradient>
                    
                    <mask id="spotlight-mask">
                        <circle cx={smoothMouse.x} cy={smoothMouse.y} r="300" fill="url(#spotlight-gradient)" />
                    </mask>
                </defs>

                {/* Base Grid */}
                <rect width="100%" height="100%" fill="url(#hex-pattern)" />

                {/* Active Spotlight Grid */}
                <rect 
                    width="100%" 
                    height="100%" 
                    fill="url(#hex-pattern-active)" 
                    mask="url(#spotlight-mask)"
                    className="opacity-80"
                />
            </svg>
            
            {/* Ambient Glow */}
            <div 
                className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-transparent pointer-events-none"
            />
        </div>
    );
}
