import React, { useState, useEffect } from 'react';
import { AlertCircle, HelpCircle, BarChart3, RefreshCw, Share2 } from 'lucide-react';

// A small subset of 5-letter words for demonstration.
// In a full production app, this would be a much larger imported list.
const SOLUTIONS = [
  "ALBUM", "AMPLE", "ANGRY", "ASSET", "AWAKE", "BACON", "BAKER", "BASIC", "BEACH", "BEARD",
  "BEGIN", "BELLY", "BELOW", "BENCH", "BLACK", "BLADE", "BLAME", "BLIND", "BLOCK", "BLOOD",
  "BOARD", "BRAIN", "BREAD", "BREAK", "BRING", "BROWN", "BUILD", "BUYER", "CABLE", "CALM",
  "CANDY", "CAUSE", "CHAIN", "CHAIR", "CHART", "CHASE", "CHEST", "CHIEF", "CHILD", "CHINA",
  "CLAIM", "CLASS", "CLEAN", "CLEAR", "CLOCK", "CLOSE", "COACH", "COAST", "COULD", "COUNT",
  "COURT", "COVER", "CRAFT", "CRASH", "CREAM", "CRIME", "CROSS", "CROWD", "CROWN", "CURVE",
  "CYCLE", "DAILY", "DANCE", "DEATH", "DEPTH", "DOUBT", "DRAFT", "DRAMA", "DREAM", "DRESS",
  "DRINK", "DRIVE", "EARLY", "EARTH", "EIGHT", "EMPTY", "ENEMY", "ENJOY", "ENTER", "EQUAL",
  "ERROR", "EVENT", "EVERY", "EXACT", "EXIST", "EXTRA", "FAITH", "FALSE", "FAULT", "FIBER",
  "FIELD", "FIFTH", "FIGHT", "FINAL", "FIRST", "FLAME", "FLESH", "FLOOR", "FOCUS", "FORCE",
  "FRAME", "FRESH", "FRONT", "FRUIT", "GLASS", "GLOBE", "GOING", "GRACE", "GRADE", "GRAND",
  "GRANT", "GRASS", "GREAT", "GREEN", "GROUP", "GUARD", "GUESS", "GUIDE", "HAPPY", "HEART",
  "HEAVY", "HORSE", "HOTEL", "HOUSE", "HUMAN", "IDEAL", "IMAGE", "INDEX", "INNER", "INPUT",
  "ISSUE", "JOINT", "JUDGE", "KNIFE", "LAUGH", "LAYER", "LEARN", "LEASE", "LEAST", "LEAVE",
  "LEGAL", "LEVEL", "LIGHT", "LIMIT", "LOCAL", "LOGIC", "LOOSE", "LOWER", "LUCKY", "LUNCH",
  "MAJOR", "MAKER", "MARCH", "MATCH", "METAL", "MODEL", "MONEY", "MONTH", "MORAL", "MOTOR",
  "MOUNT", "MOUSE", "MOUTH", "MOVIE", "MUSIC", "NEEDS", "NEVER", "NIGHT", "NOISE", "NORTH",
  "NOVEL", "NURSE", "OCCUR", "OFFER", "OFTEN", "ORDER", "OTHER", "OUTER", "PAINT", "PANEL",
  "PAPER", "PARTY", "PEACE", "PHASE", "PHONE", "PHOTO", "PIECE", "PILOT", "PITCH", "PLACE",
  "PLAIN", "PLANE", "PLANT", "PLATE", "POINT", "POUND", "POWER", "PRESS", "PRICE", "PRIDE",
  "PRIME", "PRINT", "PRIOR", "PRIZE", "PROOF", "PROUD", "PROVE", "QUEEN", "QUICK", "QUIET",
  "QUITE", "RADIO", "RAISE", "RANGE", "RAPID", "RATIO", "REACH", "REACT", "READY", "REFER",
  "RIGHT", "RIVER", "ROUGH", "ROUND", "ROUTE", "ROYAL", "RURAL", "SCALE", "SCENE", "SCOPE",
  "SCORE", "SENSE", "SERVE", "SEVEN", "SHAPE", "SHARE", "SHARP", "SHEET", "SHELF", "SHELL",
  "SHIFT", "SHIRT", "SHOCK", "SHOOT", "SHORT", "SIGHT", "SINCE", "SKILL", "SLEEP", "SMALL",
  "SMART", "SMILE", "SMOKE", "SOLID", "SOLVE", "SORRY", "SOUND", "SOUTH", "SPACE", "SPARE",
  "SPEAK", "SPEED", "SPEND", "SPITE", "SPLIT", "SPORT", "STAFF", "STAGE", "STAND", "START",
  "STATE", "STEAM", "STEEL", "STICK", "STILL", "STOCK", "STONE", "STORE", "STORM", "STORY",
  "STRIP", "STUCK", "STUDY", "STUFF", "STYLE", "SUGAR", "TABLE", "TASTE", "TEACH", "THANK",
  "THEME", "THING", "THINK", "THROW", "TIGHT", "TITLE", "TOTAL", "TOUCH", "TOUGH", "TOWER",
  "TRACK", "TRADE", "TRAIN", "TREAT", "TREND", "TRIAL", "TRUST", "TRUTH", "TWICE", "UNCLE",
  "UNDER", "UNION", "UNITY", "UPPER", "URBAN", "USAGE", "VALUE", "VIDEO", "VIRUS", "VISIT",
  "VITAL", "VOICE", "WASTE", "WATCH", "WATER", "WHEEL", "WHERE", "WHICH", "WHILE", "WHITE",
  "WHOLE", "WOMAN", "WORLD", "WORRY", "WORTH", "WOULD", "WRITE", "WRONG", "YIELD", "YOUNG",
  "YOUTH", "ZEBRA"
];

