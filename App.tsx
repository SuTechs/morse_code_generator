import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MorseKeyer } from './components/MorseKeyer';
import { DisplayPanel } from './components/DisplayPanel';
import { ReferenceChart } from './components/ReferenceChart';
import { MORSE_CODE_MAP, REVERSE_MORSE_MAP, INPUT_LETTER_GAP, INPUT_WORD_GAP, DOT_DURATION, DASH_DURATION, SYMBOL_SPACE, LETTER_SPACE, WORD_SPACE } from './constants';
import { audioService } from './services/audioService';
import { generateMysteryMessage } from './services/geminiService';
import { Play, RotateCcw, Sparkles, Volume2, Trash2, StopCircle } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [morseSequence, setMorseSequence] = useState<string>('');
  const [decodedText, setDecodedText] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [playIndex, setPlayIndex] = useState(-1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Refs for manual timing logic
  const lastSignalTimeRef = useRef<number>(Date.now());
  const letterGapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wordGapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopPlaybackRef = useRef<boolean>(false);

  // --- Manual Input Logic ---

  const processSignalInput = (signal: string) => {
    // Clear previous timers when new input arrives
    if (letterGapTimerRef.current) clearTimeout(letterGapTimerRef.current);
    if (wordGapTimerRef.current) clearTimeout(wordGapTimerRef.current);

    setMorseSequence(prev => prev + signal);
    lastSignalTimeRef.current = Date.now();

    // Set timers to detect gaps
    letterGapTimerRef.current = setTimeout(() => {
      setMorseSequence(prev => prev + ' ');
      decodeCurrentSequence(morseSequence + signal + ' '); 
      
      // If we wait even longer, it's a word gap
      wordGapTimerRef.current = setTimeout(() => {
        setMorseSequence(prev => prev + ' / ');
        decodeCurrentSequence(morseSequence + signal + '  / ');
      }, INPUT_WORD_GAP - INPUT_LETTER_GAP);

    }, INPUT_LETTER_GAP);
  };

  // Convert current morse buffer to text
  const decodeCurrentSequence = (seq: string) => {
    const symbols = seq.trim().split(' ');
    let text = '';
    symbols.forEach(sym => {
      if (sym === '/') text += ' ';
      else if (sym === '') return;
      else {
        const char = REVERSE_MORSE_MAP[sym];
        text += char || '?';
      }
    });
    setDecodedText(text);
  };

  // Necessary effect to keep decode in sync when sequence updates via state if needed
  // But here we doing it imperatively in timers to avoid lag.
  // We can do a reactive decode too.
  useEffect(() => {
    const symbols = morseSequence.trim().split(' ');
    let text = '';
    for(const sym of symbols) {
       if (sym === '/') text += ' ';
       else if (sym === '' || sym === ' ') continue;
       else {
         text += REVERSE_MORSE_MAP[sym] || '';
       }
    }
    setDecodedText(text);
  }, [morseSequence]);


  // --- Auto Playback Logic ---

  const convertTextToMorse = (text: string): string => {
    return text.toUpperCase().split('').map(char => {
      if (char === ' ') return '/';
      return MORSE_CODE_MAP[char] || '?';
    }).join(' ');
  };

  const playSequence = async (textToPlay: string) => {
    if (isAutoPlaying) return;
    
    stopPlaybackRef.current = false;
    setIsAutoPlaying(true);
    setDecodedText(textToPlay.toUpperCase());
    
    const morse = convertTextToMorse(textToPlay);
    setMorseSequence(morse);
    
    // We need to map the morse string index to play status
    // Flatten the morse string into actionable events
    // A char is '.' or '-' or ' ' or '/'
    
    const events: {type: 'dot' | 'dash' | 'symbolSpace' | 'letterSpace' | 'wordSpace', index: number}[] = [];
    
    for (let i = 0; i < morse.length; i++) {
        const char = morse[i];
        if (char === '.') events.push({ type: 'dot', index: i });
        else if (char === '-') events.push({ type: 'dash', index: i });
        else if (char === ' ') events.push({ type: 'letterSpace', index: i });
        else if (char === '/') events.push({ type: 'wordSpace', index: i });
        
        // Add symbol space after dots/dashes if next is not space
        if ((char === '.' || char === '-') && i < morse.length - 1 && morse[i+1] !== ' ' && morse[i+1] !== '/') {
            events.push({ type: 'symbolSpace', index: i });
        }
    }

    for (const event of events) {
      if (stopPlaybackRef.current) break;

      setPlayIndex(event.index);

      if (event.type === 'dot') {
        await audioService.playSignal(DOT_DURATION);
      } else if (event.type === 'dash') {
        await audioService.playSignal(DASH_DURATION);
      } else if (event.type === 'symbolSpace') {
        await new Promise(r => setTimeout(r, SYMBOL_SPACE));
      } else if (event.type === 'letterSpace') {
        await new Promise(r => setTimeout(r, LETTER_SPACE));
      } else if (event.type === 'wordSpace') {
        await new Promise(r => setTimeout(r, WORD_SPACE));
      }
    }

    setIsAutoPlaying(false);
    setPlayIndex(-1);
  };

  const handleStop = () => {
    stopPlaybackRef.current = true;
    audioService.stopTone(); // Force stop immediately
    setIsAutoPlaying(false);
    setPlayIndex(-1);
  };

  const handleClear = () => {
    setMorseSequence('');
    setDecodedText('');
    setInputText('');
    setPlayIndex(-1);
    stopPlaybackRef.current = true;
  };

  const handleGeminiGenerate = async () => {
    setIsGenerating(true);
    handleClear();
    const message = await generateMysteryMessage();
    setInputText(message);
    setIsGenerating(false);
    playSequence(message);
  };

  const handleTextPlay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText) return;
    playSequence(inputText);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full p-6 border-b border-slate-800 bg-[#0f172a]/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg">
               <Volume2 className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">MorseMaster <span className="text-amber-500">AI</span></h1>
          </div>
          <div className="flex gap-4">
             <button 
                onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-sm font-medium"
             >
                <Trash2 size={16} />
                <span className="hidden sm:inline">CLEAR</span>
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl p-6 flex flex-col gap-8">
        
        {/* Top Section: Text Input & AI */}
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1 w-full">
                <label className="text-sm font-semibold text-slate-400 mb-2 block uppercase tracking-wider">Text to Morse</label>
                <form onSubmit={handleTextPlay} className="flex gap-2">
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type text to transmit..."
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 font-mono"
                        disabled={isAutoPlaying}
                    />
                    {isAutoPlaying ? (
                       <button 
                       type="button"
                       onClick={handleStop}
                       className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                     >
                       <StopCircle size={20} />
                       STOP
                     </button>
                    ) : (
                      <button 
                        type="submit"
                        disabled={!inputText}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        <Play size={20} />
                        PLAY
                      </button>
                    )}
                </form>
            </div>

            <div className="w-full md:w-auto flex flex-col justify-end">
                <label className="text-sm font-semibold text-slate-400 mb-2 block uppercase tracking-wider md:text-right">AI Assistant</label>
                <button 
                    onClick={handleGeminiGenerate}
                    disabled={isGenerating || isAutoPlaying}
                    className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-lg shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                    {isGenerating ? (
                        <RotateCcw className="animate-spin" size={20} />
                    ) : (
                        <Sparkles size={20} />
                    )}
                    <span>GENERATE SIGNAL</span>
                </button>
            </div>
        </div>

        {/* Middle Section: Display */}
        <div className="flex justify-center">
            <DisplayPanel 
                morseSequence={morseSequence}
                decodedText={decodedText}
                isAutoPlaying={isAutoPlaying}
                highlightIndex={playIndex}
            />
        </div>

        {/* Bottom Section: Manual Keyer */}
        <div className="flex flex-col items-center flex-1 justify-center min-h-[300px] bg-slate-900/30 rounded-3xl border border-slate-800/50 relative overflow-hidden">
            <div className="absolute top-4 left-0 right-0 text-center text-slate-500 text-sm font-mono tracking-widest pointer-events-none">
                MANUAL TRANSMITTER
            </div>
            
            <MorseKeyer onSignalInput={processSignalInput} disabled={isAutoPlaying} />
            
            <div className="mt-8 text-center text-slate-500 text-xs max-w-md">
                <p>Tap briefly for DOT (●), hold for DASH (▬)</p>
                <p className="mt-1">Pauses automatically create spaces.</p>
            </div>
        </div>

        <ReferenceChart />

      </main>
    </div>
  );
};

export default App;