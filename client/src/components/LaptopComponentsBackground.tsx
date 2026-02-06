"use client";

import { useEffect, useRef } from "react";

const LaptopComponentsBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Laptop internal components patterns
    const components = [
      // Circuit patterns
      { type: 'circuit', x: 0.2, y: 0.3, size: 0.1, speed: 0.001 },
      { type: 'circuit', x: 0.7, y: 0.6, size: 0.08, speed: 0.0008 },
      { type: 'circuit', x: 0.4, y: 0.8, size: 0.12, speed: 0.0012 },
      
      // Chip patterns
      { type: 'chip', x: 0.6, y: 0.2, size: 0.05, speed: 0.0005 },
      { type: 'chip', x: 0.3, y: 0.5, size: 0.07, speed: 0.0007 },
      { type: 'chip', x: 0.8, y: 0.7, size: 0.06, speed: 0.0006 },
      
      // Memory modules
      { type: 'memory', x: 0.1, y: 0.7, size: 0.09, speed: 0.0009 },
      { type: 'memory', x: 0.5, y: 0.4, size: 0.11, speed: 0.0011 },
    ];

    let animationFrame: number;
    let time = 0;

    const draw = () => {
      if (!ctx) return;

      // Clear canvas with semi-transparent background
      ctx.fillStyle = 'rgba(10, 10, 20, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw each component
      components.forEach(component => {
        const x = component.x * canvas.width;
        const y = component.y * canvas.height;
        const size = component.size * Math.min(canvas.width, canvas.height);
        
        // Animate position with smooth movement
        const offsetX = Math.sin(time * component.speed) * 20;
        const offsetY = Math.cos(time * component.speed * 0.8) * 15;

        ctx.save();
        ctx.translate(x + offsetX, y + offsetY);

        switch (component.type) {
          case 'circuit':
            drawCircuit(ctx, size, time);
            break;
          case 'chip':
            drawChip(ctx, size, time);
            break;
          case 'memory':
            drawMemoryModule(ctx, size, time);
            break;
        }

        ctx.restore();
      });

      time += 0.01;
      animationFrame = requestAnimationFrame(draw);
    };

    const drawCircuit = (ctx: CanvasRenderingContext2D, size: number, time: number) => {
      ctx.strokeStyle = `hsl(${210 + Math.sin(time * 0.5) * 30}, 70%, 60%)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      // Draw circuit pattern
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = size * 0.3;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      
      ctx.closePath();
      ctx.stroke();

      // Draw connections
      for (let i = 0; i < 4; i++) {
        const angle1 = (i / 4) * Math.PI * 2;
        const angle2 = ((i + 2) / 4) * Math.PI * 2;
        
        const x1 = Math.cos(angle1) * size * 0.4;
        const y1 = Math.sin(angle1) * size * 0.4;
        const x2 = Math.cos(angle2) * size * 0.4;
        const y2 = Math.sin(angle2) * size * 0.4;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    };

    const drawChip = (ctx: CanvasRenderingContext2D, size: number, time: number) => {
      // Chip body
      ctx.fillStyle = `hsl(${280 + Math.sin(time * 0.4) * 20}, 60%, 50%)`;
      ctx.fillRect(-size/2, -size/2, size, size);
      
      // Chip details
      ctx.fillStyle = `hsl(${200 + Math.cos(time * 0.3) * 40}, 80%, 70%)`;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          ctx.fillRect(
            -size/2 + size/5 * (i + 0.5) - size/10,
            -size/2 + size/5 * (j + 0.5) - size/10,
            size/10,
            size/10
          );
        }
      }
    };

    const drawMemoryModule = (ctx: CanvasRenderingContext2D, size: number, time: number) => {
      // Memory module body
      ctx.fillStyle = `hsl(${180 + Math.sin(time * 0.6) * 25}, 65%, 45%)`;
      ctx.fillRect(-size/2, -size/3, size, size/1.5);
      
      // Memory chips
      ctx.fillStyle = `hsl(${160 + Math.cos(time * 0.5) * 30}, 75%, 65%)`;
      for (let i = 0; i < 8; i++) {
        ctx.fillRect(
          -size/2 + size/10 * (i + 1),
          -size/3 + size/6,
          size/15,
          size/4
        );
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-60"
      style={{ 
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        mixBlendMode: 'screen'
      }}
    />
  );
};

export default LaptopComponentsBackground;