import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Smartphone, Zap, Sparkles, Vibrate, Cpu, ShieldCheck } from 'lucide-react';
import { getCapacitorInfo, triggerHaptic, CapacitorPlatformInfo } from '../capacitor';
import { SplashScreen } from '@capacitor/splash-screen';

export function CapacitorCard() {
  const [info, setInfo] = useState<CapacitorPlatformInfo | null>(null);
  const [hapticTestStatus, setHapticTestStatus] = useState<string | null>(null);
  const [splashTesting, setSplashTesting] = useState(false);

  useEffect(() => {
    getCapacitorInfo().then(setInfo);
  }, []);

  const handleTestHaptic = async (style: 'light' | 'medium' | 'heavy') => {
    await triggerHaptic(style);
    setHapticTestStatus(`${style.toUpperCase()} Haptic Triggered!`);
    setTimeout(() => setHapticTestStatus(null), 2000);
  };

  const handleTestSplash = async () => {
    if (splashTesting) return;
    setSplashTesting(true);
    try {
      if (info?.isNative) {
        await SplashScreen.show({ autoHide: false });
        setTimeout(async () => {
          await SplashScreen.hide({ fadeOutDuration: 300 });
          setSplashTesting(false);
        }, 1500);
      } else {
        setTimeout(() => setSplashTesting(false), 1500);
      }
    } catch (e) {
      console.warn('Splash screen test error:', e);
      setSplashTesting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/90 via-cyan-950/50 to-slate-950/90 border border-cyan-400/40 rounded-2xl p-4 shadow-[0_0_20px_rgba(6,182,212,0.15)] relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-400/20 text-cyan-300">
            <Smartphone size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wider text-cyan-100 uppercase flex items-center gap-1.5">
              CAPACITOR NATIVE BRIDGE <Sparkles size={12} className="text-cyan-400 animate-pulse" />
            </h3>
            <span className="text-[10px] text-cyan-300/80 font-mono">
              React 19 + Vite 6 + Capacitor 8 runtime
            </span>
          </div>
        </div>

        {/* Platform Badge */}
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border flex items-center gap-1 uppercase ${
            info?.isNative
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
              : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
          }`}
        >
          <Zap size={10} />
          {info?.platform ? `${info.platform} ${info.isNative ? '(Native)' : '(Web)'}` : 'Loading...'}
        </span>
      </div>

      {/* Device Specifications Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3 font-mono text-[11px]">
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-cyan-500/20 flex flex-col">
          <span className="text-[9px] text-cyan-400/70 uppercase">BUILD ENGINE</span>
          <span className="font-semibold text-cyan-100 truncate">Vite 6 SPA / CJS</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-cyan-500/20 flex flex-col">
          <span className="text-[9px] text-cyan-400/70 uppercase">NATIVE FRAMEWORK</span>
          <span className="font-semibold text-cyan-100 truncate">Capacitor v8 Android</span>
        </div>
        {info?.deviceInfo && (
          <>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-cyan-500/20 flex flex-col">
              <span className="text-[9px] text-cyan-400/70 uppercase">MODEL / BRAND</span>
              <span className="font-semibold text-cyan-100 truncate">
                {info.deviceInfo.manufacturer} {info.deviceInfo.model}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-cyan-500/20 flex flex-col">
              <span className="text-[9px] text-cyan-400/70 uppercase">OS VERSION</span>
              <span className="font-semibold text-cyan-100 truncate">
                {info.deviceInfo.operatingSystem} {info.deviceInfo.osVersion}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Interactive Capacitor Feature Testing Controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-cyan-300/90 uppercase">
          <span className="flex items-center gap-1">
            <Vibrate size={12} /> Test Native Haptic Vibration
          </span>
          {hapticTestStatus && (
            <span className="text-emerald-400 text-[9px] animate-pulse">{hapticTestStatus}</span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleTestHaptic('light')}
            className="px-2.5 py-1.5 rounded-xl bg-cyan-950/70 border border-cyan-500/30 hover:border-cyan-400 text-cyan-200 text-[10px] font-mono font-bold transition-all active:scale-95"
          >
            Light
          </button>
          <button
            onClick={() => handleTestHaptic('medium')}
            className="px-2.5 py-1.5 rounded-xl bg-cyan-900/60 border border-cyan-400/40 hover:border-cyan-300 text-cyan-100 text-[10px] font-mono font-bold transition-all active:scale-95 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
          >
            Medium
          </button>
          <button
            onClick={() => handleTestHaptic('heavy')}
            className="px-2.5 py-1.5 rounded-xl bg-cyan-600/30 border border-cyan-300 hover:border-white text-white text-[10px] font-mono font-bold transition-all active:scale-95 shadow-[0_0_12px_rgba(34,211,238,0.4)]"
          >
            Heavy
          </button>
        </div>

        {/* Test Native Splash Screen */}
        <button
          onClick={handleTestSplash}
          disabled={splashTesting}
          className="w-full mt-2 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-400/40 hover:border-cyan-300 text-cyan-100 text-[11px] font-mono font-bold flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
        >
          <ShieldCheck size={14} className="text-cyan-400" />
          {splashTesting ? 'Testing Splash Screen...' : 'Test Capacitor Splash Screen'}
        </button>
      </div>
    </div>
  );
}
