"use client";

import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Particle {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    radius: number;
    baseX: number;
    baseY: number;
    color: string;
}

const InteractiveBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const mouse = useRef({ x: 0, y: 0, isActive: false });
    
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationFrameId: number;
        let width = 0;
        let height = 0;

        const isDark = theme === 'dark';
        
        // Configuration
        const particleCount = 100;
        const connectionDistance = 100;
        const mouseRadius = 150;
        const colors = isDark 
            ? ['#f59e0b', '#d97706', '#b45309'] // Dark mode: Deep Amber/Orange
            : ['#fbbf24', '#f59e0b', '#fcd34d']; // Light mode: Bright Amber/Yellow

        const init = () => {
            width = container.clientWidth;
            height = container.clientHeight;
            canvas.width = width;
            canvas.height = height;

            particles = [];
            for (let i = 0; i < particleCount; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const z = Math.random() * 2 + 0.5; // Depth factor
                particles.push({
                    x,
                    y,
                    z,
                    vx: (Math.random() - 0.5) * 0.1 * z, // Reduced speed from 0.5 to 0.1
                    vy: (Math.random() - 0.5) * 0.1 * z, // Reduced speed from 0.5 to 0.1
                    radius: Math.random() * 2 * z,
                    baseX: x,
                    baseY: y,
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            
            // Draw connecting lines first (behind particles)
            ctx.lineWidth = 1; // Increased line width from 0.5 to 1
            
            particles.forEach((p, index) => {
                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off edges
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                // Mouse interaction
                if (mouse.current.isActive) {
                    const dx = mouse.current.x - p.x;
                    const dy = mouse.current.y - p.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < mouseRadius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouseRadius - distance) / mouseRadius;
                        const directionX = forceDirectionX * force * p.z * 2;
                        const directionY = forceDirectionY * force * p.z * 2;

                        p.x -= directionX;
                        p.y -= directionY;
                    }
                }

                // Draw connections
                for (let j = index + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        // Increased opacity multiplier from 0.2 to 0.5 for clearer lines
                        const opacity = (1 - distance / connectionDistance) * 0.5 * p.z;
                        ctx.strokeStyle = isDark 
                            ? `rgba(245, 158, 11, ${opacity})` 
                            : `rgba(251, 191, 36, ${opacity})`;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                // Increased global alpha from 0.6 to 0.9 for more vibrant colors
                ctx.globalAlpha = 0.9 * p.z; 
                ctx.fill();
                ctx.globalAlpha = 1;
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.current.x = e.clientX - rect.left;
            mouse.current.y = e.clientY - rect.top;
            mouse.current.isActive = true;
        };

        const handleMouseLeave = () => {
            mouse.current.isActive = false;
        };

        const handleResize = () => {
            init();
        };

        init();
        animate();

        // Event listeners
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('resize', handleResize);
        };
    }, [theme]);

    return (
        <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden bg-gradient-to-br from-orange-50/50 via-amber-100/30 to-orange-50/50 dark:from-zinc-900 dark:via-zinc-800/50 dark:to-zinc-900 z-0">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            {/* Gradient Overlay for blending */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent dark:from-black/40 pointer-events-none" />
        </div>
    );
};

export default InteractiveBackground;
