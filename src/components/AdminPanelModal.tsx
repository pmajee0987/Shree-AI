import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Key, Terminal, Cpu, Lock, Unlock, RefreshCw, Check, X, Sparkles, Send, Sliders, Database, UserCheck, Wrench, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { triggerHaptic } from '../capacitor';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onSaveUserName: (name: string) => void;
  customApiKey: string;
  onSaveApiKey: (key: string) => void;
  isPerformanceMode: boolean;
  onTogglePerformanceMode: () => void;
  onResetDefaults?: () => void;
  currentVisual?: string;
  onChangeAvatar?: (url: string) => void;
}

export function AdminPanelModal({
  isOpen,
  onClose,
  userName,
  onSaveUserName,
  customApiKey,
  onSaveApiKey,
  isPerformanceMode,
  onTogglePerformanceMode,
  onResetDefaults,
  currentVisual,
  onChangeAvatar,
}: AdminPanelModalProps) {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passError, setPassError] = useState(false);

  // Admin Config States
  const [adminName, setAdminName] = useState(userName);
  const [adminKey, setAdminKey] = useState(customApiKey);
  const [adminAvatarUrl, setAdminAvatarUrl] = useState(currentVisual || '');
  const [selectedModel, setSelectedModel] = useState('gemini-3.1-flash-live-preview');
  const [voicePersonality, setVoicePersonality] = useState('Sweet & Sassy (Tsundere)');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passcode.trim();
    if (cleanPass === 'rana@2999' || cleanPass === '1234' || cleanPass.toLowerCase() === 'xpro' || cleanPass === '786') {
      triggerHaptic('medium');
      setIsAuthenticated(true);
      setPassError(false);
    } else {
      triggerHaptic('heavy');
      setPassError(true);
      setPasscode('');
    }
  };

  const handleSaveAdminConfig = () => {
    triggerHaptic('medium');
    if (adminName.trim()) {
      onSaveUserName(adminName.trim());
    }
    if (adminAvatarUrl.trim() && onChangeAvatar) {
      onChangeAvatar(adminAvatarUrl.trim());
    }
    onSaveApiKey(adminKey.trim());
    localStorage.setItem('shree_admin_model', selectedModel);
    localStorage.setItem('shree_admin_personality', voicePersonality);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all app settings to defaults?')) {
      triggerHaptic('heavy');
      localStorage.clear();
      if (onResetDefaults) onResetDefaults();
      window.location.reload();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="w-full max-w-lg bg-gradient-to-b from-slate-950 via-[#0a1122] to-slate-950 border-2 border-cyan-500/50 rounded-3xl p-5 sm:p-6 shadow-[0_0_60px_rgba(6,182,212,0.4)] relative overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Top Accent Glow */}
            <div className="absolute -top-12 inset-x-0 h-24 bg-cyan-500/20 blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-cyan-500/30 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  <ShieldAlert size={20} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold font-mono tracking-wider text-cyan-100 uppercase">
                      SHREE ADMIN CONTROL PANEL
                    </h2>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 text-[8px] font-mono font-bold border border-cyan-400/40">
                      XPRO DEV
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-cyan-400/70">
                    Developer Diagnostics & AI Model Overrides
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="p-1.5 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Area */}
            {!isAuthenticated ? (
              /* Passcode Screen */
              <div className="py-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-300 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  <Lock size={30} />
                </div>
                <h3 className="text-lg font-bold font-mono text-white mb-1">
                  ADMIN PASSCODE REQUIRED
                </h3>
                <p className="text-xs text-cyan-300/80 font-mono mb-5 max-w-xs leading-relaxed">
                  Enter developer security code to unlock system controls.
                </p>

                <form onSubmit={handleUnlock} className="w-full max-w-xs space-y-3">
                  <input
                    type="password"
                    autoFocus
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      if (passError) setPassError(false);
                    }}
                    placeholder="Enter Secret Passcode"
                    className={`w-full bg-slate-900/90 border-2 ${
                      passError ? 'border-red-500' : 'border-cyan-500/40 focus:border-cyan-400'
                    } rounded-2xl px-4 py-3 text-center text-base font-mono font-bold tracking-widest text-cyan-100 placeholder:text-cyan-600/60 focus:outline-none transition-all shadow-inner`}
                  />

                  {passError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-mono text-red-400 flex items-center justify-center gap-1"
                    >
                      <AlertTriangle size={12} /> Invalid Admin Passcode!
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Unlock size={16} />
                    <span>UNLOCK ADMIN PANEL</span>
                  </button>
                </form>
              </div>
            ) : (
              /* Authenticated Admin Dashboard */
              <div className="overflow-y-auto space-y-4 pr-1 text-xs">
                {/* 1. Developer Credits Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-blue-950/60 to-purple-950/80 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <div className="text-xs font-bold font-mono text-cyan-100">XPRO OFFICIAL ADMIN MODE</div>
                      <div className="text-[10px] text-cyan-300/80 font-mono">System Core: Full Access Granted</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-mono font-bold">
                    UNLOCKED
                  </span>
                </div>

                {/* 2. AI Model Selection */}
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-200 font-mono font-bold text-xs uppercase">
                    <Cpu size={15} className="text-cyan-400" />
                    <span>Gemini AI Engine Override</span>
                  </div>
                  <p className="text-[10px] text-cyan-300/70">
                    Select active model pipeline for voice and text generation:
                  </p>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl px-3 py-2 font-mono text-xs text-cyan-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="gemini-3.1-flash-live-preview">Gemini 3.1 Flash Live Preview (Recommended for Voice)</option>
                    <option value="gemini-3.6-flash">Gemini 3.6 Flash (Ultra Light Response)</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  </select>
                </div>

                {/* 3. User Identity Override */}
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-200 font-mono font-bold text-xs uppercase">
                    <UserCheck size={15} className="text-purple-400" />
                    <span>User Profile Override</span>
                  </div>
                  <p className="text-[10px] text-cyan-300/70">
                    Configure current user name Shree uses during voice chat:
                  </p>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="User Name (e.g. Krish)"
                    className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl px-3 py-2 font-mono text-xs text-cyan-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* 3B. Avatar Image Override */}
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-200 font-mono font-bold text-xs uppercase">
                    <ImageIcon size={15} className="text-cyan-400" />
                    <span>Avatar Image URL Override</span>
                  </div>
                  <p className="text-[10px] text-cyan-300/70">
                    Set a custom image link or web photo as default Shree avatar:
                  </p>
                  <input
                    type="text"
                    value={adminAvatarUrl}
                    onChange={(e) => setAdminAvatarUrl(e.target.value)}
                    placeholder="https://... (Avatar Image Direct Link)"
                    className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl px-3 py-2 font-mono text-xs text-cyan-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* 4. API Key Override */}
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-cyan-200 font-mono font-bold text-xs uppercase">
                      <Key size={15} className="text-amber-400" />
                      <span>Custom API Key Override</span>
                    </div>
                  </div>
                  <input
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="Enter Custom Gemini API Key"
                    className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl px-3 py-2 font-mono text-xs text-cyan-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* 5. Performance & Cool Mode Toggle */}
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-cyan-200 font-mono font-bold text-xs uppercase">
                      <Sliders size={15} className="text-emerald-400" />
                      <span>Performance Mode (Lag & Heat Saver)</span>
                    </div>
                    <p className="text-[10px] text-cyan-300/70">Limits high-frequency visual renders on low-end phones</p>
                  </div>
                  <button
                    onClick={onTogglePerformanceMode}
                    className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold border ${
                      isPerformanceMode
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                        : 'bg-slate-950 text-slate-400 border-slate-700'
                    }`}
                  >
                    {isPerformanceMode ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                {/* 6. Save Button */}
                <button
                  onClick={handleSaveAdminConfig}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 text-white font-mono font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Check size={16} />
                  <span>{savedSuccess ? 'ADMIN CONFIG SAVED!' : 'APPLY ADMIN CHANGES'}</span>
                </button>

                {/* 7. Telegram & Reset Options */}
                <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between gap-2">
                  <a
                    href="https://t.me/xprojectsa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-sky-950/60 border border-sky-400/40 text-sky-300 hover:text-white font-mono text-[10px] font-bold flex items-center justify-center gap-1.5"
                  >
                    <Send size={12} />
                    <span>Telegram Admin Channel</span>
                  </a>

                  <button
                    onClick={handleReset}
                    className="py-2 px-3 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 font-mono text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <RefreshCw size={12} />
                    <span>Reset Defaults</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
