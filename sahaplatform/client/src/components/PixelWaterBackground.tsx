"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface PixelWaterBackgroundProps {
    className?: string;
}

export default function PixelWaterBackground({ className }: PixelWaterBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    const colsRef = useRef(0);
    const rowsRef = useRef(0);
    const currentRef = useRef<Float32Array>(new Float32Array(0));
    const previousRef = useRef<Float32Array>(new Float32Array(0));
    const shapesRef = useRef<Uint8Array>(new Uint8Array(0));
    const damping = 0.985;
    const timeRef = useRef(0);
    const lastActiveTimeRef = useRef(0);

    const mouseRef = useRef({ x: -1, y: -1, active: false });

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        const cellSize = 10;

        const resize = () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            if (width === 0 || height === 0) return;

            canvas.width = width;
            canvas.height = height;

            const cols = Math.ceil(width / cellSize);
            const rows = Math.ceil(height / cellSize);
            if (cols !== colsRef.current || rows !== rowsRef.current) {
                colsRef.current = cols;
                rowsRef.current = rows;
                currentRef.current = new Float32Array(cols * rows);
                previousRef.current = new Float32Array(cols * rows);
                shapesRef.current = new Uint8Array(cols * rows);
                for (let i = 0; i < cols * rows; i++) {
                    shapesRef.current[i] = Math.floor(Math.random() * 3);
                }
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
            mouseRef.current.active = inside;
            if (inside) {
                mouseRef.current.x = x;
                mouseRef.current.y = y;
                lastActiveTimeRef.current = performance.now();
            }
        };

        resize();
        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", handleMouseMove);

        const draw = () => {
            const width = canvas.width;
            const height = canvas.height;
            const cols = colsRef.current;
            const rows = rowsRef.current;
            const current = currentRef.current;
            const previous = previousRef.current;

            if (mouseRef.current.active) {
                const mx = Math.floor(mouseRef.current.x / cellSize);
                const my = Math.floor(mouseRef.current.y / cellSize);
                if (mx > 0 && mx < cols - 1 && my > 0 && my < rows - 1) {
                    previous[mx + my * cols] = 120;
                }
            }
            const now = performance.now();
            const elapsed = now - lastActiveTimeRef.current;
            const allowAmbient = mouseRef.current.active || elapsed <= 100;
            if (allowAmbient) {
                timeRef.current += 0.02;
                const ax = Math.floor(cols / 2 + Math.sin(timeRef.current * 0.8) * (cols / 6));
                const ay = Math.floor(rows / 2 + Math.cos(timeRef.current * 0.6) * (rows / 8));
                if (ax > 1 && ax < cols - 2 && ay > 1 && ay < rows - 2) {
                    previous[ax + ay * cols] += 0.4;
                }
            }

            for (let i = 1; i < cols - 1; i++) {
                for (let j = 1; j < rows - 1; j++) {
                    const idx = i + j * cols;
                    current[idx] = (
                        previous[i - 1 + j * cols] +
                        previous[i + 1 + j * cols] +
                        previous[i + (j - 1) * cols] +
                        previous[i + (j + 1) * cols]
                    ) / 2 - current[idx];
                    const effectiveDamping = allowAmbient ? damping : 0.60;
                    current[idx] *= effectiveDamping;
                    if (!allowAmbient && Math.abs(current[idx]) < 0.0025) {
                        current[idx] = 0;
                    }
                }
            }

            const temp = previousRef.current;
            previousRef.current = currentRef.current;
            currentRef.current = temp;
            const dataToDraw = previousRef.current;

            ctx.clearRect(0, 0, width, height);
            const isDark = document.documentElement.classList.contains("dark");
            const baseColor = isDark ? "rgba(10, 10, 10, 0.95)" : "rgba(255, 255, 255, 0.95)";
            const squareColor = isDark ? "rgba(26, 26, 26, 0.8)" : "rgba(240, 240, 240, 0.8)";
            
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = baseColor;
            ctx.fillRect(0, 0, width, height);

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const idx = i + j * cols;
                    const val = dataToDraw[idx];
                    const cx = i * cellSize + cellSize / 2;
                    const cy = j * cellSize + cellSize / 2;
                    ctx.fillStyle = squareColor;
                    const alpha = Math.min(Math.abs(val) / 120, 0.35);
                    const scale = 1 + Math.min(Math.abs(val) / 800, 0.15);
                    const baseSize = cellSize * 0.9;
                    const size = baseSize * scale;
                    const shape = shapesRef.current[idx] ?? 0;

                    if (alpha > 0.01) {
                        // Light Orange color for active pixels (Orange-400 equivalent)
                        // Use slightly different opacity for dark/light modes to ensure visibility
                        ctx.fillStyle = isDark 
                            ? `rgba(255, 165, 0, ${alpha * 1.5})`  // More visible in dark mode
                            : `rgba(255, 165, 0, ${alpha})`;      // Standard in light mode
                    } else {
                        ctx.fillStyle = squareColor;
                    }

                    if (shape === 0) {
                        const offset = (cellSize - size) / 2;
                        ctx.fillRect(i * cellSize + offset, j * cellSize + offset, size, size);
                    } else if (shape === 1) {
                        const radius = size / 2;
                        ctx.beginPath();
                        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        const half = size / 2;
                        ctx.beginPath();
                        ctx.moveTo(cx, cy - half);
                        ctx.lineTo(cx + half, cy);
                        ctx.lineTo(cx, cy + half);
                        ctx.lineTo(cx - half, cy);
                        ctx.closePath();
                        ctx.fill();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    return (
        <div ref={containerRef} className={`absolute z-0 overflow-hidden pointer-events-none ${className}`}>
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
}