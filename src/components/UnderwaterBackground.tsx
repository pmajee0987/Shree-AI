import React, { useMemo } from 'react';

interface UnderwaterBackgroundProps {
  isPerformanceMode?: boolean;
}

export function UnderwaterBackground({ isPerformanceMode = true }: UnderwaterBackgroundProps) {
  // Generate random bubbles count based on mode (fewer on performance mode to keep mobile fast & cool)
  const count = isPerformanceMode ? 6 : 10;
  
  const bubbles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: Math.random() * 8 + 6, // 6px - 14px
      left: `${Math.random() * 92 + 4}%`,
      duration: `${Math.random() * 8 + 10}s`, // 10s - 18s
      delay: `${Math.random() * 6}s`,
      wobble: `${Math.random() * 16 - 8}px`,
    }));
  }, [count]);

  // Generate floating particles
  const particleCount = isPerformanceMode ? 8 : 14;
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      duration: `${Math.random() * 5 + 4}s`,
      delay: `${Math.random() * 3}s`,
    }));
  }, [particleCount]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#020b18] gpu-layer">
      {/* Base Deep Ocean Radial Gradient */}
      <div 
        className="absolute inset-0 opacity-90"
        style={{
          background: 'radial-gradient(circle at 50% 40%, #032147 0%, #020f26 55%, #010714 100%)'
        }}
      />

      {/* Top Underwater Surface Glow */}
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-cyan-500/10 via-blue-500/5 to-transparent pointer-events-none" />
      
      {/* Light Rays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[70vh] opacity-20 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="350,0 450,0 550,600 250,600" fill="url(#ray1)" opacity="0.6" />
          <polygon points="200,0 300,0 400,600 100,600" fill="url(#ray2)" opacity="0.4" />
          <polygon points="500,0 600,0 720,600 380,600" fill="url(#ray1)" opacity="0.5" />
          <defs>
            <linearGradient id="ray1" x1="400" y1="0" x2="400" y2="600" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="0.6" stopColor="#3b82f6" stopOpacity="0.1" />
              <stop offset="1" stopColor="#020b18" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ray2" x1="250" y1="0" x2="250" y2="600" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22d3ee" stopOpacity="0.3" />
              <stop offset="1" stopColor="#020b18" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Lightweight Floating Particles (CSS Keyframe Animated) */}
      {particles.map((p) => (
        <div
          key={`particle-${p.id}`}
          className="absolute rounded-full bg-cyan-200/40 animate-particle-drift"
          style={{
            left: p.x,
            top: p.y,
            width: `${p.size}px`,
            height: `${p.size}px`,
            '--particle-duration': p.duration,
            '--particle-delay': p.delay,
          } as React.CSSProperties}
        />
      ))}

      {/* Lightweight Rising Bubbles (CSS Keyframe Animated - No backdrop-blur) */}
      {bubbles.map((b) => (
        <div
          key={`bubble-${b.id}`}
          className="absolute rounded-full border border-cyan-300/40 bg-cyan-400/10 animate-bubble-rise"
          style={{
            left: b.left,
            bottom: '-20px',
            width: `${b.size}px`,
            height: `${b.size}px`,
            '--bubble-duration': b.duration,
            '--bubble-delay': b.delay,
            '--wobble-x': b.wobble,
          } as React.CSSProperties}
        >
          {/* Bubble reflection dot */}
          <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white/70 rounded-full" />
        </div>
      ))}

      {/* Subtle Vignette Edge */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60 pointer-events-none" />
    </div>
  );
}

