"use client";

import { useEffect, useRef } from "react";

// --- Interfaces and Types ---
interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  life: number;
  maxLife: number;
  type: 'dot' | 'line';
}

interface CircuitLine {
  path: Path2D;
  speed: number;
  offset: number;
  length: number;
  color: string;
}

// --- Main Component ---
const NothingStyleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let circuitLines: CircuitLine[] = [];

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      particles = [];
      circuitLines = createCircuitLines(canvas.offsetWidth, canvas.offsetHeight);
    };

    const createCircuitLines = (width: number, height: number): CircuitLine[] => {
      const lines: CircuitLine[] = [];
      const lineCount = 20;

      for (let i = 0; i < lineCount; i++) {
        const path = new Path2D();
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        path.moveTo(startX, startY);

        let currentX = startX;
        let currentY = startY;
        const segments = 5 + Math.random() * 5;

        for (let j = 0; j < segments; j++) {
          const nextX = currentX + (Math.random() - 0.5) * 200;
          const nextY = currentY + (Math.random() - 0.5) * 200;
          path.lineTo(nextX, nextY);
          currentX = nextX;
          currentY = nextY;
        }
        
        lines.push({
          path,
          speed: 0.1 + Math.random() * 0.2,
          offset: Math.random() * 1000,
          length: 0.1 + Math.random() * 0.2,
          color: `rgba(255, 255, 255, ${0.1 + Math.random() * 0.2})`,
        });
      }
      return lines;
    };

    const addParticle = () => {
      if (particles.length > 100) return;
      const life = 100 + Math.random() * 200;
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        size: 1 + Math.random() * 2,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: 1,
        life: life,
        maxLife: life,
        type: Math.random() > 0.2 ? 'dot' : 'line',
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- Draw Circuit Lines ---
      circuitLines.forEach(line => {
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([line.length * 100, (1 - line.length) * 100]);
        line.offset -= line.speed;
        ctx.lineDashOffset = line.offset;
        ctx.stroke(line.path);
      });

      // --- Draw and Update Particles ---
      particles.forEach((p, index) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.life -= 1;
        p.opacity = p.life / p.maxLife;

        if (p.life <= 0) {
          particles.splice(index, 1);
          return;
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.8})`;
        
        if (p.type === 'dot') {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(p.x, p.y, p.size * 10, 1);
        }
      });

      if (Math.random() > 0.95) {
        addParticle();
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    // --- Init and Cleanup ---
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-70"
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #101010 50%, #000000 100%)',
        mixBlendMode: 'screen',
      }}
    />
  );
};

export default NothingStyleBackground;
