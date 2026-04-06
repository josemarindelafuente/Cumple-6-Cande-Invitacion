/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cat, Dog, PartyPopper, Calendar, Clock, MapPin, ChevronRight, RotateCcw, Heart, Star, Sun, Moon, Menu, X, Home, Gift, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { QUESTIONS, EVENT_INFO, Question } from './constants';

type GameType = 'syllables' | 'letters' | 'days';
type GameState = 'welcome' | 'playing' | 'celebration' | 'invitation';
type Theme = 'light' | 'dark';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const DAYS_OF_WEEK = [
  { es: 'LUNES', en: 'MONDAY' },
  { es: 'MARTES', en: 'TUESDAY' },
  { es: 'MIÉRCOLES', en: 'WEDNESDAY' },
  { es: 'JUEVES', en: 'THURSDAY' },
  { es: 'VIERNES', en: 'FRIDAY' },
  { es: 'SÁBADO', en: 'SATURDAY' },
  { es: 'DOMINGO', en: 'SUNDAY' },
];

export default function App() {
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [gameType, setGameType] = useState<GameType>('syllables');
  const [theme, setTheme] = useState<Theme>('light');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGamesUnlocked, setIsGamesUnlocked] = useState(false);
  const [showLockedMessage, setShowLockedMessage] = useState(false);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('cande_app_player_name') || '');

  useEffect(() => {
    localStorage.setItem('cande_app_player_name', playerName);
  }, [playerName]);
  
  // Syllable Game State
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedSyllables, setSelectedSyllables] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [shuffledSyllables, setShuffledSyllables] = useState<string[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  // Letter Hunt State
  const [targetLetter, setTargetLetter] = useState('');
  const [letterGrid, setLetterGrid] = useState<string[]>([]);
  const [foundIndices, setFoundIndices] = useState<number[]>([]);
  const [letterRounds, setLetterRounds] = useState(0);

  // Days Game State
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [dayOptions, setDayOptions] = useState<string[]>([]);
  const [shuffledDays, setShuffledDays] = useState<typeof DAYS_OF_WEEK>([]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const startGame = () => {
    setIsCorrect(null);
    setScore(0);
    if (gameType === 'syllables') {
      setShuffledQuestions(shuffleArray(QUESTIONS));
      setCurrentQuestionIndex(0);
    } else if (gameType === 'letters') {
      startLetterRound(0);
    } else {
      const shuffled = shuffleArray(DAYS_OF_WEEK);
      setShuffledDays(shuffled);
      startDayRound(0, shuffled);
    }
    setGameState('playing');
  };

  const startDayRound = (index: number, days: typeof DAYS_OF_WEEK) => {
    setIsCorrect(null);
    setCurrentDayIndex(index);
    const correct = days[index].en;
    const others = DAYS_OF_WEEK.filter(d => d.en !== correct).map(d => d.en);
    const selectedOthers = shuffleArray(others).slice(0, 3);
    setDayOptions(shuffleArray([correct, ...selectedOthers]));
  };

  const handleDayOptionClick = (option: string) => {
    if (isCorrect) return;
    if (option === shuffledDays[currentDayIndex].en) {
      handleSuccess();
      setTimeout(() => {
        if (currentDayIndex < shuffledDays.length - 1) {
          startDayRound(currentDayIndex + 1, shuffledDays);
        } else {
          setGameState('celebration');
        }
      }, 1500);
    } else {
      handleFailure();
    }
  };

  const startLetterRound = (round: number) => {
    setIsCorrect(null);
    const target = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    setTargetLetter(target);
    setLetterRounds(round);
    setFoundIndices([]);
    
    const grid: string[] = [];
    // Add 4 target letters
    for (let i = 0; i < 4; i++) grid.push(target);
    // Add 12 random other letters
    while (grid.length < 16) {
      const randomLetter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      if (randomLetter !== target) grid.push(randomLetter);
    }
    setLetterGrid(shuffleArray(grid));
  };

  const handleLetterClick = (index: number, letter: string) => {
    if (letter === targetLetter && !foundIndices.includes(index)) {
      const newFound = [...foundIndices, index];
      setFoundIndices(newFound);
      
      // Play small pop sound or effect
      if (newFound.length === 4) {
        handleSuccess();
        setTimeout(() => {
          if (letterRounds < 4) {
            startLetterRound(letterRounds + 1);
          } else {
            setGameState('celebration');
          }
        }, 1500);
      }
    } else if (letter !== targetLetter) {
      handleFailure();
    }
  };

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  useEffect(() => {
    if (currentQuestion?.type === 'syllables' && currentQuestion.syllables) {
      setShuffledSyllables(shuffleArray(currentQuestion.syllables));
    }
    if (currentQuestion?.options) {
      setShuffledOptions(shuffleArray(currentQuestion.options));
    }
    setSelectedSyllables([]);
    setIsCorrect(null);
  }, [currentQuestionIndex, currentQuestion]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSyllableClick = (syllable: string) => {
    if (isCorrect) return;
    const newSelected = [...selectedSyllables, syllable];
    setSelectedSyllables(newSelected);

    if (currentQuestion.correctOrder && newSelected.length === currentQuestion.correctOrder.length) {
      const isWin = newSelected.every((val, index) => val === currentQuestion.correctOrder![index]);
      if (isWin) {
        handleSuccess();
      } else {
        handleFailure();
      }
    }
  };

  const handleOptionClick = (option: string) => {
    if (isCorrect) return;
    if (option === currentQuestion.answer) {
      handleSuccess();
    } else {
      handleFailure();
    }
  };

  const handleSuccess = () => {
    setIsCorrect(true);
    setScore(s => s + 1);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: theme === 'light' ? ['#D81B60', '#1976D2', '#FBC02D'] : ['#FF4081', '#40C4FF', '#FFD740']
    });
    
    if (gameType === 'syllables') {
      setTimeout(() => {
        if (currentQuestionIndex < shuffledQuestions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          setIsGamesUnlocked(true);
          setGameState('celebration');
        }
      }, 1500);
    }
  };

  const handleFailure = () => {
    setIsCorrect(false);
    setTimeout(() => {
      setSelectedSyllables([]);
      setIsCorrect(null);
    }, 1000);
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameState('welcome');
  };

  return (
    <div className={`${theme === 'light' ? 'light-theme' : 'dark-theme'} min-h-screen`}>
      <header className={`fixed top-0 left-0 right-0 z-50 h-16 sm:h-20 flex items-center justify-between px-4 sm:px-8 backdrop-blur-lg border-b transition-all duration-300 ${
        theme === 'light' 
          ? 'bg-white/80 border-brand-pink/10 shadow-sm' 
          : 'bg-slate-900/80 border-white/5 shadow-xl'
      }`}>
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 10 }}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 ${
              theme === 'light' ? 'bg-brand-pink text-white' : 'bg-dark-pink text-white'
            }`}
          >
            <Dog size={24} className="sm:hidden" />
            <Dog size={28} className="hidden sm:block" />
          </motion.div>
          <div className="flex flex-col -space-y-1">
            <span className={`font-display font-black text-lg sm:text-2xl tracking-tight ${
              theme === 'light' ? 'text-slate-800' : 'text-white'
            }`}>
              Cande <span className={theme === 'light' ? 'text-brand-pink' : 'text-dark-pink'}>APP</span>
            </span>
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] opacity-50 ${
              theme === 'light' ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Invitación de Cumple
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2.5 sm:p-3 rounded-2xl transition-all active:scale-90 border shadow-md z-[60] relative ${
                theme === 'light' 
                  ? 'bg-white border-slate-200 text-slate-700 hover:border-brand-pink/30' 
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:border-dark-pink/30'
              }`}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <AnimatePresence>
              {isMenuOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="fixed inset-0 backdrop-blur-[2px] z-40"
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    className={`absolute top-full right-0 mt-4 w-72 rounded-[2.5rem] shadow-2xl border overflow-hidden z-50 p-3 ${
                      theme === 'light' ? 'bg-white border-slate-100' : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <div className="px-5 py-4 mb-2">
                      <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-50 ${
                        theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        Menú Principal
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <button
                        onClick={() => { setGameType('syllables'); setIsMenuOpen(false); setGameState('welcome'); }}
                        className={`w-full px-5 py-4 text-left rounded-2xl transition-all flex items-center gap-4 ${
                          theme === 'light' ? 'hover:bg-slate-50 text-slate-600' : 'hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'light' ? 'bg-slate-100 text-slate-500' : 'bg-slate-700 text-slate-400'}`}>
                          <Home size={20} />
                        </div>
                        <span className="font-bold text-sm">Inicio</span>
                      </button>

                      <div className={`h-px mx-4 my-2 ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700'}`} />

                      <p className={`px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-50 ${
                        theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        Cambiar Juego
                      </p>

                      <button
                        onClick={() => { setGameType('syllables'); setIsMenuOpen(false); setGameState('welcome'); }}
                        className={`w-full px-5 py-4 text-left rounded-2xl transition-all flex items-center gap-4 ${
                          gameType === 'syllables' 
                            ? (theme === 'light' ? 'bg-brand-pink text-white shadow-lg shadow-brand-pink/20' : 'bg-dark-pink text-white shadow-lg shadow-dark-pink/30')
                            : (theme === 'light' ? 'hover:bg-slate-50 text-slate-600' : 'hover:bg-slate-700 text-slate-300')
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gameType === 'syllables' ? 'bg-white/20' : (theme === 'light' ? 'bg-brand-pink/10 text-brand-pink' : 'bg-dark-pink/10 text-dark-pink')}`}>
                          <Cat size={20} />
                        </div>
                        <span className="font-bold text-sm">Juego de Sílabas de 1ero</span>
                      </button>
                      
                      <button
                        onClick={() => { 
                          if (isGamesUnlocked) {
                            setGameType('letters'); setIsMenuOpen(false); setGameState('welcome'); 
                          } else {
                            setShowLockedMessage(true);
                            setTimeout(() => setShowLockedMessage(false), 3000);
                          }
                        }}
                        className={`w-full px-5 py-4 text-left rounded-2xl transition-all flex items-center gap-4 mb-1 ${
                          gameType === 'letters' 
                            ? (theme === 'light' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'bg-dark-blue text-white shadow-lg shadow-dark-blue/30')
                            : (theme === 'light' ? 'hover:bg-slate-50 text-slate-600' : 'hover:bg-slate-700 text-slate-300')
                        } ${!isGamesUnlocked ? 'opacity-60' : ''}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gameType === 'letters' ? 'bg-white/20' : (theme === 'light' ? 'bg-brand-blue/10 text-brand-blue' : 'bg-dark-blue/10 text-dark-blue')}`}>
                          {isGamesUnlocked ? <Dog size={20} /> : <Lock size={20} />}
                        </div>
                        <span className="font-bold text-sm">Caza de Letras</span>
                      </button>

                      <button
                        onClick={() => { 
                          if (isGamesUnlocked) {
                            setGameType('days'); setIsMenuOpen(false); setGameState('welcome'); 
                          } else {
                            setShowLockedMessage(true);
                            setTimeout(() => setShowLockedMessage(false), 3000);
                          }
                        }}
                        className={`w-full px-5 py-4 text-left rounded-2xl transition-all flex items-center gap-4 ${
                          gameType === 'days' 
                            ? (theme === 'light' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'bg-dark-blue text-white shadow-lg shadow-dark-blue/30')
                            : (theme === 'light' ? 'hover:bg-slate-50 text-slate-600' : 'hover:bg-slate-700 text-slate-300')
                        } ${!isGamesUnlocked ? 'opacity-60' : ''}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gameType === 'days' ? 'bg-white/20' : (theme === 'light' ? 'bg-brand-blue/10 text-brand-blue' : 'bg-dark-blue/10 text-dark-blue')}`}>
                          {isGamesUnlocked ? <Calendar size={20} /> : <Lock size={20} />}
                        </div>
                        <span className="font-bold text-sm">Días en Inglés</span>
                      </button>

                      <div className={`h-px mx-4 my-2 ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700'}`} />

                      <button
                        onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
                        className={`w-full px-5 py-4 text-left rounded-2xl transition-all flex items-center gap-4 ${
                          theme === 'light' ? 'hover:bg-slate-50 text-slate-600' : 'hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'light' ? 'bg-slate-100 text-slate-500' : 'bg-slate-700 text-slate-400'}`}>
                          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </div>
                        <span className="font-bold text-sm">Modo {theme === 'light' ? 'Oscuro' : 'Claro'}</span>
                      </button>
                    </div>

                    <AnimatePresence>
                      {showLockedMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className={`absolute bottom-full left-0 right-0 mb-4 mx-3 p-4 rounded-2xl text-center text-xs font-bold shadow-xl ${
                            theme === 'light' ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'
                          }`}
                        >
                          ¡Termina el Juego de Sílabas para desbloquear los otros juegos!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-24 pb-12 sm:pt-32 sm:pb-16 min-h-screen flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {gameState === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: -20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="game-card text-center space-y-8"
              >
              <div className="flex justify-center gap-6 mb-2">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0], y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                >
                  <Cat size={72} className={theme === 'light' ? 'text-brand-pink' : 'text-dark-pink'} />
                </motion.div>
                <motion.div
                  animate={{ rotate: [0, -15, 15, 0], y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
                >
                  <Dog size={72} className={theme === 'light' ? 'text-brand-blue' : 'text-dark-blue'} />
                </motion.div>
              </div>
              <div className="space-y-4">
                <div className={`text-sm font-black uppercase tracking-[0.3em] ${theme === 'light' ? 'text-brand-blue' : 'text-dark-blue'}`}>
                  BIENVENIDOS A
                </div>
                <h1 className={`font-display text-5xl sm:text-7xl leading-tight px-2 drop-shadow-sm ${theme === 'light' ? 'text-brand-pink' : 'text-dark-pink'}`}>
                  {gameType === 'syllables' ? 'Cande APP' : (gameType === 'letters' ? 'Caza de Letras' : 'Days of the Week')}
                </h1>
                <p className={`text-xl sm:text-2xl font-medium px-4 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                  {gameType === 'syllables' 
                    ? '¡Juega y descubre mi invitación de cumple!' 
                    : (gameType === 'letters' ? '¡Encuentra todas las letras mayúsculas!' : '¡Aprende los días de la semana en inglés!')}
                </p>
              </div>

              <div className="space-y-4 max-w-xs mx-auto w-full">
                {!localStorage.getItem('cande_app_player_name') && (
                  <>
                    <label className={`text-sm font-black uppercase tracking-widest ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                      ¿Cómo te llamas?
                    </label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Tu nombre aquí..."
                      className={`w-full px-6 py-4 rounded-2xl text-center font-bold text-xl border-2 transition-all outline-none ${
                        theme === 'light' 
                          ? 'bg-white border-slate-100 focus:border-brand-pink text-slate-800' 
                          : 'bg-slate-800 border-slate-700 focus:border-dark-pink text-white'
                      }`}
                    />
                  </>
                )}
                {localStorage.getItem('cande_app_player_name') && (
                  <p className={`text-2xl font-display ${theme === 'light' ? 'text-brand-pink' : 'text-dark-pink'}`}>
                    ¡Hola de nuevo, {playerName}!
                  </p>
                )}
              </div>

            <button
              onClick={startGame}
              disabled={!playerName.trim()}
              className={`font-display text-2xl sm:text-3xl px-12 py-5 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto ${
                !playerName.trim() ? 'opacity-50 grayscale cursor-not-allowed' : ''
              } ${
                theme === 'light' ? 'bg-brand-pink text-white hover:bg-brand-pink/90' : 'bg-dark-pink text-white hover:bg-dark-pink/90'
              }`}
            >
              ¡Empezar a Jugar! <ChevronRight size={32} />
            </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 1.05 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full space-y-6"
            >
              <div className="w-full space-y-3 px-2">
                <div className="flex justify-between items-end">
                  <div className={`px-4 py-1.5 rounded-2xl shadow-sm border font-bold text-xs sm:text-sm ${
                    theme === 'light' ? 'bg-white border-brand-pink/20 text-brand-pink' : 'bg-slate-800 border-dark-pink/20 text-dark-pink'
                  }`}>
                    {gameType === 'syllables' 
                      ? `Pregunta ${currentQuestionIndex + 1} de ${shuffledQuestions.length || 1}`
                      : (gameType === 'letters' ? `Ronda ${letterRounds + 1} de 5` : `Día ${currentDayIndex + 1} de 7`)}
                  </div>
                  <div className={`text-xs font-black uppercase tracking-widest ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {gameType === 'syllables'
                      ? `${Math.round(((currentQuestionIndex) / (shuffledQuestions.length || 1)) * 100)}% Completado`
                      : (gameType === 'letters' ? `${Math.round((letterRounds / 5) * 100)}% Completado` : `${Math.round((currentDayIndex / 7) * 100)}% Completado`)}
                  </div>
                </div>
                <div className={`h-3 w-full rounded-full overflow-hidden p-0.5 border ${theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: gameType === 'syllables' 
                      ? `${((currentQuestionIndex + 1) / (shuffledQuestions.length || 1)) * 100}%`
                      : (gameType === 'letters' ? `${((letterRounds + 1) / 5) * 100}%` : `${((currentDayIndex + 1) / 7) * 100}%`)
                    }}
                    className={`h-full rounded-full ${theme === 'light' ? 'bg-brand-pink shadow-[0_0_10px_rgba(216,27,96,0.3)]' : 'bg-dark-pink shadow-[0_0_10px_rgba(255,64,129,0.5)]'}`}
                  />
                </div>
              </div>

              <div className="game-card space-y-8 sm:space-y-10 relative overflow-hidden min-h-[480px] flex flex-col justify-center shadow-2xl">
                {isCorrect === true && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`absolute inset-0 flex flex-col items-center justify-center z-10 ${
                      theme === 'light' ? 'bg-green-50/95' : 'bg-green-900/95'
                    }`}
                  >
                    <Star size={96} className="text-yellow-400 fill-yellow-400 mb-4 animate-bounce" />
                    <span className={`font-display text-4xl ${theme === 'light' ? 'text-green-600' : 'text-green-300'}`}>¡Muy bien!</span>
                  </motion.div>
                )}

                {isCorrect === false && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`absolute inset-0 flex flex-col items-center justify-center z-10 ${
                      theme === 'light' ? 'bg-red-50/95' : 'bg-red-900/95'
                    }`}
                  >
                    <RotateCcw size={96} className="text-red-400 mb-4 animate-spin-slow" />
                    <span className={`font-display text-4xl ${theme === 'light' ? 'text-red-600' : 'text-red-300'}`}>¡Intenta de nuevo!</span>
                  </motion.div>
                )}

                {gameType === 'syllables' && currentQuestion ? (
                  <>
                    <h2 className={`text-2xl sm:text-4xl font-display text-center px-4 leading-tight ${
                      theme === 'light' ? 'text-slate-800' : 'text-white'
                    }`}>
                      {currentQuestion.text}
                    </h2>

                    {currentQuestion.type === 'syllables' && (
                      <div className="space-y-10">
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 min-h-[60px]">
                          {Array.from({ length: currentQuestion.correctOrder?.length || 0 }).map((_, i) => (
                            <div key={i} className="answer-slot">
                              {selectedSyllables[i] || ""}
                            </div>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {shuffledSyllables.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => handleSyllableClick(s)}
                              disabled={selectedSyllables.includes(s) && currentQuestion.syllables?.filter(x => x === s).length === 1}
                              className={`syllable-btn ${
                                selectedSyllables.includes(s) ? 'opacity-20 scale-90' : ''
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'number' || currentQuestion.type === 'colors') && (
                      <div className="flex flex-col gap-4 sm:gap-5 max-w-md mx-auto w-full">
                        {shuffledOptions.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleOptionClick(opt)}
                            className="option-btn"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : gameType === 'letters' ? (
                  <div className="space-y-8">
                    <div className="text-center space-y-2">
                      <p className={`text-lg font-bold uppercase tracking-widest ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Encuentra la letra
                      </p>
                      <div className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl font-display text-6xl shadow-xl border-4 ${
                        theme === 'light' ? 'bg-brand-pink text-white border-white' : 'bg-dark-pink text-white border-slate-700'
                      }`}>
                        {targetLetter}
                      </div>
                      <p className={`text-sm font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Faltan: {4 - foundIndices.length}
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-sm mx-auto">
                      {letterGrid.map((letter, i) => (
                        <button
                          key={i}
                          onClick={() => handleLetterClick(i, letter)}
                          className={`aspect-square rounded-2xl font-display text-2xl sm:text-3xl transition-all transform active:scale-90 border-2 flex items-center justify-center shadow-md ${
                            foundIndices.includes(i)
                              ? (theme === 'light' ? 'bg-brand-pink text-white border-brand-pink scale-95 opacity-50' : 'bg-dark-pink text-white border-dark-pink scale-95 opacity-50')
                              : (theme === 'light' ? 'bg-white text-slate-700 border-slate-100 hover:border-brand-pink/30' : 'bg-slate-700 text-white border-slate-600 hover:border-dark-pink/30')
                          }`}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-10">
                    <div className="text-center space-y-4">
                      <p className={`text-lg font-bold uppercase tracking-widest ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                        ¿Cómo se dice en inglés?
                      </p>
                      <div className={`inline-block px-8 py-4 rounded-3xl font-display text-4xl sm:text-5xl shadow-xl border-b-8 ${
                        theme === 'light' ? 'bg-brand-blue text-white border-brand-blue/50' : 'bg-dark-blue text-white border-dark-blue/50'
                      }`}>
                        {shuffledDays[currentDayIndex]?.es}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto w-full">
                      {dayOptions.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleDayOptionClick(opt)}
                          className="option-btn"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {gameState === 'celebration' && (
            <motion.div
              key="celebration"
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ type: 'spring', damping: 15 }}
              className="game-card text-center space-y-8"
            >
              <PartyPopper size={96} className={`mx-auto ${theme === 'light' ? 'text-brand-pink' : 'text-dark-pink'}`} />
              <h2 className={`font-display text-4xl sm:text-6xl ${theme === 'light' ? 'text-brand-pink' : 'text-dark-pink'}`}>¡Lo lograste, {playerName}!</h2>
              <p className={`text-xl sm:text-2xl px-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                {gameType === 'syllables' 
                  ? 'Respondiste todas las preguntas correctamente. ¡Has desbloqueado 2 juegos más!' 
                  : (gameType === 'letters' ? '¡Encontraste todas las letras!' : '¡Aprendiste los días de la semana en inglés!')}
                <br />
                ¡Eres un genio del cole!
              </p>
              <p className={`text-lg sm:text-xl font-bold ${theme === 'light' ? 'text-brand-blue' : 'text-dark-blue'}`}>
                Ahora sí, aquí tienes toda la información de mi cumple:
              </p>
              <button
                onClick={() => setGameState('invitation')}
                className={`font-display text-2xl sm:text-3xl px-12 py-5 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto ${
                  theme === 'light' ? 'bg-brand-blue text-white hover:bg-brand-blue/90' : 'bg-dark-blue text-white hover:bg-dark-blue/90'
                }`}
              >
                Ver Invitación <ChevronRight size={32} />
              </button>
            </motion.div>
          )}

          {gameState === 'invitation' && (
            <motion.div
              key="invitation"
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ type: 'spring', damping: 20 }}
              className={`w-full max-w-lg rounded-[3rem] shadow-2xl border-8 relative overflow-hidden transition-colors duration-300 ${
                theme === 'light' ? 'bg-white border-brand-pink' : 'bg-slate-800 border-dark-pink'
              }`}
            >
              {/* Background elements */}
              <div className={`absolute top-0 left-0 w-full h-32 -z-0 ${theme === 'light' ? 'bg-brand-pink/10' : 'bg-dark-pink/10'}`} />
              <div className={`absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl ${theme === 'light' ? 'bg-brand-yellow/30' : 'bg-dark-yellow/20'}`} />
              <div className={`absolute -bottom-10 -left-10 w-48 h-48 rounded-full blur-3xl ${theme === 'light' ? 'bg-brand-blue/30' : 'bg-dark-blue/20'}`} />

              <div className="p-8 sm:p-12 space-y-10 relative z-10">
                <div className="text-center space-y-3">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12 }}
                    className={`inline-block px-8 py-2 rounded-full font-display text-xl sm:text-2xl mb-4 text-white ${
                      theme === 'light' ? 'bg-brand-pink' : 'bg-dark-pink'
                    }`}
                  >
                    ¡ESTÁS INVITADO!
                  </motion.div>
                  <h1 className={`font-display text-5xl sm:text-6xl ${theme === 'light' ? 'text-brand-pink' : 'text-dark-pink'}`}>Mis {EVENT_INFO.age} años</h1>
                  <p className={`font-display text-3xl sm:text-4xl ${theme === 'light' ? 'text-brand-blue' : 'text-dark-blue'}`}>{EVENT_INFO.name}</p>
                  <p className={`text-xl font-bold ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                    ¡Te espero, <span className={theme === 'light' ? 'text-brand-pink' : 'text-dark-pink'}>{playerName}</span>!
                  </p>
                </div>

                <div className="space-y-5">
                  <div className={`flex items-center gap-5 p-5 rounded-[2rem] border transition-colors ${
                    theme === 'light' ? 'bg-brand-blue/5 border-brand-blue/20' : 'bg-slate-700/50 border-dark-blue/30'
                  }`}>
                    <div className={`p-4 rounded-2xl text-white shadow-lg ${theme === 'light' ? 'bg-brand-blue' : 'bg-dark-blue'}`}>
                      <Calendar size={28} />
                    </div>
                    <div>
                      <p className={`text-xs uppercase tracking-widest font-black ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>Fecha</p>
                      <p className={`text-2xl font-display ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{EVENT_INFO.date}</p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-5 p-5 rounded-[2rem] border transition-colors ${
                    theme === 'light' ? 'bg-brand-yellow/5 border-brand-yellow/20' : 'bg-slate-700/50 border-dark-yellow/30'
                  }`}>
                    <div className={`p-4 rounded-2xl shadow-lg ${theme === 'light' ? 'bg-brand-yellow text-slate-800' : 'bg-dark-yellow text-slate-900'}`}>
                      <Clock size={28} />
                    </div>
                    <div>
                      <p className={`text-xs uppercase tracking-widest font-black ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>Horario</p>
                      <p className={`text-2xl font-display ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{EVENT_INFO.time}</p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-5 p-5 rounded-[2rem] border transition-colors ${
                    theme === 'light' ? 'bg-brand-pink/5 border-brand-pink/20' : 'bg-slate-700/50 border-dark-pink/30'
                  }`}>
                    <div className={`p-4 rounded-2xl text-white shadow-lg ${theme === 'light' ? 'bg-brand-pink' : 'bg-dark-pink'}`}>
                      <MapPin size={28} />
                    </div>
                    <div>
                      <p className={`text-xs uppercase tracking-widest font-black ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>Lugar</p>
                      <p className={`text-2xl font-display ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{EVENT_INFO.location}</p>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-4 pt-4">
                  <div className="flex justify-center gap-8">
                    <Cat size={56} className={`opacity-90 ${theme === 'light' ? 'text-brand-pink' : 'text-dark-pink'}`} />
                    <Dog size={56} className={`opacity-90 ${theme === 'light' ? 'text-brand-blue' : 'text-dark-blue'}`} />
                  </div>
                  <div className="flex justify-center gap-2">
                    <Heart className={`fill-current ${theme === 'light' ? 'text-brand-pink' : 'text-dark-pink'}`} size={24} />
                    <Heart className={`fill-current ${theme === 'light' ? 'text-brand-pink' : 'text-dark-pink'}`} size={24} />
                    <Heart className={`fill-current ${theme === 'light' ? 'text-brand-pink' : 'text-dark-pink'}`} size={24} />
                  </div>
                </div>

                <div className="space-y-6 pt-4">
                  <p className={`text-lg sm:text-xl font-bold ${theme === 'light' ? 'text-brand-blue' : 'text-dark-blue'}`}>
                    Si completaste todas las preguntas tenemos un premio para vos en el cumple
                  </p>
                  <button
                    onClick={startGame}
                    className={`w-full py-4 border-2 border-dashed rounded-2xl transition-all flex items-center justify-center gap-3 text-base font-bold ${
                      theme === 'light' ? 'border-slate-200 text-slate-400 hover:text-brand-pink hover:border-brand-pink' : 'border-slate-600 text-slate-500 hover:text-dark-pink hover:border-dark-pink'
                    }`}
                  >
                    <RotateCcw size={20} /> Volver a jugar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer / Decorative */}
        <div className="mt-12 flex gap-6 opacity-20 pointer-events-none">
          <Cat size={32} className={theme === 'light' ? 'text-brand-pink' : 'text-dark-pink'} />
          <Dog size={32} className={theme === 'light' ? 'text-brand-blue' : 'text-dark-blue'} />
          <Cat size={32} className={theme === 'light' ? 'text-brand-pink' : 'text-dark-pink'} />
          <Dog size={32} className={theme === 'light' ? 'text-brand-blue' : 'text-dark-blue'} />
        </div>
      </div>
    </div>
  );
}