// Use the same list for valid guesses in this simple version
const VALID_GUESSES = [...SOLUTIONS];

// Get today's word based on date
const getDailyWord = () => {
  const epochMs = new Date(2024, 0, 1).valueOf();
  const now = Date.now();
  const msPerDay = 86400000;
  const index = Math.floor((now - epochMs) / msPerDay);
  return SOLUTIONS[index % SOLUTIONS.length];
};

const WORD_LENGTH = 5;
const MAX_TURNS = 6;

function App() {
  const [solution, setSolution] = useState(getDailyWord());
  const [turn, setTurn] = useState(0);
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState([...Array(MAX_TURNS)]); // Array of formatted guess objects
  const [history, setHistory] = useState([]); // Array of string guesses
  const [isGameOver, setIsGameOver] = useState(false);
  const [usedKeys, setUsedKeys] = useState({}); // {a: 'green', b: 'yellow'}
  const [isCorrect, setIsCorrect] = useState(false);
  const [message, setMessage] = useState(null);
  const [shakeRow, setShakeRow] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);

  //-- GAME LOGIC --//

  const formatGuess = () => {
    let solutionArray = [...solution];
    let formattedGuess = [...currentGuess].map((l) => {
      return {key: l, color: 'grey'};
    });

    // Find exact matches (Green)
    formattedGuess.forEach((l, i) => {
      if (solutionArray[i] === l.key) {
        formattedGuess[i].color = 'green';
        solutionArray[i] = null;
      }
    });

    // Find loose matches (Yellow)
    formattedGuess.forEach((l, i) => {
      if (l.color !== 'green' && solutionArray.includes(l.key)) {
        formattedGuess[i].color = 'yellow';
        solutionArray[solutionArray.indexOf(l.key)] = null;
      }
    });

    return formattedGuess;
  }

  const addNewGuess = (formattedGuess) => {
    if (currentGuess === solution) {
      setIsCorrect(true);
      setIsGameOver(true);
      setTimeout(() => setShowStats(true), 1500);
    }

    setGuesses((prevGuesses) => {
      let newGuesses = [...prevGuesses];
      newGuesses[turn] = formattedGuess;
      return newGuesses;
    });

    setHistory((prevHistory) => [...prevHistory, currentGuess]);

    setTurn((prevTurn) => prevTurn + 1);

    setUsedKeys((prevUsedKeys) => {
      let newKeys = {...prevUsedKeys};

      formattedGuess.forEach((l) => {
        const currentColor = newKeys[l.key];

        if (l.color === 'green') {
          newKeys[l.key] = 'green';
          return;
        }
        if (l.color === 'yellow' && currentColor !== 'green') {
          newKeys[l.key] = 'yellow';
          return;
        }
        if (l.color === 'grey' && currentColor !== 'green' && currentColor !== 'yellow') {
          newKeys[l.key] = 'grey';
          return;
        }
      });
      return newKeys;
    });

    setCurrentGuess('');
  }

  const handleKeyup = ({ key }) => {
    if (isGameOver) return;

    if (key === 'Enter') {
      if (turn >= MAX_TURNS) {
        return;
      }
      if (currentGuess.length !== WORD_LENGTH) {
        showMessage("Not enough letters");
        setShakeRow(true);
        setTimeout(() => setShakeRow(false), 500);
        return;
      }
      // In a real app, validate against a massive dictionary here
      // For this demo, we'll just check if it's in our small list to avoid weird inputs,
      // or just allow it if you prefer ease of play. Let's allow it for now to prevent frustration with a small dictionary.
      // if (!VALID_GUESSES.includes(currentGuess)) {
      //    showMessage("Not in word list");
      //    setShakeRow(true);
      //    setTimeout(() => setShakeRow(false), 500);
      //    return;
      // }
      
      if (history.includes(currentGuess)) {
        showMessage("Word already guessed");
        setShakeRow(true);
        setTimeout(() => setShakeRow(false), 500);
        return;
      }

      const formatted = formatGuess();
      addNewGuess(formatted);
    }

    if (key === 'Backspace') {
      setCurrentGuess((prev) => prev.slice(0, -1));
      return;
    }

    if (/^[A-Za-z]$/.test(key)) {
      if (currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((prev) => prev + key.toUpperCase());
      }
    }
  }

  useEffect(() => {
    window.addEventListener('keyup', handleKeyup);

    if (turn === MAX_TURNS && !isCorrect && !isGameOver) {
        setIsGameOver(true);
        setTimeout(() => setShowStats(true), 1500);
    }

    return () => window.removeEventListener('keyup', handleKeyup);
  }, [handleKeyup, isCorrect, turn]);

  const showMessage = (msg, duration = 2000) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), duration);
  }

  //-- UI COMPONENTS --//

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-zinc-100 overflow-hidden font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
        <div className="flex gap-2">
            <button onClick={() => setShowHelp(true)} className="text-zinc-400 hover:text-white transition-colors">
                <HelpCircle size={24} />
            </button>
        </div>
        <h1 className="text-3xl font-bold tracking-wider text-center flex-grow">WORDLE</h1>
        <div className="flex gap-2">
            <button onClick={() => setShowStats(true)} className="text-zinc-400 hover:text-white transition-colors">
                <BarChart3 size={24} />
            </button>
        </div>
      </header>

      {/* Game Message Toast */}
      {message && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50">
              <div className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded font-bold shadow-lg">
                  {message}
              </div>
          </div>
      )}

      {/* Main Board Area */}
      <main className="flex-grow flex items-center justify-center p-4 md:mb-0 mb-4">
        <div className="grid grid-rows-6 gap-[5px] w-full max-w-[350px] aspect-[5/6]">
          {guesses.map((g, i) => {
            if (turn === i) {
              return <CurrentRow key={i} currentGuess={currentGuess} shake={shakeRow} />
            }
            return <CompletedRow key={i} guess={g} />
          })}
        </div>
      </main>

      {/* Keyboard */}
      <div className="w-full max-w-[500px] mx-auto pb-8 px-2">
         <Keyboard usedKeys={usedKeys} onKeyPress={(key) => handleKeyup({key})} />
      </div>

      {/* Modals */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showStats && <StatsModal 
          onClose={() => setShowStats(false)} 
          isCorrect={isCorrect} 
          solution={solution} 
          turn={turn}
          isGameOver={isGameOver}
      />}

    </div>
  );
}

