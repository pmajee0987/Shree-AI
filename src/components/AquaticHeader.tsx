import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface AquaticHeaderProps {
  isActive: boolean;
  onOpenMenu: () => void;
  onOpenAdmin?: () => void;
}

export function AquaticHeader({ isActive, onOpenMenu, onOpenAdmin }: AquaticHeaderProps) {
  const [currentTime, setCurrentTime] = useState('');
  const [tapCount, setTapCount] = useState(0);

  const handleTitleClick = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 5) {
      setTapCount(0);
      if (onOpenAdmin) onOpenAdmin();
    }
    setTimeout(() => {
      setTapCount(0);
    }, 3000);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 flex items-center justify-between pointer-events-none">
      {/* Left Side: Water-drop Menu Button + SHREE Name */}
      <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto">
        {/* Glass Water-Drop Style Menu Button */}
        <motion.button
          onClick={onOpenMenu}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full rounded-tl-sm bg-cyan-950/40 backdrop-blur-md border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center group overflow-hidden transition-all duration-300 active:shadow-[0_0_25px_rgba(6,182,212,0.6)]"
          title="Open Menu"
        >
          {/* Water reflection highlight */}
          <div className="absolute top-1 left-2 w-4 h-2 bg-white/40 rounded-full blur-[0.5px]" />
          
          {/* 3 Minimal Horizontal Menu Lines */}
          <div className="flex flex-col gap-1.5 items-center justify-center z-10">
            <span className="w-5 h-[2px] bg-cyan-200 rounded-full group-hover:w-6 transition-all duration-300 group-hover:bg-cyan-100" />
            <span className="w-4 h-[2px] bg-cyan-300/80 rounded-full group-hover:w-5 transition-all duration-300 group-hover:bg-cyan-100" />
            <span className="w-5 h-[2px] bg-cyan-200 rounded-full group-hover:w-4 transition-all duration-300 group-hover:bg-cyan-100" />
          </div>

          {/* Liquid Ripple Effect on Hover */}
          <div className="absolute inset-0 bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
        </motion.button>

        {/* Brand Name SHREE with Admin Tap Trigger */}
        <div 
          onClick={handleTitleClick}
          className="flex items-center gap-2.5 pl-1 cursor-pointer active:scale-95 transition-transform group"
          title="Tap 5 times to open Admin Panel"
        >
          <div className="flex items-center gap-0.5 sm:gap-1">
            {['S', 'H', 'R', 'E', 'E'].map((letter, index) => (
              <span
                key={index}
                style={{ animationDelay: `${index * 0.2}s` }}
                className="animate-shree-letter inline-block text-2xl sm:text-3xl font-black tracking-[2px] sm:tracking-[4px] uppercase font-sans select-none"
              >
                {letter}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Telegram Channel & System Status Card */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Telegram Direct Link Button */}
        <a
          href="https://t.me/xprojectsa"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-2xl bg-sky-950/60 backdrop-blur-md border border-sky-400/40 shadow-[0_0_12px_rgba(56,189,248,0.25)] flex items-center justify-center text-sky-300 hover:text-white hover:scale-105 active:scale-95 transition-all"
          title="Join Telegram Channel"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.38-.49 1.07-.75 4.19-1.82 6.98-3.02 8.38-3.6 3.99-1.66 4.82-1.95 5.36-1.96.12 0 .38.03.55.17.14.12.18.28.2.44-.01.06.01.23 0 .38z"/>
          </svg>
        </a>

        {/* System Status Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-400/30 rounded-2xl px-3 sm:px-4 py-2 flex items-center gap-2.5 sm:gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.4),0_0_15px_rgba(6,182,212,0.15)]">
          {/* Virtual System Labels */}
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-cyan-200/90 uppercase leading-tight font-mono">
              VIRTUAL
            </span>
            <span className="text-[8px] sm:text-[9px] font-semibold tracking-wider text-cyan-400/70 uppercase leading-tight font-mono">
              SYSTEM
            </span>
          </div>

          {/* Active Status Pulse Indicator */}
          <div className="flex items-center gap-1.5 bg-cyan-950/50 border border-cyan-400/30 px-2 py-1 rounded-full">
            <motion.span
              animate={
                isActive
                  ? { scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }
                  : { opacity: 0.4 }
              }
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className={`w-2 h-2 rounded-full ${
                isActive
                  ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                  : 'bg-cyan-600/50'
              }`}
            />
            <span className="text-[9px] font-bold tracking-wider text-cyan-100 uppercase font-mono">
              {isActive ? 'ACTIVE' : 'STANDBY'}
            </span>
          </div>

          <div className="w-px h-6 bg-cyan-500/20" />

          {/* Dynamic Time */}
          <span className="text-xs sm:text-sm font-bold font-mono tracking-wider text-cyan-100 drop-shadow-[0_0_6px_rgba(34,211,238,0.4)]">
            {currentTime || '21:11'}
          </span>
        </div>
      </div>
    </header>
  );
}
