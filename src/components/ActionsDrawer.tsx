import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Monitor, Gamepad2, Upload, Bug, X, Sparkles, Check, Palette, Info, Send, ExternalLink, Key, Eye, EyeOff, Save, Trash2, Mic, Camera, HardDrive, Layers, BatteryCharging, ShieldCheck, CheckCircle2, XCircle, Sliders, ShieldAlert, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { triggerHaptic } from '../capacitor';

interface ActionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onStartGame: () => void;
  onUploadImage: () => void;
  onToggleScreen: () => void;
  isScreenSharing: boolean;
  showDebug: boolean;
  onToggleDebug: () => void;
  themes?: Record<string, { name: string; primary: string; secondary: string }>;
  currentTheme?: string;
  onSelectTheme?: (themeKey: string) => void;
  customApiKey?: string;
  onSaveApiKey?: (key: string) => void;
  isPerformanceMode?: boolean;
  onTogglePerformanceMode?: () => void;
  userName?: string;
  onSaveUserName?: (name: string) => void;
  onOpenAdmin?: () => void;
  currentVisual?: string;
  onChangeAvatar?: (url: string) => void;
}

export function ActionsDrawer({
  isOpen,
  onClose,
  title,
  onStartGame,
  onUploadImage,
  onToggleScreen,
  isScreenSharing,
  showDebug,
  onToggleDebug,
  themes,
  currentTheme,
  onSelectTheme,
  customApiKey = '',
  onSaveApiKey,
  isPerformanceMode = true,
  onTogglePerformanceMode,
  userName = 'Krish',
  onSaveUserName,
  onOpenAdmin,
  currentVisual,
  onChangeAvatar,
}: ActionsDrawerProps) {
  const [apiKeyInput, setApiKeyInput] = useState(customApiKey);
  const [showPassword, setShowPassword] = useState(false);
  const [customAvatarUrlInput, setCustomAvatarUrlInput] = useState('');

  const AVATAR_PRESETS = [
    { name: 'Pink Sakura Avatar', url: 'https://i.ibb.co/k6zJ0Rby/blush.jpg' },
    { name: 'Playful Wink', url: 'https://i.ibb.co/fzg90pKT/wink.jpg' },
    { name: 'Cute Chin', url: 'https://i.ibb.co/TDPqWrQP/chin.jpg' },
    { name: 'Sassy Smirk', url: 'https://i.ibb.co/VWnmW51k/smirk.jpg' },
    { name: 'Heart Eyes', url: 'https://i.ibb.co/mVMvKSpt/heart-eyes.jpg' },
    { name: 'Starry Eyes', url: 'https://i.ibb.co/Q7dWVLNg/starry-eyes.jpg' },
    { name: 'Hair Swirl', url: 'https://i.ibb.co/BVSHQHBB/hair-swirl.jpg' },
    { name: 'Cyberpunk Glow', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop' },
    { name: 'Ethereal Portrait', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop' },
  ];
  const [isSaved, setIsSaved] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [isNameSaved, setIsNameSaved] = useState(false);

  useEffect(() => {
    setNameInput(userName);
  }, [userName]);

  // App Permissions & System Settings State
  const [micStatus, setMicStatus] = useState<'granted' | 'prompt' | 'denied'>('prompt');
  const [cameraStatus, setCameraStatus] = useState<'granted' | 'prompt' | 'denied'>('prompt');
  const [storageStatus, setStorageStatus] = useState<'granted' | 'prompt'>('prompt');
  const [displayOverApps, setDisplayOverApps] = useState<boolean>(() => {
    return localStorage.getItem('perm_display_over_apps') === 'true';
  });
  const [batteryOptIgnored, setBatteryOptIgnored] = useState<boolean>(() => {
    return localStorage.getItem('perm_battery_opt_ignored') === 'true';
  });
  const [accessibilityActive, setAccessibilityActive] = useState<boolean>(() => {
    return localStorage.getItem('perm_accessibility_active') === 'true';
  });

  // Sync state & check browser permissions when drawer opens
  useEffect(() => {
    setApiKeyInput(customApiKey);

    if (isOpen) {
      checkPermissions();
    }
  }, [customApiKey, isOpen]);

  const checkPermissions = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        // Mic query
        try {
          const micRes = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setMicStatus(micRes.state as any);
        } catch (e) {
          /* ignore browser differences */
        }
        // Camera query
        try {
          const camRes = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setCameraStatus(camRes.state as any);
        } catch (e) {
          /* ignore browser differences */
        }
      }
      // Check persistent storage
      if (navigator.storage && navigator.storage.persisted) {
        const isPersisted = await navigator.storage.persisted();
        if (isPersisted) setStorageStatus('granted');
      }
    } catch (err) {
      console.log('Error checking permissions:', err);
    }
  };

  const handleRequestMic = async () => {
    triggerHaptic('light');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicStatus('granted');
    } catch (err) {
      console.warn('Microphone permission error:', err);
      setMicStatus('denied');
    }
  };

  const handleRequestCamera = async () => {
    triggerHaptic('light');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      setCameraStatus('granted');
    } catch (err) {
      console.warn('Camera permission error:', err);
      setCameraStatus('denied');
    }
  };

  const handleRequestStorage = async () => {
    triggerHaptic('light');
    try {
      if (navigator.storage && navigator.storage.persist) {
        const granted = await navigator.storage.persist();
        setStorageStatus(granted ? 'granted' : 'prompt');
      } else {
        setStorageStatus('granted');
      }
    } catch (err) {
      setStorageStatus('granted');
    }
  };

  const handleToggleDisplayOverApps = () => {
    triggerHaptic('medium');
    const newVal = !displayOverApps;
    setDisplayOverApps(newVal);
    localStorage.setItem('perm_display_over_apps', String(newVal));
  };

  const handleToggleBatteryOptimization = () => {
    triggerHaptic('medium');
    const newVal = !batteryOptIgnored;
    setBatteryOptIgnored(newVal);
    localStorage.setItem('perm_battery_opt_ignored', String(newVal));
  };

  const handleToggleAccessibility = () => {
    triggerHaptic('medium');
    const newVal = !accessibilityActive;
    setAccessibilityActive(newVal);
    localStorage.setItem('perm_accessibility_active', String(newVal));
  };

  const handleSaveKey = () => {
    triggerHaptic('light');
    if (onSaveApiKey) {
      onSaveApiKey(apiKeyInput.trim());
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleClearKey = () => {
    triggerHaptic('light');
    setApiKeyInput('');
    if (onSaveApiKey) {
      onSaveApiKey('');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80] pointer-events-auto"
          />

          {/* Glass Drawer Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-0 inset-x-0 z-[85] max-h-[85vh] bg-slate-950/90 border-t border-cyan-400/40 rounded-t-3xl backdrop-blur-2xl p-5 sm:p-6 overflow-y-auto pointer-events-auto shadow-[0_-10px_40px_rgba(6,182,212,0.3)] max-w-xl mx-auto"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20 mb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="text-cyan-400 animate-pulse" size={20} />
                <h2 className="text-lg font-bold font-mono tracking-widest text-cyan-100 uppercase">
                  {title || "SHREE MENU & SETTINGS"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-cyan-950/60 border border-cyan-400/30 flex items-center justify-center text-cyan-300 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* User Profile / Name Setting Card */}
            <div className="mb-3 bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-purple-400/40 rounded-2xl p-3 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">👤</span>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold font-mono tracking-wider text-purple-200 uppercase">
                      YOUR NAME (আপনার নাম)
                    </span>
                    <span className="text-[9px] text-purple-300/80 font-mono">
                      Shree will call you by this name
                    </span>
                  </div>
                </div>
                {isNameSaved && (
                  <span className="text-[9px] font-mono text-emerald-300 flex items-center gap-1">
                    <Check size={10} /> Saved!
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your name (e.g. Krish)"
                  className="flex-1 bg-slate-900/90 border border-purple-500/40 focus:border-purple-300 rounded-xl px-3 py-1.5 text-xs text-white placeholder-purple-300/40 focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (nameInput.trim() && onSaveUserName) {
                      onSaveUserName(nameInput.trim());
                      setIsNameSaved(true);
                      triggerHaptic('medium');
                      setTimeout(() => setIsNameSaved(false), 2000);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold flex items-center gap-1 transition-all"
                >
                  <Save size={12} /> Save
                </button>
              </div>
            </div>

            {/* Official Telegram Channel Banner Card */}
            <a
              href="https://t.me/xprojectsa"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => triggerHaptic('light')}
              className="mb-3 bg-gradient-to-r from-sky-950/80 via-blue-900/60 to-cyan-950/80 border border-sky-400/50 hover:border-sky-300 rounded-2xl p-3 flex items-center justify-between shadow-[0_0_20px_rgba(56,189,248,0.25)] transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-300 group-hover:scale-110 transition-transform">
                  <Send size={20} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold font-mono tracking-wider text-sky-200 uppercase">
                      JOIN TELEGRAM CHANNEL
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-sky-400/20 text-sky-300 text-[8px] font-mono font-bold border border-sky-400/40">
                      OFFICIAL
                    </span>
                  </div>
                  <span className="text-[9px] text-sky-300/80 font-mono">
                    অফিসিয়াল আপডেট, হেল্প ও নোটিফিকেশনের জন্য যোগ দিন
                  </span>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-sky-500/30 group-hover:bg-sky-500/50 text-sky-100 border border-sky-400/60 text-[10px] font-mono font-bold flex items-center gap-1 transition-all shrink-0">
                <span>JOIN</span>
                <ExternalLink size={12} />
              </div>
            </a>

            {/* Language Support Banner */}
            <div className="mb-3 bg-cyan-950/50 border border-cyan-400/30 rounded-2xl p-3 flex items-center justify-between shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🇮🇳</span>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold font-mono tracking-wider text-cyan-200 uppercase">
                    INDIAN BENGALI (বাংলা) & HINDI
                  </span>
                  <span className="text-[9px] text-cyan-400/80 font-mono">
                    West Bengal Bangla, Hinglish & English Voice Enabled
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-bold font-mono px-2 py-1 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-400/40">
                ACTIVE
              </span>
            </div>

            {/* Performance & Phone Heat Reduction Banner */}
            <div className="mb-5 bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 border border-emerald-400/40 rounded-2xl p-3 flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                  <BatteryCharging size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold font-mono tracking-wider text-emerald-200 uppercase">
                    SMOOTH PERFORMANCE & COOL PHONE MODE
                  </span>
                  <span className="text-[9px] text-emerald-300/80 font-mono">
                    ফোন গরম হওয়া ও ল্যাগ বন্ধ করার মোড (Lag & Heat Saver)
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  if (onTogglePerformanceMode) onTogglePerformanceMode();
                }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 ${
                  isPerformanceMode
                    ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-slate-900 text-slate-400 border border-slate-700'
                }`}
              >
                {isPerformanceMode ? (
                  <>
                    <CheckCircle2 size={12} /> ON (SMOOTH)
                  </>
                ) : (
                  'OFF'
                )}
              </button>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
              {/* Screen Share */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  triggerHaptic('light');
                  onToggleScreen();
                  onClose();
                }}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border text-center transition-all group ${
                  isScreenSharing
                    ? 'bg-cyan-500/25 border-cyan-300 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                    : 'bg-gradient-to-b from-cyan-900/30 to-blue-950/50 border-cyan-400/30 text-cyan-200'
                }`}
              >
                <div className="p-2 rounded-xl bg-cyan-400/10 text-cyan-300 group-hover:text-white group-hover:bg-cyan-400/20 transition-all">
                  <Monitor size={20} />
                </div>
                <span className="text-[9px] font-mono font-bold">
                  {isScreenSharing ? 'SCREEN ON' : 'SHARE SCREEN'}
                </span>
              </motion.button>

              {/* Play Ludo */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  triggerHaptic('light');
                  onStartGame();
                  onClose();
                }}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-gradient-to-b from-cyan-900/30 to-blue-950/50 border border-cyan-400/30 hover:border-cyan-300 text-center transition-all group"
              >
                <div className="p-2 rounded-xl bg-cyan-400/10 text-cyan-300 group-hover:text-white group-hover:bg-cyan-400/20 transition-all">
                  <Gamepad2 size={20} />
                </div>
                <span className="text-[9px] font-mono font-bold text-cyan-200">
                  PLAY LUDO
                </span>
              </motion.button>

              {/* Upload Image */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  triggerHaptic('light');
                  onUploadImage();
                  onClose();
                }}
                className="flex flex-col items-center gap-2 p-2.5 rounded-2xl bg-gradient-to-b from-cyan-900/30 to-blue-950/50 border border-cyan-400/30 hover:border-cyan-300 text-center transition-all group"
              >
                <div className="p-2 rounded-xl bg-cyan-400/10 text-cyan-300 group-hover:text-white group-hover:bg-cyan-400/20 transition-all">
                  <Upload size={20} />
                </div>
                <span className="text-[9px] font-mono font-bold text-cyan-200">
                  UPLOAD PIC
                </span>
              </motion.button>

              {/* Debug HUD Toggle */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  triggerHaptic('light');
                  onToggleDebug();
                }}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border text-center transition-all group ${
                  showDebug
                    ? 'bg-cyan-500/20 border-cyan-300 text-white'
                    : 'bg-gradient-to-b from-cyan-900/30 to-blue-950/50 border-cyan-400/30 text-cyan-200'
                }`}
              >
                <div className="p-2 rounded-xl bg-cyan-400/10 text-cyan-300 group-hover:text-white transition-all">
                  <Bug size={20} />
                </div>
                <span className="text-[9px] font-mono font-bold">
                  {showDebug ? 'DEBUG ON' : 'DEBUG HUD'}
                </span>
              </motion.button>
            </div>

            {/* Avatar Selector Gallery */}
            <div className="mb-6 bg-cyan-950/40 border border-cyan-400/40 rounded-2xl p-4 shadow-[0_0_15px_rgba(6,182,212,0.12)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-400/20 text-cyan-300">
                    <ImageIcon size={16} />
                  </div>
                  <h3 className="text-xs font-bold font-mono tracking-wider text-cyan-100 uppercase">
                    CHOOSE SHREE AVATAR IMAGE
                  </h3>
                </div>
                <span className="text-[9px] font-mono text-cyan-400/80 bg-cyan-900/40 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  {AVATAR_PRESETS.length} PRESETS
                </span>
              </div>

              <p className="text-[11px] text-cyan-300/80 mb-3 font-sans leading-relaxed">
                Select an avatar look or paste a custom image URL to instantly change Shree's appearance:
              </p>

              {/* Avatar Preset Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-5 gap-2 mb-3">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = currentVisual === preset.url;
                  return (
                    <button
                      key={preset.url}
                      onClick={() => {
                        triggerHaptic('medium');
                        if (onChangeAvatar) onChangeAvatar(preset.url);
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        isSelected
                          ? 'border-cyan-300 scale-105 shadow-[0_0_12px_rgba(34,211,238,0.7)]'
                          : 'border-cyan-500/30 hover:border-cyan-400/80 opacity-70 hover:opacity-100'
                      }`}
                      title={preset.name}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-cyan-500/30 flex items-center justify-center">
                          <Check size={14} className="text-white drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Image URL Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customAvatarUrlInput}
                  onChange={(e) => setCustomAvatarUrlInput(e.target.value)}
                  placeholder="Paste custom avatar image URL (https://...)"
                  className="flex-1 bg-slate-950/80 border border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-mono text-cyan-100 placeholder:text-cyan-500/50 focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={() => {
                    if (customAvatarUrlInput.trim() && onChangeAvatar) {
                      triggerHaptic('medium');
                      onChangeAvatar(customAvatarUrlInput.trim());
                      setCustomAvatarUrlInput('');
                    }
                  }}
                  disabled={!customAvatarUrlInput.trim()}
                  className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-mono text-xs font-bold disabled:opacity-40 hover:scale-105 active:scale-95 transition-all shrink-0"
                >
                  Apply URL
                </button>
              </div>
            </div>

            {/* Custom Gemini API Key Settings Section */}
            <div className="mb-6 bg-cyan-950/40 border border-cyan-400/40 rounded-2xl p-4 shadow-[0_0_15px_rgba(6,182,212,0.12)]">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-400/20 text-cyan-300">
                    <Key size={16} />
                  </div>
                  <h3 className="text-xs font-bold font-mono tracking-wider text-cyan-100 uppercase">
                    GEMINI API KEY SETTINGS
                  </h3>
                </div>
                {customApiKey ? (
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                    <Check size={10} /> CUSTOM KEY ACTIVE
                  </span>
                ) : (
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400/70 border border-cyan-400/30">
                    DEFAULT SYSTEM KEY
                  </span>
                )}
              </div>

              <p className="text-[11px] text-cyan-300/80 mb-3 font-sans leading-relaxed">
                Enter your custom Google Gemini API key below to power Shree voice-to-voice live sessions. Get a free key from{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-200 underline font-mono hover:text-white inline-flex items-center gap-0.5"
                >
                  aistudio.google.com <ExternalLink size={10} />
                </a>
              </p>

              <div className="space-y-2.5">
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIzaSy... (Enter your Gemini API key)"
                    className="w-full bg-slate-950/80 border border-cyan-500/30 rounded-xl px-3.5 py-2.5 pr-10 text-xs font-mono text-cyan-100 placeholder:text-cyan-500/50 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-cyan-400/70 hover:text-cyan-200 transition-colors"
                    title={showPassword ? 'Hide Key' : 'Show Key'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveKey}
                    className="flex-1 bg-gradient-to-r from-cyan-600/40 to-blue-600/50 hover:from-cyan-500/50 hover:to-blue-500/60 border border-cyan-400/60 text-cyan-100 px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                  >
                    <Save size={14} />
                    {isSaved ? 'SAVED SUCCESS!' : 'SAVE API KEY'}
                  </button>

                  {customApiKey && (
                    <button
                      onClick={handleClearKey}
                      className="bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      title="Clear Custom Key"
                    >
                      <Trash2 size={14} />
                      CLEAR
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* App Permissions & System Access Settings Section */}
            <div className="mb-6 bg-cyan-950/40 border border-cyan-400/40 rounded-2xl p-4 shadow-[0_0_15px_rgba(6,182,212,0.12)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-400/20 text-cyan-300">
                    <ShieldCheck size={16} />
                  </div>
                  <h3 className="text-xs font-bold font-mono tracking-wider text-cyan-100 uppercase">
                    APP PERMISSIONS & SYSTEM ACCESS
                  </h3>
                </div>
              </div>

              <p className="text-[11px] text-cyan-300/80 mb-3 font-sans leading-relaxed">
                Manage hardware permissions, background overlays, battery optimization, and accessibility settings for optimal Shree performance.
              </p>

              <div className="space-y-2.5">
                {/* 1. Microphone Permission */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-cyan-500/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-300">
                      <Mic size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-cyan-100">Microphone Access</div>
                      <div className="text-[10px] text-cyan-300/70">Voice chat & live audio streaming</div>
                    </div>
                  </div>
                  <button
                    onClick={handleRequestMic}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 ${
                      micStatus === 'granted'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                        : 'bg-cyan-500/20 hover:bg-cyan-400/30 text-cyan-200 border border-cyan-400/40 active:scale-95'
                    }`}
                  >
                    {micStatus === 'granted' ? (
                      <>
                        <CheckCircle2 size={12} /> GRANTED
                      </>
                    ) : (
                      'ALLOW MIC'
                    )}
                  </button>
                </div>

                {/* 2. Camera Permission */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-cyan-500/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-300">
                      <Camera size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-cyan-100">Camera Access</div>
                      <div className="text-[10px] text-cyan-300/70">Vision AI & camera snapshot features</div>
                    </div>
                  </div>
                  <button
                    onClick={handleRequestCamera}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 ${
                      cameraStatus === 'granted'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                        : 'bg-cyan-500/20 hover:bg-cyan-400/30 text-cyan-200 border border-cyan-400/40 active:scale-95'
                    }`}
                  >
                    {cameraStatus === 'granted' ? (
                      <>
                        <CheckCircle2 size={12} /> GRANTED
                      </>
                    ) : (
                      'ALLOW CAM'
                    )}
                  </button>
                </div>

                {/* 3. Storage Permission */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-cyan-500/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-300">
                      <HardDrive size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-cyan-100">Storage Access</div>
                      <div className="text-[10px] text-cyan-300/70">Save media, cache & persistent storage</div>
                    </div>
                  </div>
                  <button
                    onClick={handleRequestStorage}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 ${
                      storageStatus === 'granted'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                        : 'bg-cyan-500/20 hover:bg-cyan-400/30 text-cyan-200 border border-cyan-400/40 active:scale-95'
                    }`}
                  >
                    {storageStatus === 'granted' ? (
                      <>
                        <CheckCircle2 size={12} /> GRANTED
                      </>
                    ) : (
                      'ALLOW STORAGE'
                    )}
                  </button>
                </div>

                {/* 4. Display Over Other Apps */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-cyan-500/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-300">
                      <Layers size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-cyan-100">Display Over Other Apps</div>
                      <div className="text-[10px] text-cyan-300/70">Draw floating AI widget over Android apps</div>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleDisplayOverApps}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 ${
                      displayOverApps
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                        : 'bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-400/70 border border-cyan-500/30 active:scale-95'
                    }`}
                  >
                    {displayOverApps ? (
                      <>
                        <CheckCircle2 size={12} /> ENABLED
                      </>
                    ) : (
                      'DISABLED'
                    )}
                  </button>
                </div>

                {/* 5. Battery Optimization */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-cyan-500/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-300">
                      <BatteryCharging size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-cyan-100">Battery Optimization</div>
                      <div className="text-[10px] text-cyan-300/70">Prevent system killing background voice connection</div>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleBatteryOptimization}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 ${
                      batteryOptIgnored
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                        : 'bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-400/70 border border-cyan-500/30 active:scale-95'
                    }`}
                  >
                    {batteryOptIgnored ? (
                      <>
                        <CheckCircle2 size={12} /> UNRESTRICTED
                      </>
                    ) : (
                      'OPTIMIZED'
                    )}
                  </button>
                </div>

                {/* 6. Accessibility Permission */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-cyan-500/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-300">
                      <Sliders size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-cyan-100">Accessibility Service</div>
                      <div className="text-[10px] text-cyan-300/70">Screen reading & system voice controls</div>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleAccessibility}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 ${
                      accessibilityActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                        : 'bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-400/70 border border-cyan-500/30 active:scale-95'
                    }`}
                  >
                    {accessibilityActive ? (
                      <>
                        <CheckCircle2 size={12} /> ACTIVE
                      </>
                    ) : (
                      'INACTIVE'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Theme Selector Section */}
            {themes && onSelectTheme && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette size={16} className="text-cyan-400" />
                  <h3 className="text-xs font-bold font-mono tracking-wider text-cyan-200 uppercase">
                    COLOR THEMES
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(themes).map(([key, t]) => {
                    const isSelected = currentTheme === key;
                    return (
                      <button
                        key={key}
                        onClick={() => onSelectTheme(key)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-300 text-white shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                            : 'bg-cyan-950/30 border-cyan-500/20 text-cyan-200 hover:border-cyan-400/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/30"
                            style={{ backgroundColor: t.primary }}
                          />
                          <span className="text-xs font-mono font-medium">{t.name}</span>
                        </div>
                        {isSelected && <Check size={14} className="text-cyan-300" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* About Xpro Team Section */}
            <div className="mt-6 bg-gradient-to-b from-cyan-950/70 to-slate-950/90 border border-cyan-400/40 rounded-2xl p-4 shadow-[0_0_20px_rgba(6,182,212,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-2.5">
                <div className="p-1.5 rounded-lg bg-cyan-400/20 text-cyan-300">
                  <Info size={18} />
                </div>
                <h3 className="text-xs font-bold font-mono tracking-wider text-cyan-100 uppercase">
                  ABOUT XPRO TEAM
                </h3>
              </div>

              <p className="text-xs text-cyan-200/90 leading-relaxed font-sans mb-3.5">
                Shree is proudly created and maintained by <strong className="text-cyan-300 font-semibold">Xpro Team</strong>. We build ultra-realistic AI virtual companions, interactive tools, and innovative mobile applications.
              </p>

              {/* Telegram Channel Link */}
              <a
                href="https://t.me/xprojectsa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 p-3 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/40 hover:from-cyan-500/40 hover:to-blue-500/50 border border-cyan-400/50 text-cyan-100 transition-all duration-300 group shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_22px_rgba(6,182,212,0.4)] active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-300 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-colors">
                    <Send size={16} className="-translate-x-0.5 translate-y-0.5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold font-mono tracking-wide text-white">
                      Join Telegram Channel
                    </span>
                    <span className="text-[10px] text-cyan-300/80 font-mono">
                      https://t.me/xprojectsa
                    </span>
                  </div>
                </div>
                <ExternalLink size={16} className="text-cyan-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>

            {/* Developer Credit Footer */}
            <div className="mt-6 pt-4 border-t border-cyan-500/20 text-center flex flex-col items-center justify-center gap-1">
              <span className="text-[10px] font-mono tracking-widest text-cyan-300/80 uppercase font-semibold">
                DEVELOPED BY
              </span>
              <div className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.2)]">
                <span className="text-xs font-black font-sans tracking-wider text-cyan-100 uppercase">
                  Xpro Team
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