//-- SUB-COMPONENTS --//

function CurrentRow({ currentGuess, shake }) {
  const letters = [...currentGuess];
  const emptyTiles = Array.from({ length: WORD_LENGTH - letters.length });

  return (
    <div className={`grid grid-cols-5 gap-[5px] ${shake ? 'animate-shake' : ''}`}>
      {letters.map((letter, i) => (
        <div key={i} className="w-full h-full border-2 border-zinc-600 flex items-center justify-center text-3xl font-bold uppercase animate-pop">
          {letter}
        </div>
      ))}
      {emptyTiles.map((_, i) => (
        <div key={i + letters.length} className="w-full h-full border-2 border-zinc-800 flex items-center justify-center"></div>
      ))}
    </div>
  )
}

function CompletedRow({ guess }) {
  if (guess) {
    return (
      <div className="grid grid-cols-5 gap-[5px]">
        {guess.map((l, i) => {
            let bgColor = 'bg-zinc-700 border-zinc-700';
            if (l.color === 'green') bgColor = 'bg-emerald-600 border-emerald-600';
            if (l.color === 'yellow') bgColor = 'bg-yellow-600 border-yellow-600';
            
            return (
                <div key={i} className={`w-full h-full flex items-center justify-center text-3xl font-bold uppercase text-white border-2 ${bgColor} animate-flip`} style={{animationDelay: `${i * 0.1}s`}}>
                    {l.key}
                </div>
            )
        })}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-5 gap-[5px]">
      {[...Array(WORD_LENGTH)].map((_, i) => (
        <div key={i} className="w-full h-full border-2 border-zinc-800"></div>
      ))}
    </div>
  )
}

function Keyboard({ usedKeys, onKeyPress }) {
    const rows = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace']
    ];

    return (
        <div className="flex flex-col gap-2">
            {rows.map((row, i) => (
                <div key={i} className="flex justify-center gap-1 md:gap-1.5 touch-manipulation">
                    {row.map(key => {
                        let bgColor = 'bg-zinc-400/30 active:bg-zinc-500';
                        if (usedKeys[key] === 'green') bgColor = 'bg-emerald-600 active:bg-emerald-700 text-white';
                        else if (usedKeys[key] === 'yellow') bgColor = 'bg-yellow-600 active:bg-yellow-700 text-white';
                        else if (usedKeys[key] === 'grey') bgColor = 'bg-zinc-800 active:bg-zinc-900 text-zinc-500';

                        // Adjust width for special keys
                        const widthClass = (key === 'Enter' || key === 'Backspace') ? 'px-4 md:px-6 text-sm md:text-base font-bold' : 'flex-1 md:flex-none md:w-10 font-bold text-lg';

                        return (
                            <button
                                key={key}
                                onClick={() => onKeyPress(key)}
                                className={`${widthClass} h-14 rounded flex items-center justify-center uppercase transition-colors ${bgColor}`}
                            >
                                {key === 'Backspace' ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 96 960 960" width="24" fill="currentColor">
                                    <path d="M360 776l240-240-240-240-84 84 156 156-156 156 84 84zm-242-84 172-368q11-22 29-35t41-13h480q33 0 56.5 23.5T920 360v480q0 33-23.5 56.5T840 920H360q-23 0-41-13t-29-35L118 692z"/>
                                  </svg>
                                ) : key}
                            </button>
                        )
                    })}
                </div>
            ))}
        </div>
    )
}

