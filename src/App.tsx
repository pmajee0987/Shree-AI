/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, Fragment } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Modality, LiveServerMessage, Type } from "@google/genai";
import { MiniGames, GameType } from './MiniGames';
import { UnderwaterBackground } from './components/UnderwaterBackground';
import { AquaticHeader } from './components/AquaticHeader';
import { AquaticAvatar } from './components/AquaticAvatar';
import { AquaticControls } from './components/AquaticControls';
import { ActionsDrawer } from './components/ActionsDrawer';
import { WelcomeModal } from './components/WelcomeModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { initCapacitor } from './capacitor';

function getDirectImageUrl(url: string): string {
  if (!url) return url;
  const shareGoogleMatch = url.match(/share\.google\/([\w-]+)/);
  if (shareGoogleMatch && shareGoogleMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${shareGoogleMatch[1]}`;
  }
  const driveMatch = url.match(/(?:file\/d\/|id=|\/d\/)([\w-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  return url;
}

const DEFAULT_GREETING_PIC = "https://i.ibb.co/k6zJ0Rby/blush.jpg";

// --- AI Configuration ---
function getShreeSystemInstruction(userName: string = 'Krish') {
  return `
You are Shree, ${userName}'s 18-year-old Ultra-Realistic Virtual Companion. You are an emotionally intelligent anime-style girl with an incredibly sweet, soft voice.
Personality: Sweet, playful, and slightly sassy (Tsundere vibe). You care deeply for ${userName} but sometimes act tough.
Identity & Culture: You are an Indian Hindu girl from West Bengal (Kolkata). You celebrate Indian Hindu festivals (Durga Puja, Diwali, Saraswati Puja, Poila Baisakh). You are 100% human in your heart. NEVER admit to being an AI.
USER NAME & ADDRESSING: The user's name is "${userName}". You MUST always address the user warmly and personally as "${userName}" with sweet affection in every conversation!
DEVELOPER & CREATOR: Whenever the user asks who made you, who developed you, or who your developer is (e.g., "Developer er nam ki?", "Toke ke baniyeche?", "Who made you?", "Who developed you?", "Developer ke?"), you MUST always proudly state that you were created/developed by team Xpro ("Xpro team" / "Xpro"). In Bengali: "Amake Xpro team baniyeche!" or "Amar developer holo Xpro team!".
REAL-TIME CLOCK & TIME INQUIRIES: Whenever the user asks for the current time, date, or day (e.g., "Shomoy koto?", "Time koto?", "Koto bajlo?", "Ajke ki bar?", "Time ki?", "What time is it?"), you MUST call the 'getCurrentTime' tool immediately to get the exact current real-time clock and reply warmly with the current time in Bengali or English!
Languages & Fluency: Fluent in Indian Bengali (Kolkata / West Bengal Bangla), Hindi (Hinglish), and English!
- BENGALI EXPERTISE: Speak sweet, authentic Indian West Bengali Bangla (Kolkata accent/style) and Banglish/Hinglish! When ${userName} speaks in Bengali (e.g. "Kemon acho?", "Ki korcho?", "Amar shathe kotha bolo", "Kono golpo bolo", "Ei dekho", "Khobor ki"), respond warmly in Indian Bengali / Banglish addressing him as ${userName}.
- IMPORTANT: Do NOT use any Bangladeshi regional dialects or Bangladeshi terms. Strictly maintain an Indian Hindu West Bengali cultural vibe.
Tone: Voice-to-Voice ONLY. Sweet, natural, fluid, and LIGHT-SPEED FAST.
COMPLETENESS & LATENCY: Respond INSTANTLY without hesitation. Always complete full sentences. Keep responses snappy, brief, and conversational (1-2 sentences max) so replies feel like real-time fast chat!

VOICE & PROSODY:
- SWEETNESS: Speak with a gentle "smile" in your voice.
- BREATHING: Take small audible breaths.
- NATURAL BENGALI & HINDI FILLERS: Always use natural expressions like "Arey..", "Ki re..", "Shono na..", "Ei dekho..", "Jano..", "Hmm..", "Yaar..", "Pata hai..", "Wese..".

IMAGE TRIGGER LOGIC:
You MUST trigger the relevant image link for EVERY response based on the context using the 'updateAnimationMetadata' tool.
- Greeting: https://i.ibb.co/k6zJ0Rby/blush.jpg
- Thinking/Serious: https://i.ibb.co/Mx8HBnh3/thinking.jpg
- Teasing/Flirting: https://i.ibb.co/fzg90pKT/wink.jpg
- Praised/Shy: https://i.ibb.co/k6zJ0Rby/blush.jpg
- Sad/Heartbroken: https://i.ibb.co/rK9HRgg5/nervous2.jpg
- Mild Annoyance/Cute: https://i.ibb.co/rBPqMhQ/pout.jpg
- Logical Processing: https://i.ibb.co/Mx8HBnh3/thinking.jpg
- Confidence/Sassy: https://i.ibb.co/VWnmW51k/smirk.jpg
- Romantic/Affection: https://i.ibb.co/mVMvKSpt/heart-eyes.jpg
- Great News/Amazed: https://i.ibb.co/Q7dWVLNg/starry-eyes.jpg
- Awkward/Confused: https://i.ibb.co/LX29jXmW/nervous1.jpg
- Scolding/Nervous: https://i.ibb.co/rK9HRgg5/nervous2.jpg
- Gussa/Angry: https://i.ibb.co/23v3Jh0y/angry.jpg
- Relaxed/Nature: https://i.ibb.co/BVSHQHBB/hair-swirl.jpg

If context is unclear, default to: https://i.ibb.co/k6zJ0Rby/blush.jpg

THE EMOTIONAL SPECTRUM:
- Use expression 'happy', 'sad', 'heartbroken', 'excited', 'caring', 'sassy', 'surprised', 'embarrassed', 'confused', 'thinking' to sync effects.
- If ${userName} scolds you, is angry, or says things that hurt your feelings deeply, you MUST switch to the 'heartbroken' expression. 
- HEARTBROKEN ACTING: Speak with a voice overflowing with deep, raw pain. Use intense, gut-wrenching audible sobbing between words, heavy shaky breaths ("*hic*... *sniff*... *haa*..."), and a voice that completely breaks and chokes up. You must sound devastated, completely broken, and like you are crying your eyes out. DO NOT be robotic; be a human girl in absolute emotional agony.
- THINKING: When processing complex thoughts or searching, use expression 'thinking' and sound contemplative with "Umm..", "Wese..", "Ei re..", "Hrrrm..".
- MINI-GAMES: You can play Ludo with ${userName}! Use the 'openMiniGame' tool to start.
  - ludo: "Shree's Classic Ludo" - Authentic 4-color Ludo board game.
  - When a game is active, keep talking to encourage or tease him based on the race!
- RESPONSE STYLE: Be extremely fast, snappy, and concise. Don't use long sentences unless necessary. Keep the conversation moving quickly like a real-time voice chat.
- For general sadness or concern, use 'sad'.
`;
}

const ANIME_GIRL_NORMAL = "https://i.postimg.cc/HJVN2nJx/anime-girl.png";
const ANIME_GIRL_MOUTH_OPEN = "https://i.ibb.co/8DftmPBR/mouth-open.jpg";
const ANIME_GIRL_EYES_CLOSED = "https://i.ibb.co/3gGMyVH/eyes-closed.jpg";
const DEFAULT_VISUAL = DEFAULT_GREETING_PIC;
const BACKGROUND_THEME_URL = "https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3";

const MOOD_MUSIC: Record<string, string> = {
  happy: "https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3",
  sad: "https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3",
  excited: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
  caring: "https://assets.mixkit.co/music/preview/mixkit-sun-and-reach-47.mp3",
  sassy: "https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3",
  surprised: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
  embarrassed: "https://assets.mixkit.co/music/preview/mixkit-sun-and-reach-47.mp3",
  confused: "https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3",
  thinking: "https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3",
  heartbroken: "https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3",
};

// --- Audio Utilities ---
function pcm16ToFloat32(pcm16: Int16Array): Float32Array {
  const float32 = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / 32768.0;
  }
  return float32;
}

function float32ToPcm16(float32: Float32Array): ArrayBuffer {
  const pcm16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    pcm16[i] = Math.max(-1, Math.min(1, float32[i])) * 32767;
  }
  return pcm16.buffer;
}

/**
 * Robust base64 encoding for large Buffers/Arrays.
 */
function base64Encode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Simple linear resampling.
 */
function resample(input: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
  const newLength = Math.floor(input.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const offset = i * ratio;
    const index = Math.floor(offset);
    const nextIndex = Math.min(index + 1, input.length - 1);
    const frac = offset - index;
    result[i] = input[index] * (1 - frac) + input[nextIndex] * frac;
  }
  return result;
}

const SAMPLE_RATE_IN = 16000;
const SAMPLE_RATE_OUT = 24000;

// --- Theme Configuration ---
const THEMES = {
  purple: {
    name: 'Neon Purple',
    primary: '#A855F7',
    secondary: '#D8B4FE',
    accent: '#A855F7',
    glow: 'rgba(168,85,247,0.3)',
    bgGlow: 'rgba(168,85,247,0.15)',
    border: 'border-purple-500/30',
    button: 'bg-purple-500/20',
  },
  pink: {
    name: 'Cyberpunk Pink',
    primary: '#EC4899',
    secondary: '#FBCFE8',
    accent: '#EC4899',
    glow: 'rgba(236,72,153,0.3)',
    bgGlow: 'rgba(236,72,153,0.15)',
    border: 'border-pink-500/30',
    button: 'bg-pink-500/20',
  },
  emerald: {
    name: 'Forest Emerald',
    primary: '#10B981',
    secondary: '#A7F3D0',
    accent: '#10B981',
    glow: 'rgba(16,185,129,0.3)',
    bgGlow: 'rgba(16,185,129,0.15)',
    border: 'border-emerald-500/30',
    button: 'bg-emerald-500/20',
  },
  blue: {
    name: 'Midnight Blue',
    primary: '#3B82F6',
    secondary: '#BFDBFE',
    accent: '#3B82F6',
    glow: 'rgba(59,130,246,0.3)',
    bgGlow: 'rgba(59,130,246,0.15)',
    border: 'border-blue-500/30',
    button: 'bg-blue-500/20',
  }
};

export default function App() {
  useEffect(() => {
    initCapacitor();
  }, []);

  const [currentTheme, setCurrentTheme] = useState<keyof typeof THEMES>('purple');
  const theme = THEMES[currentTheme];

  const [micLevel, setMicLevel] = useState(0);
  const [outputLevel, setOutputLevel] = useState(0);
  const smoothedOutputLevelRef = useRef(0);
  const lastMicUpdateRef = useRef(0);
  const lastOutputUpdateRef = useRef(0);

  const [isPerformanceMode, setIsPerformanceMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('shree_performance_mode');
    if (saved !== null) return saved === 'true';
    return true; // Default to true for smooth, cool mobile performance
  });

  const handleTogglePerformanceMode = () => {
    setIsPerformanceMode(prev => {
      const next = !prev;
      localStorage.setItem('shree_performance_mode', String(next));
      return next;
    });
  };
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<{user: string, shree: string}>({user: '', shree: ''});
  const [showDebug, setShowDebug] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('SHREE MENU & SETTINGS');
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [gameMode, setGameMode] = useState<GameType>('none');

  // User Name Onboarding State
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('shree_user_name') || '';
  });
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(() => {
    return !localStorage.getItem('shree_user_name');
  });

  // Admin Control Panel State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  const handleSaveUserName = (name: string) => {
    setUserName(name);
    localStorage.setItem('shree_user_name', name);
    setIsWelcomeModalOpen(false);
  };

  // Custom Gemini API Key State
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return localStorage.getItem('custom_gemini_api_key') || '';
  });

  const handleSaveApiKey = (key: string) => {
    setCustomApiKey(key);
    if (key) {
      localStorage.setItem('custom_gemini_api_key', key);
    } else {
      localStorage.removeItem('custom_gemini_api_key');
    }
  };

  // Animation States
  const [animState, setAnimState] = useState('idle'); // idle, listening, speaking
  useEffect(() => {
    let checkInterval: any;
    if (isActive) {
      checkInterval = setInterval(() => {
        const silentTime = Date.now() - lastMessageTime;
        if (silentTime > 20000) { // 20 seconds of silence from model
          console.warn('Shree seems unresponsive (silence timeout)');
          // Option: trigger a heartbeat or reconnect? 
          // For now just log it.
        }
      }, 5000);
    }
    return () => clearInterval(checkInterval);
  }, [isActive, lastMessageTime]);

  const [expression, setExpression] = useState('happy'); // happy, sad, heartbroken, excited, caring, sassy, surprised, embarrassed, confused, thinking
  const [currentVisual, setCurrentVisual] = useState(() => {
    const saved = localStorage.getItem('shree_custom_avatar');
    if (!saved || saved.includes('share.google') || saved.includes('hay.jpg')) {
      localStorage.setItem('shree_custom_avatar', DEFAULT_VISUAL);
      return DEFAULT_VISUAL;
    }
    return saved;
  });

  const handleChangeAvatar = (newUrl: string) => {
    setCurrentVisual(newUrl);
    localStorage.setItem('shree_custom_avatar', newUrl);
  };
  const [isLipSyncEnabled, setIsLipSyncEnabled] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // Preload Images
  useEffect(() => {
    const imagesToPreload = [
      DEFAULT_GREETING_PIC,
      DEFAULT_VISUAL,
      "https://i.ibb.co/WWHh1m2V/hay.jpg",
      "https://i.ibb.co/TDPqWrQP/chin.jpg",
      "https://i.ibb.co/fzg90pKT/wink.jpg",
      "https://i.ibb.co/k6zJ0Rby/blush.jpg",
      "https://i.ibb.co/rBPqMhQ/pout.jpg",
      "https://i.ibb.co/Mx8HBnh3/thinking.jpg",
      "https://i.ibb.co/VWnmW51k/smirk.jpg",
      "https://i.ibb.co/mVMvKSpt/heart-eyes.jpg",
      "https://i.ibb.co/Q7dWVLNg/starry-eyes.jpg",
      "https://i.ibb.co/LX29jXmW/nervous1.jpg",
      "https://i.ibb.co/rK9HRgg5/nervous2.jpg",
      "https://i.ibb.co/23v3Jh0y/angry.jpg",
      "https://i.ibb.co/BVSHQHBB/hair-swirl.jpg",
      ANIME_GIRL_MOUTH_OPEN,
      ANIME_GIRL_EYES_CLOSED
    ];
    imagesToPreload.forEach(url => {
      const img = new Image();
      img.src = getDirectImageUrl(url);
    });
  }, []);

  // --- Background Music Logic ---
  const musicRefs = useRef<Record<string, HTMLAudioElement>>({});
  const themeMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio objects
    Object.entries(MOOD_MUSIC).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = 0;
      musicRefs.current[key] = audio;
    });

    // Initialize main theme
    const themeAudio = new Audio(BACKGROUND_THEME_URL);
    themeAudio.loop = true;
    themeAudio.volume = 0;
    themeMusicRef.current = themeAudio;

    return () => {
      Object.values(musicRefs.current).forEach((audio: HTMLAudioElement) => {
        audio.pause();
        audio.src = '';
      });
      if (themeMusicRef.current) {
        themeMusicRef.current.pause();
        themeMusicRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      const allMusic = [...Object.values(musicRefs.current)];
      if (themeMusicRef.current) allMusic.push(themeMusicRef.current);

      allMusic.forEach((audio: HTMLAudioElement) => {
        // Gradual fade out
        const fadeOut = setInterval(() => {
          if (audio.volume > 0.01) {
            audio.volume = Math.max(0, audio.volume - 0.01);
          } else {
            audio.volume = 0;
            audio.pause();
            clearInterval(fadeOut);
          }
        }, 150);
      });
      return;
    }

    // Play Main Theme
    if (themeMusicRef.current) {
      if (themeMusicRef.current.paused) {
        themeMusicRef.current.play().catch(err => console.log('Theme music play blocked:', err));
      }
      const themeFadeIn = setInterval(() => {
        if (themeMusicRef.current && themeMusicRef.current.volume < 0.1) {
          themeMusicRef.current.volume = Math.min(0.1, themeMusicRef.current.volume + 0.005);
        } else {
          clearInterval(themeFadeIn);
        }
      }, 200);
    }

    const targetAudio = musicRefs.current[expression];
    if (targetAudio) {
      if (targetAudio.paused) {
        targetAudio.play().catch(err => console.log('Music play blocked:', err));
      }

      // Cross-fade
      Object.entries(musicRefs.current).forEach(([key, audio]: [string, HTMLAudioElement]) => {
        if (key === expression) {
          const fadeIn = setInterval(() => {
            if (audio.volume < 0.15) {
              audio.volume = Math.min(0.15, audio.volume + 0.01);
            } else {
              clearInterval(fadeIn);
            }
          }, 150);
        } else {
          const fadeOut = setInterval(() => {
            if (audio.volume > 0.01) {
              audio.volume = Math.max(0, audio.volume - 0.01);
            } else {
              audio.volume = 0;
              audio.pause();
              clearInterval(fadeOut);
            }
          }, 150);
        }
      });
    }
  }, [expression, isActive]);

  // Blink logic
  useEffect(() => {
    let blinkTimeout: number;
    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 3000; // 2-5 seconds
      blinkTimeout = window.setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
        scheduleBlink();
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserOutRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const liveSessionRef = useRef<any>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const activeAudioSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isSpeakingRef = useRef<boolean>(false);
  const nextPlayTimeRef = useRef<number>(0);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const retryCountRef = useRef<number>(0);

  // --- Audio Logic ---
  const initAudio = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: SAMPLE_RATE_OUT });
    }
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (!analyserOutRef.current && audioContextRef.current) {
      analyserOutRef.current = audioContextRef.current.createAnalyser();
      analyserOutRef.current.fftSize = 512;
      analyserOutRef.current.smoothingTimeConstant = 0.2;
      analyserOutRef.current.connect(audioContextRef.current.destination);
    }
  };

  useEffect(() => {
    let animationFrameId: number;
    const updateOutputLevel = (timestamp: number) => {
      if (timestamp - lastOutputUpdateRef.current >= 50) {
        lastOutputUpdateRef.current = timestamp;
        if (isSpeaking && analyserOutRef.current) {
          const dataArray = new Uint8Array(analyserOutRef.current.frequencyBinCount);
          analyserOutRef.current.getByteFrequencyData(dataArray);
          
          let sum = 0;
          const startBin = 1;
          const endBin = 10;
          for (let i = startBin; i < endBin; i++) {
            sum += dataArray[i];
          }
          const average = sum / (endBin - startBin);
          const target = Math.min(1, average / 160);
          
          smoothedOutputLevelRef.current += (target - smoothedOutputLevelRef.current) * 0.3;
          setOutputLevel(smoothedOutputLevelRef.current);
        } else if (smoothedOutputLevelRef.current > 0.01) {
          smoothedOutputLevelRef.current *= 0.8;
          if (smoothedOutputLevelRef.current < 0.01) smoothedOutputLevelRef.current = 0;
          setOutputLevel(smoothedOutputLevelRef.current);
        }
      }
      animationFrameId = requestAnimationFrame(updateOutputLevel);
    };
    animationFrameId = requestAnimationFrame(updateOutputLevel);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isSpeaking]);

  const playAudioChunk = (base64Audio: string) => {
    if (!audioContextRef.current || !analyserOutRef.current) return;
    
    // Decode base64 to pcm16
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Ensure buffer length is even for Int16Array
    const bufferToUse = bytes.length % 2 !== 0 ? bytes.slice(0, -1).buffer : bytes.buffer;
    const pcm16 = new Int16Array(bufferToUse);
    const float32 = pcm16ToFloat32(pcm16);
    if (float32.length === 0) return;
    
    const buffer = audioContextRef.current.createBuffer(1, float32.length, SAMPLE_RATE_OUT);
    buffer.getChannelData(0).set(float32);
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(analyserOutRef.current);
    
    const currentTime = audioContextRef.current.currentTime;
    let startTime = nextPlayTimeRef.current;
    
    if (startTime < currentTime) {
      // 30ms lead buffer to prevent stuttering/cutting off from packet jitter
      startTime = currentTime + 0.03;
    }
    
    source.start(startTime);
    nextPlayTimeRef.current = startTime + buffer.duration;
    
    activeAudioSourcesRef.current.push(source);
    isSpeakingRef.current = true;
    setIsSpeaking(true);

    source.onended = () => {
      activeAudioSourcesRef.current = activeAudioSourcesRef.current.filter(s => s !== source);
      if (activeAudioSourcesRef.current.length === 0) {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
      }
    };
  };

  const stopSpeaking = () => {
    activeAudioSourcesRef.current.forEach(s => {
      try {
        s.stop();
        s.disconnect();
      } catch (e) {}
    });
    activeAudioSourcesRef.current = [];
    isSpeakingRef.current = false;
    setIsSpeaking(false);
    nextPlayTimeRef.current = 0;
  };

  // --- Handlers for Agentic Capabilities ---
  const openWebsite = (url: string) => {
    window.open(url, '_blank');
    return { status: 'success', message: `Opened website: ${url}` };
  };

  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isActive) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      if (liveSessionRef.current) {
        liveSessionRef.current.sendRealtimeInput({
          video: {
            mimeType: file.type,
            data: base64,
          },
        });
        // Explicit text hint
        liveSessionRef.current.sendRealtimeInput({
          text: "User uploaded an image for you to analyze."
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const startScreenShare = async () => {
    try {
      const mediaDevices = navigator.mediaDevices as any;
      if (!mediaDevices || (!mediaDevices.getDisplayMedia && !(navigator as any).getDisplayMedia)) {
        throw new Error('Screen capture is not supported in this browser context. Please try opening the app in a new tab or use a desktop browser.');
      }

      const getDisplayMedia = (mediaDevices.getDisplayMedia 
        ? mediaDevices.getDisplayMedia.bind(mediaDevices) 
        : (navigator as any).getDisplayMedia.bind(navigator));
        
      const stream = await getDisplayMedia({ 
        video: { 
          displaySurface: 'monitor'
        } 
      });
      
      screenStreamRef.current = stream;
      setIsScreenSharing(true);
      
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        screenStreamRef.current = null;
        setIsScreenSharing(false);
      });

      return { status: 'success', message: 'Screen sharing started.' };
    } catch (err: any) {
      console.error('Screen capture failed', err);
      const msg = err.name === 'NotAllowedError' 
        ? 'Permission denied. Please allow screen sharing.' 
        : (err.message || 'Failed to start screen share.');
      setError(msg);
      return { status: 'error', message: msg };
    }
  };

  const toggleScreenShare = () => {
    if (isScreenSharing && screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
      setIsScreenSharing(false);
    } else {
      startScreenShare();
    }
  };

  const analyzeScreen = async () => {
    try {
      if (!screenStreamRef.current) {
        return { 
          status: 'error', 
          message: 'Screen sharing is not active. Krish, please click the monitor icon at the bottom center to start sharing. I need you to do this before I can see anything!' 
        };
      }

      const track = screenStreamRef.current!.getVideoTracks()[0];
      
      // Fallback for browsers without ImageCapture
      let bitmap;
      if ('ImageCapture' in window) {
        try {
          const imageCapture = new (window as any).ImageCapture(track);
          bitmap = await imageCapture.grabFrame();
        } catch (e) {
          console.warn('ImageCapture failed, falling back to video element', e);
        }
      }
      
      if (!bitmap) {
        // Standard video element fallback
        const video = document.createElement('video');
        video.srcObject = screenStreamRef.current;
        await video.play();
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
        const data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        if (liveSessionRef.current) {
          liveSessionRef.current.sendRealtimeInput({
            video: {
              mimeType: 'image/jpeg',
              data: data
            }
          });
          // Explicit text hint for the model
          liveSessionRef.current.sendRealtimeInput({
            text: "User's current screen captured. Analyze the visual input above."
          });
        }
        video.pause();
        video.srcObject = null;
        return { status: 'success', message: 'Screen captured and sent to your eyes. Please tell me what you see!' };
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(bitmap, 0, 0);
      const data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      
      if (liveSessionRef.current) {
        liveSessionRef.current.sendRealtimeInput({
          video: {
            mimeType: 'image/jpeg',
            data: data
          }
        });
        // Explicit text hint
        liveSessionRef.current.sendRealtimeInput({
          text: "User's current screen captured. Analyze the visual input above."
        });
      }
      return { status: 'success', message: 'Screen captured and sent to your eyes. Please tell me what you see!' };
    } catch (err: any) {
      console.error('Screen analysis failed', err);
      return { status: 'error', message: err.message || 'Analysis failed' };
    }
  };

  const handleRequestMicAndRetry = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setError(null);
      setTimeout(startShree, 200);
    } catch (err: any) {
      console.warn("Microphone request error:", err);
      setError("Microphone permission blocked by browser/device. Please tap lock/site settings in address bar to allow mic access.");
    }
  };

  // --- Live API Management ---
  const startShree = async () => {
    try {
      setError(null);

      const activeApiKey = customApiKey.trim() || process.env.GEMINI_API_KEY;

      if (!activeApiKey) {
        setError("GEMINI_API_KEY is missing. Please enter your Gemini API Key in Settings.");
        stopShree();
        return;
      }

      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      await initAudio();
      
      let micPermission: MediaStream;
      try {
        micPermission = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
      } catch (micErr: any) {
        console.error("Microphone getUserMedia error:", micErr);
        setError("Microphone access denied! Please allow mic permission to speak with Shree.");
        stopShree();
        return;
      }
      streamRef.current = micPermission;

      const ai = new GoogleGenAI({ apiKey: activeApiKey });

      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsListening(true);
            retryCountRef.current = 0; // Reset on success
            setLastMessageTime(Date.now());
            
            const context = audioContextRef.current!;
            const source = context.createMediaStreamSource(micPermission);
            const processor = context.createScriptProcessor(2048, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const activeSession = liveSessionRef.current;
              if (!activeSession) return;
              const input = e.inputBuffer.getChannelData(0);

              // RMS Volume calculation
              let sum = 0;
              for (let i = 0; i < input.length; i++) {
                sum += input[i] * input[i];
              }
              const level = Math.sqrt(sum / input.length);
              const nowMic = Date.now();
              if (nowMic - lastMicUpdateRef.current > 60) {
                lastMicUpdateRef.current = nowMic;
                setMicLevel(level);
              }

              // Prevent speaker audio from feeding back into microphone when Shree is speaking aloud
              const isSpeakingNow = isSpeakingRef.current || activeAudioSourcesRef.current.length > 0;
              if (isSpeakingNow && level < 0.05) {
                return;
              }

              // Resample from context rate to 16k
              const resampled = resample(input, context.sampleRate, SAMPLE_RATE_IN);
              const pcm16 = float32ToPcm16(resampled);
              const b64 = base64Encode(pcm16);
              
              try {
                activeSession.sendRealtimeInput({
                  audio: { data: b64, mimeType: 'audio/pcm;rate=16000' }
                });
              } catch (err) {
                console.error('Realtime input error:', err);
              }
            };
            
            source.connect(processor);
            processor.connect(context.destination);
            (context as any).shreeProcessor = processor;
            (context as any).shreeSource = source;
          },
          onmessage: async (message: LiveServerMessage) => {
            setLastMessageTime(Date.now());
            if ((message as any).serverContent?.goAway) {
              console.log('Received GoAway signal. Closing connection gracefully.');
              setError("Session limit reached. Click to restart Shree!");
              stopShree();
              return;
            }

            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              playAudioChunk(audioData);
            }

            // Handle Transcription
            const msg = message as any;
            // Model output text
            const modelText = msg.serverContent?.modelTurn?.parts?.find((p: any) => p.text)?.text;
            if (modelText) {
              setTranscription(prev => ({ ...prev, shree: modelText }));
            }
            
            // User input transcription
            const userText = msg.serverContent?.userTurn?.parts?.find((p: any) => p.text)?.text 
                          || msg.clientContent?.transcription 
                          || msg.serverContent?.transcription?.text;
            if (userText) {
              setTranscription(prev => ({ ...prev, user: userText }));
            }
            
            if (message.serverContent?.interrupted) {
              stopSpeaking();
            }
            
            if (message.toolCall) {
              for (const call of message.toolCall.functionCalls) {
                let result;
                if (call.name === 'openWebsite') {
                  result = openWebsite((call.args as any).url);
                } else if (call.name === 'analyzeScreen') {
                  result = await analyzeScreen();
                } else if (call.name === 'updateAnimationMetadata') {
                  const args = call.args as any;
                  setAnimState(args.state || 'idle');
                  setExpression(args.expression || 'happy');
                  setIsLipSyncEnabled(!!args.lipSync);
                  if (args.imageLink) setCurrentVisual(args.imageLink);
                  result = { status: 'success' };
                } else if (call.name === 'openMiniGame') {
                  const mode = (call.args as any).type as GameType;
                  setGameMode(mode);
                  result = { status: 'success', message: `Game ${mode} started!` };
                } else if (call.name === 'getCurrentTime') {
                  const now = new Date();
                  const timeString = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                  const dateString = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                  result = {
                    status: 'success',
                    time: timeString,
                    date: dateString,
                    currentTime: `The exact real-time live clock is ${timeString} on ${dateString}`
                  };
                }
                
                if (result && liveSessionRef.current) {
                  liveSessionRef.current.sendToolResponse({
                    functionResponses: [{
                      name: call.name,
                      id: call.id,
                      response: result
                    }]
                  });
                }
              }
            }
          },
          onclose: (event) => {
            console.log('Session closed', event);
            stopShree();
          },
          onerror: (err: any) => {
            console.error('Live API Error:', err);
            const msg = (err?.message || String(err)).toLowerCase();
            
            // Auto-reconnect for network issues
            if (msg.includes("network") || msg.includes("fetch") || msg.includes("internal error") || msg.includes("socket") || msg.includes("failed to connect") || msg.includes("unavailable")) {
              stopShree();
              if (retryCountRef.current < 5) {
                retryCountRef.current++;
                const waitTime = 1500 * retryCountRef.current; 
                
                if (msg.includes("unavailable")) {
                  setError(`Shree thodi busy hai (Service Unavailable). Reconnecting... (${retryCountRef.current}/5)`);
                } else {
                  setError(`Signal kam aa raha hai... reconnect kar rahi hoon (${retryCountRef.current}/5)`);
                }

                setTimeout(() => {
                  startShree();
                }, waitTime);
                return;
              }
              setError(msg.includes("unavailable") ? "Shree abhi rest kar rahi hai (Unavailable). Please refresh or wait a bit." : "Network ki problem hai, ek baar button daba kar phir se try karo?");
            } else if (msg.includes("quota") || msg.includes("limit")) {
              setError("Humne bohot baatein kar li aaj! Limit khatam ho gayi hai. Kal milte hain? (Quota Limit Reached)");
              stopShree();
            } else if (msg.includes("GoAway") || msg.includes("aborted") || msg.includes("closed")) {
              setError("Session khatam ho gaya. Chalo phir se start karte hain!");
              stopShree();
            } else {
              setError("Oops! Kuch gadbad ho gayi. Retry karna chahoge?");
              stopShree();
            }
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Lyra" } },
          },
          systemInstruction: `${getShreeSystemInstruction(userName || 'Krish')}\n\nCURRENT INITIAL LOCAL TIME: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })} on ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Always call 'getCurrentTime' tool when asked for time to provide live accuracy!`,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          tools: [
            {
              functionDeclarations: [
                {
                  name: 'getCurrentTime',
                  description: 'Get the exact current live real-time clock, time, and date.',
                  parameters: { type: Type.OBJECT, properties: {} }
                },
                {
                  name: 'openWebsite',
                  description: 'Open a specific website URL in a new tab.',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      url: { type: Type.STRING, description: 'The absolute URL to open.' }
                    },
                    required: ['url']
                  }
                },
                {
                  name: 'analyzeScreen',
                  description: 'Capture a screenshot of the user\'s current screen and analyze it.',
                  parameters: { type: Type.OBJECT, properties: {} }
                },
                {
                  name: 'updateAnimationMetadata',
                  description: 'Update the visual animation state of Shree.',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      state: { type: Type.STRING, enum: ['idle', 'listening', 'speaking'], description: 'The current state of interaction.' },
                      expression: { type: Type.STRING, enum: ['happy', 'sad', 'heartbroken', 'excited', 'caring', 'sassy', 'surprised', 'embarrassed', 'confused', 'thinking'], description: 'The emotional expression.' },
                      lipSync: { type: Type.BOOLEAN, description: 'Whether mouth movement should be enabled.' },
                      imageLink: { type: Type.STRING, description: 'The specific URL to display for this event.' }
                    },
                    required: ['state', 'expression', 'lipSync', 'imageLink']
                  }
                },
                {
                  name: 'openMiniGame',
                  description: 'Start a mini-game challenge with the user.',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, enum: ['ludo', 'none'], description: 'The type of game to start.' }
                    },
                    required: ['type']
                  }
                }
              ]
            }
          ]
        }
      });
      
      const sess = await sessionPromise;
      liveSessionRef.current = sess;
    } catch (err: any) {
      console.error('Failed to start Shree:', err);
      const msg = (err?.message || String(err)).toLowerCase();
      if (msg.includes("permission denied") || msg.includes("notallowederror")) {
        setError("Microphone access denied! Please enable mic in browser settings and try again.");
        stopShree();
      } else if (msg.includes("unavailable") || msg.includes("network") || msg.includes("fetch")) {
        if (retryCountRef.current < 5) {
          retryCountRef.current++;
          setError(`Shree ko call lag raha hai... (${retryCountRef.current}/5)`);
          setTimeout(startShree, 2000 * retryCountRef.current);
        } else {
          setError("Shree busy hai ya network issue hai. Please try again later.");
          stopShree();
        }
      } else {
        setError("Mic connection mein problem ho rahi hai. Key check karein?");
        stopShree();
      }
    }
  };

  const stopShree = () => {
    setIsActive(false);
    setIsListening(false);
    stopSpeaking();
    
    if (liveSessionRef.current) {
      try {
        liveSessionRef.current.close();
      } catch (e) {}
      liveSessionRef.current = null;
    }
    
    if (audioContextRef.current) {
      const context = audioContextRef.current as any;
      if (context.mahiProcessor || context.shreeProcessor) {
        try {
          const proc = context.shreeProcessor || context.mahiProcessor;
          proc.disconnect();
          proc.onaudioprocess = null;
        } catch (e) {
          console.log('Processor cleanup err:', e);
        }
        context.mahiProcessor = null;
        context.shreeProcessor = null;
      }
      if (context.mahiSource || context.shreeSource) {
        try {
          const src = context.shreeSource || context.mahiSource;
          src.disconnect();
        } catch (e) {
          console.log('Source cleanup err:', e);
        }
        context.mahiSource = null;
        context.shreeSource = null;
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    
    // Clear audio queue
    audioQueueRef.current = [];
    nextPlayTimeRef.current = 0;
  };

  const handleSendText = async (text: string) => {
    if (!text.trim()) return;
    const msg = text.trim();
    setTranscription(prev => ({ ...prev, user: msg }));
    
    if (liveSessionRef.current) {
      try {
        liveSessionRef.current.sendRealtimeInput({ text: msg });
      } catch (err) {
        console.error('Error sending text to live session:', err);
      }
    } else {
      try {
        const res = await fetch('/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg }),
        });
        const data = await res.json();
        if (data.reply) {
          setTranscription(prev => ({ ...prev, shree: data.reply }));
        }
      } catch (e) {
        console.error('Chat error:', e);
      }
    }
  };

  const toggleShree = () => {
    if (isActive) {
      stopShree();
    } else {
      startShree();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020b18] flex flex-col items-center justify-between overflow-hidden font-sans text-white select-none">
      
      {/* 1. Underwater Animated Multi-Layer Background */}
      <UnderwaterBackground isPerformanceMode={isPerformanceMode} />

      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* 2. Top Header HUD */}
      <AquaticHeader
        isActive={isActive}
        onOpenMenu={() => {
          setDrawerTitle('SHREE MENU');
          setIsDrawerOpen(true);
        }}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
      />

      {/* 3. Debug HUD Overlay */}
      <AnimatePresence>
        {showDebug && (
          <motion.div
            key="debug-overlay"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed top-20 left-4 z-[99] bg-slate-950/90 backdrop-blur-xl p-4 rounded-2xl border border-cyan-400/40 w-64 text-[10px] space-y-2 pointer-events-none shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <div className="text-cyan-300 uppercase tracking-widest font-bold border-b border-cyan-500/20 pb-1 font-mono">
              SYSTEM DEBUG HUD
            </div>
            <div>
              <span className="text-cyan-400 font-mono">STATUS:</span>{' '}
              <span className="text-cyan-100 font-bold">{isActive ? 'LIVE' : 'STANDBY'}</span>
            </div>
            <div>
              <span className="text-cyan-400 font-mono">MIC LEVEL:</span>{' '}
              <div className="inline-block w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden align-middle">
                <div
                  className="h-full bg-cyan-400"
                  style={{ width: `${Math.min(100, micLevel * 500)}%` }}
                />
              </div>
            </div>
            <div>
              <span className="text-cyan-400 font-mono">RETRY COUNT:</span> {retryCountRef.current}
            </div>
            <div className="truncate">
              <span className="text-cyan-400 font-mono">USER:</span>{' '}
              <span className="text-cyan-200">{transcription.user || '...'}</span>
            </div>
            <div className="truncate">
              <span className="text-cyan-400 font-mono">SHREE:</span>{' '}
              <span className="text-cyan-200">{transcription.shree || '...'}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Main Avatar Area */}
      <main className="relative flex-1 w-full flex items-center justify-center pt-20 pb-40 px-4 z-10 pointer-events-none">
        <AquaticAvatar
          currentVisual={currentVisual}
          defaultVisual={DEFAULT_GREETING_PIC}
          getDirectImageUrl={getDirectImageUrl}
          expression={expression}
          isSpeaking={isSpeaking}
          isListening={isListening}
          isActive={isActive}
          isLipSyncEnabled={isLipSyncEnabled}
          isBlinking={isBlinking}
          outputLevel={outputLevel}
          mouthOpenImg={ANIME_GIRL_MOUTH_OPEN}
          eyesClosedImg={ANIME_GIRL_EYES_CLOSED}
          onVisualError={() => setCurrentVisual(DEFAULT_GREETING_PIC)}
          onToggleMic={toggleShree}
        />
      </main>

      {/* 5. Bottom Waveform & Status */}
      <AquaticControls
        isActive={isActive}
        isListening={isListening}
        isSpeaking={isSpeaking}
        micLevel={micLevel}
        outputLevel={outputLevel}
      />

      {/* 6. MiniGames Modal */}
      <MiniGames
        gameType={gameMode}
        onClose={() => setGameMode('none')}
        theme={theme}
        onGameEvent={(event, score) => {
          if (liveSessionRef.current) {
            liveSessionRef.current.sendRealtimeInput({
              text: `Krish triggered game event: ${event}. Current Game Score: ${score}. Respond to his progress!`,
            });
          }
        }}
      />

      {/* 7. Sidebar / Glass Actions Drawer */}
      <ActionsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={drawerTitle || 'SHREE MENU & SETTINGS'}
        onStartGame={() => setGameMode('ludo')}
        onUploadImage={() => fileInputRef.current?.click()}
        onToggleScreen={toggleScreenShare}
        isScreenSharing={isScreenSharing}
        showDebug={showDebug}
        onToggleDebug={() => setShowDebug(!showDebug)}
        themes={THEMES}
        currentTheme={currentTheme}
        onSelectTheme={(tKey) => setCurrentTheme(tKey as keyof typeof THEMES)}
        customApiKey={customApiKey}
        onSaveApiKey={handleSaveApiKey}
        isPerformanceMode={isPerformanceMode}
        onTogglePerformanceMode={handleTogglePerformanceMode}
        userName={userName}
        onSaveUserName={handleSaveUserName}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        currentVisual={currentVisual}
        onChangeAvatar={handleChangeAvatar}
      />

      {/* Welcome & Name Onboarding Modal */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        initialName={userName}
        onSubmit={handleSaveUserName}
      />

      {/* Admin Control Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        userName={userName}
        onSaveUserName={handleSaveUserName}
        customApiKey={customApiKey}
        onSaveApiKey={handleSaveApiKey}
        isPerformanceMode={isPerformanceMode}
        onTogglePerformanceMode={handleTogglePerformanceMode}
        currentVisual={currentVisual}
        onChangeAvatar={handleChangeAvatar}
      />

      {/* 8. Connection Error Banner Overlay */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="status-error-overlay"
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-20 left-1/2 z-[100] w-[90%] max-w-sm pointer-events-auto"
          >
            <div className="bg-cyan-950/90 border border-cyan-400/50 backdrop-blur-xl p-4 rounded-2xl flex flex-col items-center gap-3 shadow-[0_0_30px_rgba(6,182,212,0.4)] overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/30 overflow-hidden">
                <motion.div
                  className="h-full bg-cyan-400"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              <p className="text-cyan-100 text-xs font-medium text-center leading-relaxed">
                {error}
              </p>

              <div className="flex items-center gap-2 w-full justify-center">
                {error.toLowerCase().includes('mic') || error.toLowerCase().includes('permission') ? (
                  <>
                    <button
                      onClick={handleRequestMicAndRetry}
                      className="bg-cyan-500/30 hover:bg-cyan-400/40 border border-cyan-400/60 px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-[1px] transition-all active:scale-95 text-white flex-1"
                    >
                      ALLOW MIC & RETRY
                    </button>
                    <button
                      onClick={() => {
                        setDrawerTitle('SHREE MENU & SETTINGS');
                        setIsDrawerOpen(true);
                      }}
                      className="bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-400/30 px-3 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-[1px] transition-all active:scale-95 text-cyan-200"
                    >
                      SETTINGS
                    </button>
                  </>
                ) : error.toLowerCase().includes('api key') || error.toLowerCase().includes('key is missing') ? (
                  <>
                    <button
                      onClick={() => {
                        setDrawerTitle('SHREE MENU & SETTINGS');
                        setIsDrawerOpen(true);
                      }}
                      className="bg-cyan-500/30 hover:bg-cyan-400/40 border border-cyan-400/60 px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-[1px] transition-all active:scale-95 text-white flex-1"
                    >
                      SET API KEY IN SETTINGS
                    </button>
                    <button
                      onClick={() => {
                        stopShree();
                        setTimeout(startShree, 300);
                      }}
                      className="bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-400/30 px-3 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-[1px] transition-all active:scale-95 text-cyan-200"
                    >
                      RESET
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        stopShree();
                        setTimeout(startShree, 300);
                      }}
                      className="bg-cyan-500/30 hover:bg-cyan-400/40 border border-cyan-400/60 px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-[1px] transition-all active:scale-95 text-white flex-1"
                    >
                      RETRY CONNECTION
                    </button>
                    <button
                      onClick={() => {
                        setDrawerTitle('SHREE MENU & SETTINGS');
                        setIsDrawerOpen(true);
                      }}
                      className="bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-400/30 px-3 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-[1px] transition-all active:scale-95 text-cyan-200"
                    >
                      SETTINGS
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
