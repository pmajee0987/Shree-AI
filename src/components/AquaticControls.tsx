import React from 'react';

interface AquaticControlsProps {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  micLevel: number;
  outputLevel: number;
}

export function AquaticControls({
  isActive,
  isListening,
  isSpeaking,
  micLevel,
  outputLevel,
}: AquaticControlsProps) {
  return (
    <div className="fixed bottom-0 inset-x-0 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 bg-gradient-to-t from-[#010714] via-[#020b18]/90 to-transparent flex flex-col items-center justify-end z-40 pointer-events-none">
      
      {/* Waveform Visualization & Status Text */}
      <div className="flex flex-col items-center mb-2 pointer-events-none">
        {/* Animated Audio Waveform Bars */}
        <div className="flex items-center gap-1.5 h-8 mb-1.5">
          {isSpeaking ? (
            // Waveform reacting to AI Speaking
            Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`speaking-bar-${i}`}
                className="w-1 h-7 rounded-full bg-gradient-to-t from-cyan-500 to-cyan-200 transition-transform duration-150 origin-bottom gpu-layer"
                style={{
                  transform: `scaleY(${Math.max(0.15, Math.min(1, outputLevel * 2 + (i % 3 === 0 ? 0.3 : 0.1)))})`,
                  opacity: 0.8 + (i % 2) * 0.2,
                }}
              />
            ))
          ) : isListening ? (
            // Waveform reacting to user Microphone level
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`listening-bar-${i}`}
                className="w-1 h-7 rounded-full bg-gradient-to-t from-blue-600 to-cyan-300 transition-transform duration-100 origin-bottom gpu-layer"
                style={{
                  transform: `scaleY(${Math.max(0.15, Math.min(1, micLevel * 8 + (i % 2 === 0 ? 0.2 : 0.05)))})`,
                  opacity: 0.7,
                }}
              />
            ))
          ) : (
            // Ambient subtle waveform
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`idle-bar-${i}`}
                className="w-1 h-7 rounded-full bg-cyan-400/30 origin-bottom gpu-layer"
                style={{
                  transform: `scaleY(${[0.3, 0.5, 0.7, 0.4, 0.6, 0.3][i]})`,
                }}
              />
            ))
          )}
        </div>

        {/* Listening / Status Label */}
        <span className="text-[11px] sm:text-xs font-medium tracking-widest text-cyan-200/90 uppercase font-sans drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
          {isActive
            ? isSpeaking
              ? "SHREE is speaking..."
              : isListening
              ? "I'm listening..."
              : "Processing..."
            : "Tap avatar to speak"}
        </span>
      </div>
    </div>
  );
}
