/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cat, Dog, PartyPopper, Calendar, Clock, MapPin, ChevronRight, RotateCcw, Heart, Star, Sun, Moon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { QUESTIONS, EVENT_INFO, Question } from './constants';

type GameState = 'welcome' | 'playing' | 'celebration' | 'invitation';
type Theme = 'light' | 'dark';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [theme, setTheme] = useState<Theme>('light');
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedSyllables, setSelectedSyllables] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [shuffledSyllables, setShuffledSyllables] = useState<string[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const startGame = () => {
    setShuffledQuestions(shuffleArray(QUESTIONS));
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameState('playing');
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
    
    setTimeout(() => {
      if (currentQuestionIndex < shuffledQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setGameState('celebration');
      }
    }, 1500);
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

        <button 
          onClick={toggleTheme}
          className={`group relative p-2.5 sm:p-3 rounded-2xl transition-all active:scale-90 border shadow-md overflow-hidden ${
            theme === 'light' 
              ? 'bg-white border-slate-200 text-brand-pink hover:border-brand-pink/30' 
              : 'bg-slate-800 border-slate-700 text-dark-pink hover:border-dark-pink/30'
          }`}
        >
          <div className="relative z-10 flex items-center gap-2">
            {theme === 'light' ? (
              <>
                <Moon size={20} className="sm:w-6 sm:h-6" />
                <span className="hidden sm:block font-bold text-sm">Modo Oscuro</span>
              </>
            ) : (
              <>
                <Sun size={20} className="sm:w-6 sm:h-6" />
                <span className="hidden sm:block font-bold text-sm">Modo Claro</span>
              </>
            )}
          </div>
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${
            theme === 'light' ? 'bg-brand-pink' : 'bg-dark-pink'
          }`} />
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-24 pb-12 sm:pt-32 sm:pb-16 min-h-screen flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {gameState === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
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
                  Cande APP
                </h1>
                <p className={`text-xl sm:text-2xl font-medium px-4 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                  ¡Juega y descubre mi invitación de cumple!
                </p>
              </div>
            <button
              onClick={startGame}
              className={`font-display text-2xl sm:text-3xl px-12 py-5 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto ${
                theme === 'light' ? 'bg-brand-pink text-white hover:bg-brand-pink/90' : 'bg-dark-pink text-white hover:bg-dark-pink/90'
              }`}
            >
              ¡Empezar a Jugar! <ChevronRight size={32} />
            </button>
            </motion.div>
          )}

          {gameState === 'playing' && currentQuestion && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full space-y-6"
            >
              <div className="w-full space-y-3 px-2">
                <div className="flex justify-between items-end">
                  <div className={`px-4 py-1.5 rounded-2xl shadow-sm border font-bold text-xs sm:text-sm ${
                    theme === 'light' ? 'bg-white border-brand-pink/20 text-brand-pink' : 'bg-slate-800 border-dark-pink/20 text-dark-pink'
                  }`}>
                    Pregunta {currentQuestionIndex + 1} de {shuffledQuestions.length}
                  </div>
                  <div className={`text-xs font-black uppercase tracking-widest ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {Math.round(((currentQuestionIndex) / shuffledQuestions.length) * 100)}% Completado
                  </div>
                </div>
                <div className={`h-3 w-full rounded-full overflow-hidden p-0.5 border ${theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / shuffledQuestions.length) * 100}%` }}
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
              </div>
            </motion.div>
          )}

          {gameState === 'celebration' && (
            <motion.div
              key="celebration"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="game-card text-center space-y-8"
            >
              <PartyPopper size={96} className={`mx-auto ${theme === 'light' ? 'text-brand-pink' : 'text-dark-pink'}`} />
              <h2 className={`font-display text-4xl sm:text-6xl ${theme === 'light' ? 'text-brand-pink' : 'text-dark-pink'}`}>¡Lo lograste!</h2>
              <p className={`text-xl sm:text-2xl px-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                Respondiste todas las preguntas correctamente. <br />
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
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
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

                <button
                  onClick={startGame}
                  className={`w-full py-4 border-2 border-dashed rounded-2xl transition-all flex items-center justify-center gap-3 text-base font-bold ${
                    theme === 'light' ? 'border-slate-200 text-slate-400 hover:text-brand-pink hover:border-brand-pink' : 'border-slate-600 text-slate-500 hover:text-dark-pink hover:border-dark-pink'
                  }`}
                >
                  <RotateCcw size={20} /> Volver a jugar
                </button>
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