function ModalOverlay({ children, onClose }) {
    return (
        <div className="fixed inset-0 bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    )
}

function HelpModal({ onClose }) {
    return (
        <ModalOverlay onClose={onClose}>
            <header className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">HOW TO PLAY</h2>
                <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">✕</button>
            </header>
            <div className="space-y-4 text-zinc-300">
                <p>Guess the WORDLE in 6 tries.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Each guess must be a valid 5-letter word.</li>
                    <li>The color of the tiles will change to show how close your guess was to the word.</li>
                </ul>
                <div className="space-y-4 mt-6">
                    <p className="font-bold text-white">Examples</p>
                    
                    <div className="flex gap-1">
                        <div className="w-10 h-10 bg-emerald-600 flex items-center justify-center font-bold text-white text-xl border-2 border-emerald-600">W</div>
                        <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center font-bold text-white text-xl border-2 border-zinc-700">E</div>
                        <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center font-bold text-white text-xl border-2 border-zinc-700">A</div>
                        <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center font-bold text-white text-xl border-2 border-zinc-700">R</div>
                        <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center font-bold text-white text-xl border-2 border-zinc-700">Y</div>
                    </div>
                    <p><strong>W</strong> is in the word and in the correct spot.</p>

                    <div className="flex gap-1">
                        <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center font-bold text-white text-xl border-2 border-zinc-700">P</div>
                        <div className="w-10 h-10 bg-yellow-600 flex items-center justify-center font-bold text-white text-xl border-2 border-yellow-600">I</div>
                        <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center font-bold text-white text-xl border-2 border-zinc-700">L</div>
                        <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center font-bold text-white text-xl border-2 border-zinc-700">L</div>
                        <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center font-bold text-white text-xl border-2 border-zinc-700">S</div>
                    </div>
                    <p><strong>I</strong> is in the word but in the wrong spot.</p>

                    <div className="flex gap-1">
                        <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center font-bold text-white text-xl border-2 border-zinc-700">V</div>
                        <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center font-bold text-white text-xl border-2 border-zinc-700">A</div>
                        <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center font-bold text-white text-xl border-2 border-zinc-700">G</div>
                        <div className="w-10 h-10 bg-zinc-800 flex items-center justify-center font-bold text-white text-xl border-2 border-zinc-800">U</div>
                        <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center font-bold text-white text-xl border-2 border-zinc-700">E</div>
                    </div>
                    <p><strong>U</strong> is not in the word in any spot.</p>
                </div>
            </div>
        </ModalOverlay>
    )
}

function StatsModal({ onClose, isCorrect, isGameOver, solution, turn }) {
    // Simple time until next wordle
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            
            const diff = tomorrow - now;
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <ModalOverlay onClose={onClose}>
            <header className="flex justify-end mb-2">
                <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">✕</button>
            </header>
            
            {!isGameOver && (
                <div className="text-center py-8">
                    <h2 className="text-xl font-bold mb-4">Game in Progress</h2>
                    <p className="text-zinc-400">Finish the game to see today's results!</p>
                </div>
            )}

            {isGameOver && (
                <div className="text-center">
                    {isCorrect ? (
                        <h2 className="text-3xl font-extrabold mb-4 text-emerald-500">Splendid!</h2>
                    ) : (
                        <h2 className="text-3xl font-extrabold mb-4 text-zinc-300">{solution}</h2>
                    )}
                    
                    <div className="flex justify-center gap-8 my-8">
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold">{turn}</span>
                            <span className="text-xs text-zinc-400">GUESSES</span>
                        </div>
                         <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold">1</span>
                            <span className="text-xs text-zinc-400">PLAYED</span>
                        </div>
                    </div>

                    <div className="border-t border-zinc-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-center md:text-left">
                            <h3 className="font-bold uppercase text-sm mb-1">Next Wordle</h3>
                            <p className="text-3xl font-mono">{timeLeft}</p>
                        </div>
                        <button 
                            onClick={() => {
                                // Simple share functionality
                                const text = `Wordle ${isCorrect ? turn : 'X'}/6\nPlayed on my custom Wordle site!`;
                                if (navigator.share) {
                                    navigator.share({ title: 'Wordle', text: text });
                                } else {
                                    navigator.clipboard.writeText(text);
                                    alert('Copied results to clipboard!');
                                }
                            }}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest transition-colors"
                        >
                            Share <Share2 size={20} />
                        </button>
                    </div>

                </div>
            )}
        </ModalOverlay>
    )
}

export default App;

// TAILWIND CONFIG NEEDED FOR ANIMATIONS
// Add this to your tailwind.config.js if you were building locally.
// For this environment, we might need to inject some raw CSS for the specific keyframes 
// since we can't easily edit the tailwind config.
