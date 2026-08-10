import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, ArrowRight, User, Heart } from 'lucide-react';
import { triggerHaptic } from '../capacitor';

interface WelcomeModalProps {
  isOpen: boolean;
  initialName?: string;
  onSubmit: (name: string) => void;
}

export function WelcomeModal({ isOpen, initialName = '', onSubmit }: WelcomeModalProps) {
  const [name, setName] = useState(initialName || 'Krish');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    triggerHaptic('medium');
    onSubmit(name.trim());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 260 }}
            className="w-full max-w-md bg-gradient-to-b from-[#0a192f]/95 via-[#0d213a]/90 to-[#030d1a]/95 border border-cyan-400/50 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.35)] relative overflow-hidden"
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />

            {/* Top Badge */}
            <div className="flex items-center justify-center mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/40 text-cyan-200 text-xs font-mono font-bold uppercase tracking-widest shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                <Sparkles size={14} className="animate-pulse text-cyan-300" />
                VIRTUAL COMPANION SHREE
              </div>
            </div>

            {/* Shree Avatar Image Preview */}
            <div className="flex justify-center mb-4 relative">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-500 shadow-[0_0_25px_rgba(34,211,238,0.5)]">
                <img
                  src="/icon.svg"
                  alt="Shree AI Assistant Icon"
                  className="w-full h-full object-cover rounded-full border-2 border-slate-900"
                />
                <div className="absolute bottom-1 right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-slate-900 shadow-[0_0_8px_#10b981]" />
              </div>
            </div>

            {/* Title & Bengali Subtitle */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-black font-sans tracking-wide text-white drop-shadow-[0_0_12px_rgba(34,211,238,0.8)] mb-1">
                Welcome to SHREE ❤️
              </h1>
              <p className="text-xs sm:text-sm text-cyan-200/90 font-sans leading-relaxed">
                নমস্কার! শ্রী এর সাথে কথা বলার আগে আপনার সুন্দর নামটি লিখুন:
              </p>
              <p className="text-[11px] text-cyan-400/70 font-mono mt-0.5">
                (Enter your name so Shree can address you personally)
              </p>
            </div>

            {/* Name Form Input */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name (e.g. Krish)"
                  className="w-full bg-slate-900/90 border-2 border-cyan-500/40 focus:border-cyan-400 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium text-white placeholder-cyan-400/40 focus:outline-none shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] transition-all"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold font-sans text-sm tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] flex items-center justify-center gap-2 transition-all"
              >
                <span>Start Talking with Shree (কথা শুরু করুন)</span>
                <ArrowRight size={18} />
              </motion.button>
            </form>

            {/* Telegram Channel Option */}
            <div className="mt-5 pt-4 border-t border-cyan-500/20 text-center">
              <p className="text-[11px] font-mono text-cyan-300/80 mb-2">
                📢 Join Our Official Community Channel:
              </p>
              <a
                href="https://t.me/xprojectsa"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => triggerHaptic('light')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/50 text-sky-200 text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(56,189,248,0.2)]"
              >
                <Send size={14} className="text-sky-300" />
                <span>Join Official Telegram Channel</span>
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
