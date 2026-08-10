import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RotateCcw, Users, User, Bot, Sparkles, Star } from 'lucide-react';

export type GameType = 'ludo' | 'none';

interface MiniGamesProps {
  gameType: GameType;
  onClose: () => void;
  onGameEvent: (event: string, score: number) => void;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

type Color = 'red' | 'green' | 'yellow' | 'blue';

const DICE_ICONS = [Dice1, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

// 52 Common Track Cells sequence around 15x15 board [row, col]
const MAIN_PATH: [number, number][] = [
  [6, 1],  [6, 2],  [6, 3],  [6, 4],  [6, 5],   // 0..4 (Red arm top)
  [5, 6],  [4, 6],  [3, 6],  [2, 6],  [1, 6],  [0, 6], // 5..10 (Top arm left)
  [0, 7],  // 11 (Top center)
  [0, 8],  [1, 8],  [2, 8],  [3, 8],  [4, 8],  [5, 8], // 12..17 (Top arm right)
  [6, 9],  [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], // 18..23 (Right arm top)
  [7, 14], // 24 (Right center)
  [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],  // 25..30 (Right arm bottom)
  [9, 8],  [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], // 31..36 (Bottom arm right)
  [14, 7], // 37 (Bottom center)
  [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],  // 38..43 (Bottom arm left)
  [8, 5],  [8, 4],  [8, 3],  [8, 2],  [8, 1],  [8, 0],  // 44..49 (Left arm bottom)
  [7, 0],  // 50 (Left center)
];

// Start cell indices in MAIN_PATH for each color
const START_INDICES: Record<Color, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// Safe Star Cells [row, col]
const SAFE_CELLS: [number, number][] = [
  [6, 1],   // Red start
  [2, 6],   // Top left star
  [1, 8],   // Green start
  [6, 12],  // Top right star
  [8, 13],  // Yellow start
  [12, 8],  // Bottom right star
  [13, 6],  // Blue start
  [8, 2],   // Bottom left star
];

// Home corridors (5 steps each before center home)
const HOME_PATHS: Record<Color, [number, number][]> = {
  red:    [[7, 1],  [7, 2],  [7, 3],  [7, 4],  [7, 5]],
  green:  [[1, 7],  [2, 7],  [3, 7],  [4, 7],  [5, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
  blue:   [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
};

// Center home cells [row, col]
const HOME_CENTER: Record<Color, [number, number]> = {
  red:    [7, 6],
  green:  [6, 7],
  yellow: [7, 8],
  blue:   [8, 7],
};

// Yard positions for 4 tokens per color [row, col]
const YARD_SPOTS: Record<Color, [number, number][]> = {
  red:    [[1, 1], [1, 4], [4, 1], [4, 4]],
  green:  [[1, 10], [1, 13], [4, 10], [4, 13]],
  yellow: [[10, 10], [10, 13], [13, 10], [13, 13]],
  blue:   [[10, 1], [10, 4], [13, 1], [13, 4]],
};

// Color metadata
const COLOR_CONFIG: Record<Color, { name: string; bg: string; text: string; hex: string; border: string }> = {
  red:    { name: 'Red (You)', bg: 'bg-red-500', text: 'text-red-400', hex: '#EF4444', border: 'border-red-500' },
  green:  { name: 'Green (Shree)', bg: 'bg-green-500', text: 'text-green-400', hex: '#22C55E', border: 'border-green-500' },
  yellow: { name: 'Yellow (Shree)', bg: 'bg-amber-500', text: 'text-amber-400', hex: '#EAB308', border: 'border-amber-500' },
  blue:   { name: 'Blue (Shree)', bg: 'bg-blue-500', text: 'text-blue-400', hex: '#3B82F6', border: 'border-blue-500' },
};

export function MiniGames({ gameType, onClose, onGameEvent }: MiniGamesProps) {
  const [numPlayers, setNumPlayers] = useState<2 | 4>(2);
  const [turn, setTurn] = useState<Color>('red');
  const [diceRoll, setDiceRoll] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [hasRolled, setHasRolled] = useState<boolean>(false);
  const [consecutiveSixes, setConsecutiveSixes] = useState<number>(0);
  const [winner, setWinner] = useState<Color | null>(null);
  const [lastLog, setLastLog] = useState<string>('Welcome to Shree Classic Ludo! Tap "Roll Dice" to begin.');

  // Token positions: -1 = Yard, 0..50 = Main Path, 51..55 = Home Path, 56 = Home
  const [tokens, setTokens] = useState<Record<Color, number[]>>({
    red:    [-1, -1, -1, -1],
    green:  [-1, -1, -1, -1],
    yellow: [-1, -1, -1, -1],
    blue:   [-1, -1, -1, -1],
  });

  const activeColors: Color[] = numPlayers === 2 ? ['red', 'green'] : ['red', 'green', 'yellow', 'blue'];

  // Reset Game
  const resetGame = () => {
    setTokens({
      red:    [-1, -1, -1, -1],
      green:  [-1, -1, -1, -1],
      yellow: [-1, -1, -1, -1],
      blue:   [-1, -1, -1, -1],
    });
    setTurn('red');
    setDiceRoll(1);
    setIsRolling(false);
    setHasRolled(false);
    setConsecutiveSixes(0);
    setWinner(null);
    setLastLog('Game reset! Red (You) starts the game.');
  };

  // Get exact [row, col] on 15x15 board for a token position
  const getTokenCoords = (color: Color, pos: number, tokenIdx: number): [number, number] => {
    if (pos === -1) {
      return YARD_SPOTS[color][tokenIdx];
    }
    if (pos === 56) {
      return HOME_CENTER[color];
    }
    if (pos >= 51 && pos <= 55) {
      const idx = pos - 51;
      return HOME_PATHS[color][idx];
    }
    // Main path index (0..50)
    const startIdx = START_INDICES[color];
    const pathIdx = (startIdx + pos) % 52;
    return MAIN_PATH[pathIdx];
  };

  // Helper: check if cell coordinate is a safe spot
  const isCellSafe = (row: number, col: number): boolean => {
    return SAFE_CELLS.some(([r, c]) => r === row && c === col);
  };

  // Calculate moveable token indices for active player with current dice value
  const getMoveableTokens = (color: Color, rollVal: number): number[] => {
    const colorTokens = tokens[color];
    const valid: number[] = [];

    colorTokens.forEach((pos, idx) => {
      if (pos === -1) {
        // Token in yard requires a 6 to open
        if (rollVal === 6) valid.push(idx);
      } else if (pos < 56) {
        // Token on board can move if it doesn't overshoot 56
        if (pos + rollVal <= 56) valid.push(idx);
      }
    });

    return valid;
  };

  // Roll Dice handler
  const rollDice = () => {
    if (isRolling || hasRolled || winner) return;

    setIsRolling(true);
    let rolls = 0;
    const interval = setInterval(() => {
      setDiceRoll(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls > 8) {
        clearInterval(interval);
        const finalVal = Math.floor(Math.random() * 6) + 1;
        setDiceRoll(finalVal);
        setIsRolling(false);
        setHasRolled(true);

        handlePostRoll(turn, finalVal);
      }
    }, 70);
  };

  // Process post-roll options
  const handlePostRoll = (color: Color, rollVal: number) => {
    let sixes = consecutiveSixes;
    if (rollVal === 6) {
      sixes++;
      setConsecutiveSixes(sixes);
    } else {
      setConsecutiveSixes(0);
    }

    // 3 consecutive 6s penalty -> turn wasted
    if (sixes >= 3) {
      setLastLog(`${COLOR_CONFIG[color].name} rolled three 6s in a row! Turn forfeited.`);
      setConsecutiveSixes(0);
      setHasRolled(false);
      passTurn(color);
      return;
    }

    const moveable = getMoveableTokens(color, rollVal);

    if (moveable.length === 0) {
      setLastLog(`${COLOR_CONFIG[color].name} rolled a ${rollVal}. No valid moves!`);
      setTimeout(() => {
        setHasRolled(false);
        passTurn(color);
      }, 1000);
    } else {
      setLastLog(`${COLOR_CONFIG[color].name} rolled a ${rollVal}! Select a token to move.`);
      // If AI turn, auto select best move
      if (color !== 'red') {
        setTimeout(() => {
          makeAIMove(color, rollVal, moveable);
        }, 800);
      }
    }
  };

  // Move selected token
  const moveToken = (color: Color, tokenIdx: number, stepVal: number) => {
    const currentPos = tokens[color][tokenIdx];
    let newPos = currentPos === -1 ? 0 : currentPos + stepVal;
    if (newPos > 56) return;

    const newTokens = { ...tokens };
    newTokens[color] = [...newTokens[color]];
    newTokens[color][tokenIdx] = newPos;

    // Check Capture
    let captured = false;
    let capturedColor: Color | null = null;

    if (newPos >= 0 && newPos <= 50) {
      const targetCoords = getTokenCoords(color, newPos, tokenIdx);
      const isSafe = isCellSafe(targetCoords[0], targetCoords[1]);

      if (!isSafe) {
        // Look for opponent tokens at same coordinates
        activeColors.forEach((otherColor) => {
          if (otherColor !== color) {
            newTokens[otherColor].forEach((otherPos, otherIdx) => {
              if (otherPos >= 0 && otherPos <= 50) {
                const otherCoords = getTokenCoords(otherColor, otherPos, otherIdx);
                if (otherCoords[0] === targetCoords[0] && otherCoords[1] === targetCoords[1]) {
                  // Capture! Send back to yard (-1)
                  newTokens[otherColor] = [...newTokens[otherColor]];
                  newTokens[otherColor][otherIdx] = -1;
                  captured = true;
                  capturedColor = otherColor;
                }
              }
            });
          }
        });
      }
    }

    setTokens(newTokens);

    // Notify App
    if (color === 'red') {
      onGameEvent('player_moved_ludo', newPos);
    } else {
      onGameEvent('shree_moved_ludo', newPos);
    }

    // Check Win condition (all 4 tokens at 56)
    if (newTokens[color].every((p) => p === 56)) {
      setWinner(color);
      setLastLog(`🎉 ${COLOR_CONFIG[color].name} HAS WON THE LUDO MATCH!`);
      if (color === 'red') {
        onGameEvent('player_won_ludo', 100);
      } else {
        onGameEvent('shree_won_ludo', 0);
      }
      return;
    }

    // Logging & Bonus Roll
    if (captured && capturedColor) {
      setLastLog(`⚔️ ${COLOR_CONFIG[color].name} captured ${COLOR_CONFIG[capturedColor].name}'s token! Bonus Roll!`);
      onGameEvent('ludo_capture', 50);
      setHasRolled(false); // Bonus roll
      if (color !== 'red') {
        setTimeout(rollDice, 1000);
      }
    } else if (stepVal === 6) {
      setLastLog(`🌟 ${COLOR_CONFIG[color].name} rolled a 6! Gets an extra turn.`);
      setHasRolled(false); // Bonus roll for 6
      if (color !== 'red') {
        setTimeout(rollDice, 1000);
      }
    } else {
      setHasRolled(false);
      setConsecutiveSixes(0);
      passTurn(color);
    }
  };

  // Pass turn to next active color
  const passTurn = (currentColor: Color) => {
    const currentIdx = activeColors.indexOf(currentColor);
    const nextIdx = (currentIdx + 1) % activeColors.length;
    const nextColor = activeColors[nextIdx];
    setTurn(nextColor);
    setHasRolled(false);
  };

  // Shree AI Move Heuristic
  const makeAIMove = (aiColor: Color, rollVal: number, validIndices: number[]) => {
    let chosenIdx = validIndices[0];

    // Priority 1: Move that captures opponent
    for (const idx of validIndices) {
      const curPos = tokens[aiColor][idx];
      const targetPos = curPos === -1 ? 0 : curPos + rollVal;
      if (targetPos <= 50) {
        const coords = getTokenCoords(aiColor, targetPos, idx);
        if (!isCellSafe(coords[0], coords[1])) {
          let captures = false;
          activeColors.forEach((oc) => {
            if (oc !== aiColor) {
              tokens[oc].forEach((op, oidx) => {
                if (op >= 0 && op <= 50) {
                  const ocoords = getTokenCoords(oc, op, oidx);
                  if (ocoords[0] === coords[0] && ocoords[1] === coords[1]) {
                    captures = true;
                  }
                }
              });
            }
          });
          if (captures) {
            chosenIdx = idx;
            break;
          }
        }
      }
    }

    // Priority 2: Opening a token from Yard on a 6 if few tokens are out
    if (rollVal === 6) {
      const yardIdx = validIndices.find((i) => tokens[aiColor][i] === -1);
      if (yardIdx !== undefined) {
        chosenIdx = yardIdx;
      }
    }

    // Priority 3: Reaching Home 56
    const homeIdx = validIndices.find((i) => {
      const curPos = tokens[aiColor][i];
      return curPos !== -1 && curPos + rollVal === 56;
    });
    if (homeIdx !== undefined) chosenIdx = homeIdx;

    moveToken(aiColor, chosenIdx, rollVal);
  };

  // Auto trigger AI turn when turn changes to AI
  useEffect(() => {
    if (gameType === 'ludo' && !winner && turn !== 'red' && !isRolling && !hasRolled) {
      const timer = setTimeout(() => {
        rollDice();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [turn, winner, gameType, isRolling, hasRolled]);

  if (gameType === 'none') return null;

  const DiceIcon = DICE_ICONS[diceRoll];
  const moveableIndices = hasRolled ? getMoveableTokens(turn, diceRoll) : [];

  // Group all active tokens by `[row, col]` to render stacked pins cleanly
  const tokensByCell: Record<string, { color: Color; idx: number }[]> = {};
  activeColors.forEach((color) => {
    tokens[color].forEach((pos, idx) => {
      const [r, c] = getTokenCoords(color, pos, idx);
      const key = `${r}-${c}`;
      if (!tokensByCell[key]) tokensByCell[key] = [];
      tokensByCell[key].push({ color, idx });
    });
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto"
    >
      <div className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col my-auto">
        
        {/* Ludo Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-cyan-500/20 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <Trophy className="text-amber-400 animate-bounce" size={22} />
            <div>
              <h2 className="text-base sm:text-lg font-bold font-mono tracking-wider text-cyan-100 uppercase">
                SHREE CLASSIC LUDO
              </h2>
              <p className="text-[10px] text-cyan-400/80 font-mono">
                {numPlayers === 2 ? '1v1: Red (You) vs Green (Shree)' : '4-Player Championship'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setNumPlayers(numPlayers === 2 ? 4 : 2)}
              className="px-2.5 py-1 rounded-xl bg-cyan-950 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 hover:border-cyan-400 flex items-center gap-1.5 transition-all"
            >
              <Users size={12} />
              <span>{numPlayers}P</span>
            </button>
            <button
              onClick={resetGame}
              className="p-1.5 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-300 hover:text-white transition-colors"
              title="Reset Game"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-300 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Board Display Area */}
        <div className="p-3 sm:p-5 flex flex-col items-center justify-center gap-4 bg-slate-950/40">
          
          {/* Status / Log Banner */}
          <div className="w-full px-3 py-2 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2 truncate">
              <span className={`w-2.5 h-2.5 rounded-full ${COLOR_CONFIG[turn].bg} animate-ping`} />
              <span className="text-[11px] font-mono font-bold text-cyan-200 truncate">
                {lastLog}
              </span>
            </div>
            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${COLOR_CONFIG[turn].border} ${COLOR_CONFIG[turn].text} bg-slate-900`}>
              {COLOR_CONFIG[turn].name} Turn
            </span>
          </div>

          {/* 15x15 Ludo Board Grid */}
          <div className="relative w-full aspect-square max-w-[420px] bg-white rounded-2xl border-4 border-slate-800 shadow-2xl p-1 grid grid-cols-15 grid-rows-15 gap-[1px]">
            
            {/* Top-Left: RED Home Yard (Rows 0-5, Cols 0-5) */}
            <div className="col-span-6 row-span-6 bg-[#EF4444] p-3 rounded-tl-xl flex items-center justify-center relative">
              <div className="w-full h-full bg-white rounded-xl border-2 border-red-700 flex flex-col items-center justify-around p-2 shadow-inner">
                <span className="text-[10px] font-bold font-mono text-red-600 tracking-wider">RED YARD</span>
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((tIdx) => (
                    <div key={tIdx} className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center shadow-md">
                      {tokens.red[tIdx] === -1 && (
                        <LudoPin
                          color="red"
                          isSelectable={turn === 'red' && hasRolled && moveableIndices.includes(tIdx)}
                          onClick={() => moveToken('red', tIdx, diceRoll)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Center: Top Arm (Rows 0-5, Cols 6-8) */}
            <div className="col-span-3 row-span-6 grid grid-cols-3 grid-rows-6 border-b-2 border-slate-700">
              {Array.from({ length: 18 }).map((_, i) => {
                const r = Math.floor(i / 3);
                const c = 6 + (i % 3);
                const isGreenHomeCol = c === 7 && r >= 1;
                const isGreenStart = r === 1 && c === 8;
                const isStar = r === 2 && c === 6;

                return (
                  <div
                    key={i}
                    className={`border border-slate-300 relative flex items-center justify-center ${
                      isGreenHomeCol ? 'bg-green-500' : isGreenStart ? 'bg-green-500' : 'bg-white'
                    }`}
                  >
                    {isGreenStart && <span className="text-white text-[10px] font-bold">↓</span>}
                    {isStar && <Star size={12} className="text-amber-500 fill-amber-400" />}
                    {renderCellTokens(r, c, tokensByCell, turn, hasRolled, moveableIndices, diceRoll, moveToken)}
                  </div>
                );
              })}
            </div>

            {/* Top-Right: GREEN Home Yard (Rows 0-5, Cols 9-14) */}
            <div className="col-span-6 row-span-6 bg-[#22C55E] p-3 rounded-tr-xl flex items-center justify-center relative">
              <div className="w-full h-full bg-white rounded-xl border-2 border-green-700 flex flex-col items-center justify-around p-2 shadow-inner">
                <span className="text-[10px] font-bold font-mono text-green-600 tracking-wider">GREEN YARD</span>
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((tIdx) => (
                    <div key={tIdx} className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center shadow-md">
                      {tokens.green[tIdx] === -1 && (
                        <LudoPin
                          color="green"
                          isSelectable={turn === 'green' && hasRolled && moveableIndices.includes(tIdx)}
                          onClick={() => moveToken('green', tIdx, diceRoll)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Left: Left Arm (Rows 6-8, Cols 0-5) */}
            <div className="col-span-6 row-span-3 grid grid-cols-6 grid-rows-3 border-r-2 border-slate-700">
              {Array.from({ length: 18 }).map((_, i) => {
                const r = 6 + Math.floor(i / 6);
                const c = i % 6;
                const isRedHomeCol = r === 7 && c >= 1;
                const isRedStart = r === 6 && c === 1;
                const isStar = r === 8 && c === 2;

                return (
                  <div
                    key={i}
                    className={`border border-slate-300 relative flex items-center justify-center ${
                      isRedHomeCol ? 'bg-red-500' : isRedStart ? 'bg-red-500' : 'bg-white'
                    }`}
                  >
                    {isRedStart && <span className="text-white text-[10px] font-bold">→</span>}
                    {isStar && <Star size={12} className="text-amber-500 fill-amber-400" />}
                    {renderCellTokens(r, c, tokensByCell, turn, hasRolled, moveableIndices, diceRoll, moveToken)}
                  </div>
                );
              })}
            </div>

            {/* Center Home Triangle (Rows 6-8, Cols 6-8) */}
            <div className="col-span-3 row-span-3 relative bg-slate-900 border-2 border-slate-700 overflow-hidden">
              {/* 4 Center Triangles */}
              <div className="absolute inset-0 w-0 h-0 border-l-[40px] border-l-red-500 border-y-[40px] border-y-transparent border-r-0 top-0 left-0 bottom-0" />
              <div className="absolute inset-0 w-0 h-0 border-t-[40px] border-t-green-500 border-x-[40px] border-x-transparent border-b-0 top-0 left-0 right-0" />
              <div className="absolute inset-0 w-0 h-0 border-r-[40px] border-r-amber-500 border-y-[40px] border-y-transparent border-l-0 top-0 right-0 bottom-0" />
              <div className="absolute inset-0 w-0 h-0 border-b-[40px] border-b-blue-500 border-x-[40px] border-x-transparent border-t-0 bottom-0 left-0 right-0" />

              {/* Center Trophy Icon */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-7 h-7 rounded-full bg-slate-950 border border-amber-400/80 flex items-center justify-center shadow-lg">
                  <Trophy size={14} className="text-amber-400" />
                </div>
              </div>
            </div>

            {/* Middle Right: Right Arm (Rows 6-8, Cols 9-14) */}
            <div className="col-span-6 row-span-3 grid grid-cols-6 grid-rows-3 border-l-2 border-slate-700">
              {Array.from({ length: 18 }).map((_, i) => {
                const r = 6 + Math.floor(i / 6);
                const c = 9 + (i % 6);
                const isYellowHomeCol = r === 7 && c <= 13;
                const isYellowStart = r === 8 && c === 13;
                const isStar = r === 6 && c === 12;

                return (
                  <div
                    key={i}
                    className={`border border-slate-300 relative flex items-center justify-center ${
                      isYellowHomeCol ? 'bg-amber-500' : isYellowStart ? 'bg-amber-500' : 'bg-white'
                    }`}
                  >
                    {isYellowStart && <span className="text-white text-[10px] font-bold">←</span>}
                    {isStar && <Star size={12} className="text-amber-500 fill-amber-400" />}
                    {renderCellTokens(r, c, tokensByCell, turn, hasRolled, moveableIndices, diceRoll, moveToken)}
                  </div>
                );
              })}
            </div>

            {/* Bottom-Left: BLUE Home Yard (Rows 9-14, Cols 0-5) */}
            <div className="col-span-6 row-span-6 bg-[#3B82F6] p-3 rounded-bl-xl flex items-center justify-center relative">
              <div className="w-full h-full bg-white rounded-xl border-2 border-blue-700 flex flex-col items-center justify-around p-2 shadow-inner">
                <span className="text-[10px] font-bold font-mono text-blue-600 tracking-wider">BLUE YARD</span>
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((tIdx) => (
                    <div key={tIdx} className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center shadow-md">
                      {tokens.blue[tIdx] === -1 && (
                        <LudoPin
                          color="blue"
                          isSelectable={turn === 'blue' && hasRolled && moveableIndices.includes(tIdx)}
                          onClick={() => moveToken('blue', tIdx, diceRoll)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Center: Bottom Arm (Rows 9-14, Cols 6-8) */}
            <div className="col-span-3 row-span-6 grid grid-cols-3 grid-rows-6 border-t-2 border-slate-700">
              {Array.from({ length: 18 }).map((_, i) => {
                const r = 9 + Math.floor(i / 3);
                const c = 6 + (i % 3);
                const isBlueHomeCol = c === 7 && r <= 13;
                const isBlueStart = r === 13 && c === 6;
                const isStar = r === 12 && c === 8;

                return (
                  <div
                    key={i}
                    className={`border border-slate-300 relative flex items-center justify-center ${
                      isBlueHomeCol ? 'bg-blue-500' : isBlueStart ? 'bg-blue-500' : 'bg-white'
                    }`}
                  >
                    {isBlueStart && <span className="text-white text-[10px] font-bold">↑</span>}
                    {isStar && <Star size={12} className="text-amber-500 fill-amber-400" />}
                    {renderCellTokens(r, c, tokensByCell, turn, hasRolled, moveableIndices, diceRoll, moveToken)}
                  </div>
                );
              })}
            </div>

            {/* Bottom-Right: YELLOW Home Yard (Rows 9-14, Cols 9-14) */}
            <div className="col-span-6 row-span-6 bg-[#EAB308] p-3 rounded-br-xl flex items-center justify-center relative">
              <div className="w-full h-full bg-white rounded-xl border-2 border-amber-700 flex flex-col items-center justify-around p-2 shadow-inner">
                <span className="text-[10px] font-bold font-mono text-amber-600 tracking-wider">YELLOW YARD</span>
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((tIdx) => (
                    <div key={tIdx} className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center shadow-md">
                      {tokens.yellow[tIdx] === -1 && (
                        <LudoPin
                          color="yellow"
                          isSelectable={turn === 'yellow' && hasRolled && moveableIndices.includes(tIdx)}
                          onClick={() => moveToken('yellow', tIdx, diceRoll)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Controls & Roll Area */}
          <div className="w-full flex items-center justify-between gap-4 pt-2">
            
            {/* Player Info Card */}
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl border-2 ${COLOR_CONFIG[turn].border} ${COLOR_CONFIG[turn].bg}/20 flex items-center gap-2`}>
                {turn === 'red' ? <User className="text-red-400" size={18} /> : <Bot className="text-green-400" size={18} />}
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold font-mono text-white">
                    {turn === 'red' ? 'YOUR TURN' : `${COLOR_CONFIG[turn].name.split(' ')[0]}'S TURN`}
                  </span>
                  <span className="text-[9px] font-mono text-cyan-300">
                    {hasRolled ? 'Tap Pin To Move' : 'Roll Dice'}
                  </span>
                </div>
              </div>
            </div>

            {/* Dice Roller Button */}
            <motion.button
              whileHover={{ scale: turn === 'red' && !hasRolled && !isRolling ? 1.05 : 1 }}
              whileTap={{ scale: turn === 'red' && !hasRolled && !isRolling ? 0.95 : 1 }}
              onClick={rollDice}
              disabled={turn !== 'red' || hasRolled || isRolling || winner !== null}
              className={`px-5 py-2.5 rounded-2xl border-2 flex items-center gap-3 font-mono transition-all shadow-lg cursor-pointer ${
                turn === 'red' && !hasRolled
                  ? 'bg-gradient-to-r from-red-600 to-rose-700 border-red-400 text-white shadow-red-500/30'
                  : 'bg-slate-900 border-slate-700 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              <motion.div
                animate={isRolling ? { rotate: [0, 90, 180, 270, 360] } : {}}
                transition={{ duration: 0.15, repeat: Infinity, ease: 'linear' }}
              >
                <DiceIcon size={28} className={turn === 'red' ? 'text-white' : 'text-slate-400'} />
              </motion.div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isRolling ? 'ROLLING...' : turn === 'red' ? (hasRolled ? `ROLLED ${diceRoll}` : 'ROLL DICE') : 'WAITING...'}
                </span>
                <span className="text-[9px] opacity-80 font-mono">
                  {turn === 'red' && !hasRolled ? 'TAP HERE' : `VALUE: ${diceRoll}`}
                </span>
              </div>
            </motion.button>
          </div>

        </div>

        {/* Winner Modal */}
        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
            >
              <Sparkles size={56} className="text-amber-400 animate-spin mb-2" />
              <Trophy size={64} className="text-amber-400 mb-4 animate-bounce" />
              <h3 className="text-2xl font-black font-mono text-white uppercase tracking-widest mb-2">
                {winner === 'red' ? 'VICTORY! YOU WON!' : `${COLOR_CONFIG[winner].name.toUpperCase()} WON!`}
              </h3>
              <p className="text-sm font-mono text-cyan-200 mb-6 max-w-xs">
                {winner === 'red'
                  ? 'Awesome strategy, Krish! You dominated the Ludo board!'
                  : 'Shree played brilliantly! Better luck next time!'}
              </p>

              <button
                onClick={resetGame}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 border border-cyan-300 text-white font-mono font-bold uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                Play Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}

// Render Pin Component
function LudoPin({
  color,
  isSelectable,
  onClick,
}: {
  key?: string | number;
  color: Color;
  isSelectable?: boolean;
  onClick?: () => void;
}) {
  const pinStyles: Record<Color, string> = {
    red:    'bg-red-600 border-white text-white shadow-red-500/80',
    green:  'bg-green-600 border-white text-white shadow-green-500/80',
    yellow: 'bg-amber-500 border-white text-white shadow-amber-500/80',
    blue:   'bg-blue-600 border-white text-white shadow-blue-500/80',
  };

  const arrowStyles: Record<Color, string> = {
    red:    'border-t-red-600',
    green:  'border-t-green-600',
    yellow: 'border-t-amber-500',
    blue:   'border-t-blue-600',
  };

  return (
    <motion.button
      whileHover={isSelectable ? { scale: 1.3 } : undefined}
      whileTap={isSelectable ? { scale: 0.9 } : undefined}
      onClick={onClick}
      disabled={!isSelectable}
      className={`relative flex flex-col items-center justify-center cursor-pointer transition-transform ${
        isSelectable ? 'animate-bounce z-30 ring-2 ring-amber-300 rounded-full scale-110' : ''
      }`}
    >
      <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 ${pinStyles[color]} flex items-center justify-center shadow-lg relative`}>
        <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
      </div>
      <div className={`w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[5px] -mt-[1px] ${arrowStyles[color]}`} />
    </motion.button>
  );
}

// Helper function to render tokens inside board grid cells
function renderCellTokens(
  r: number,
  c: number,
  tokensByCell: Record<string, { color: Color; idx: number }[]>,
  turn: Color,
  hasRolled: boolean,
  moveableIndices: number[],
  diceRoll: number,
  moveToken: (color: Color, idx: number, val: number) => void
) {
  const cellKey = `${r}-${c}`;
  const cellTokens = tokensByCell[cellKey];
  if (!cellTokens || cellTokens.length === 0) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center p-0.5 gap-0.5 flex-wrap z-20">
      {cellTokens.map(({ color, idx }) => {
        const isSelectable = turn === color && hasRolled && moveableIndices.includes(idx);
        return (
          <LudoPin
            key={`${color}-${idx}`}
            color={color}
            isSelectable={isSelectable}
            onClick={() => isSelectable && moveToken(color, idx, diceRoll)}
          />
        );
      })}
    </div>
  );
}
