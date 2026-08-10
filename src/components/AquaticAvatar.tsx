import React, { Fragment } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AquaticAvatarProps {
  currentVisual: string;
  defaultVisual: string;
  getDirectImageUrl: (url: string) => string;
  expression: string;
  isSpeaking: boolean;
  isListening: boolean;
  isActive?: boolean;
  isLipSyncEnabled: boolean;
  isBlinking: boolean;
  outputLevel: number;
  mouthOpenImg: string;
  eyesClosedImg: string;
  onVisualError: () => void;
  onToggleMic?: () => void;
}

export function AquaticAvatar({
  currentVisual,
  defaultVisual,
  getDirectImageUrl,
  expression,
  isSpeaking,
  isListening,
  isActive,
  isLipSyncEnabled,
  isBlinking,
  outputLevel,
  mouthOpenImg,
  eyesClosedImg,
  onVisualError,
  onToggleMic,
}: AquaticAvatarProps) {
  return (
    <div className="relative flex items-center justify-center w-full max-w-sm sm:max-w-md aspect-square max-h-[50vh] sm:max-h-[55vh]">
      
      {/* Radial Underwater Glow behind Avatar Frame */}
      <div className="absolute inset-0 rounded-full bg-cyan-500/15 blur-[60px] pointer-events-none" />

      {/* Outer Ring 1 - Slowly rotating cyan ring */}
      <div className="absolute -inset-3 sm:-inset-5 border border-dashed border-cyan-400/30 rounded-full pointer-events-none animate-spin-slow" />

      {/* Outer Ring 2 - Reverse rotating electric blue ring */}
      <div className="absolute -inset-6 sm:-inset-8 border border-blue-400/20 rounded-full pointer-events-none animate-spin-reverse-slow" />

      {/* Main Glass Avatar Circular Frame - CLICKABLE TO TOGGLE MIC */}
      <motion.button
        type="button"
        onClick={onToggleMic}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        animate={{
          scale: isSpeaking ? [1, 1.02, 1] : [1, 1.01, 1],
          boxShadow: isSpeaking
            ? [
                '0 0 30px rgba(6,182,212,0.4)',
                `0 0 ${40 + outputLevel * 60}px rgba(34,211,238,0.7)`,
                '0 0 30px rgba(6,182,212,0.4)',
              ]
            : isActive || isListening
            ? ['0 0 30px rgba(34,211,238,0.5)', '0 0 50px rgba(34,211,238,0.8)', '0 0 30px rgba(34,211,238,0.5)']
            : '0 0 25px rgba(6,182,212,0.3)',
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className={`relative w-full h-full rounded-full border-2 transition-colors cursor-pointer pointer-events-auto bg-cyan-950/20 backdrop-blur-md overflow-hidden flex items-center justify-center p-2 sm:p-3 group ${
          isActive
            ? 'border-cyan-300 shadow-[0_0_40px_rgba(34,211,238,0.6)]'
            : 'border-cyan-400/50 hover:border-cyan-300 shadow-[0_0_35px_rgba(6,182,212,0.3)]'
        }`}
        title={isActive ? "Tap to turn off mic" : "Tap to turn on mic"}
      >
        {/* Inner Glass Highlights */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 via-transparent to-black/40 pointer-events-none z-30" />
        <div className="absolute top-2 inset-x-8 h-8 bg-white/20 rounded-full blur-[2px] pointer-events-none z-30 opacity-70" />

        {/* Character Image Container */}
        <motion.div
          className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center"
          animate={{
            opacity: expression === 'heartbroken' ? 0.85 : 1,
            x: expression === 'heartbroken' ? [0, -3, 3, -3, 3, 0] : 0,
            y: expression === 'heartbroken' ? [0, 2, 0, 2, 0] : 0,
            filter:
              expression === 'heartbroken'
                ? 'brightness(0.7) contrast(1.15)'
                : 'brightness(1) contrast(1)',
          }}
          transition={{
            x: { duration: 0.3, repeat: expression === 'heartbroken' ? Infinity : 0 },
            y: { duration: 0.2, repeat: expression === 'heartbroken' ? Infinity : 0 },
            opacity: { duration: 0.5 },
          }}
        >
          {/* Base Avatar Image with Lifelike Motion (Speaking, Expressions, Blinking) */}
          <motion.img
            key={currentVisual}
            src={getDirectImageUrl(currentVisual) || defaultVisual}
            onError={onVisualError}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{
              opacity: 1,
              scale: isSpeaking
                ? [1, 1.025, 0.99, 1.03, 1]
                : expression === 'surprised'
                ? 1.04
                : expression === 'excited'
                ? [1, 1.03, 1]
                : 1,
              scaleY: isBlinking ? 0.96 : 1,
              y: isSpeaking
                ? [0, -2, 1, -1, 0]
                : expression === 'excited'
                ? [0, -5, 0]
                : expression === 'thinking'
                ? [0, -3, 0]
                : 0,
              rotate: expression === 'sassy' ? -2 : expression === 'embarrassed' ? 2 : 0,
            }}
            transition={{
              duration: isSpeaking ? 0.35 : isBlinking ? 0.08 : 0.6,
              repeat: isSpeaking || expression === 'excited' || expression === 'thinking' ? Infinity : 0,
              ease: 'easeInOut',
            }}
            alt="Shree Visual"
            className="w-full h-full object-cover relative z-10"
            referrerPolicy="no-referrer"
          />

          {/* Mouth Open Overlay (Lip Sync) */}
          <motion.img
            src={mouthOpenImg}
            alt="Shree Talking"
            animate={{
              opacity: isSpeaking && isLipSyncEnabled ? Math.min(1, outputLevel * 8) : 0,
            }}
            className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none"
            referrerPolicy="no-referrer"
          />

          {/* Eyes Closed Overlay (Blinking & Crying) */}
          <motion.img
            src={eyesClosedImg}
            alt="Shree Blink"
            animate={{
              opacity:
                isBlinking || expression === 'sad' || expression === 'heartbroken' ? 1 : 0,
            }}
            transition={{
              duration: expression === 'sad' || expression === 'heartbroken' ? 0.4 : 0.05,
            }}
            className="absolute inset-0 w-full h-full object-cover z-30 pointer-events-none"
            referrerPolicy="no-referrer"
          />

          {/* Emotional Auras & Overlays */}
          <AnimatePresence>
            {expression === 'thinking' && (
              <Fragment key="exp-thinking">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.35 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-blue-500/20 blur-[40px] z-25"
                />
              </Fragment>
            )}
            {expression === 'happy' && (
              <Fragment key="exp-happy">
                <motion.div
                  key="happy-blush-l"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.25 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-[50%] left-[28%] w-[14%] h-[7%] bg-cyan-400/30 blur-[12px] rounded-full z-40"
                />
                <motion.div
                  key="happy-blush-r"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.25 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-[50%] left-[58%] w-[14%] h-[7%] bg-cyan-400/30 blur-[12px] rounded-full z-40"
                />
              </Fragment>
            )}
            {(expression === 'sad' || expression === 'heartbroken') && (
              <Fragment key="exp-sad-hb">
                <motion.div
                  key="sad-bg"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0.2, expression === 'heartbroken' ? 0.7 : 0.4, 0.2],
                  }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="absolute inset-0 bg-blue-950/70 blur-[40px] z-25"
                />
              </Fragment>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.button>
    </div>
  );
}
