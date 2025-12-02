import React, { useEffect, useRef } from 'react';

interface DisplayPanelProps {
  morseSequence: string;
  decodedText: string;
  isAutoPlaying: boolean;
  highlightIndex: number;
}

export const DisplayPanel: React.FC<DisplayPanelProps> = ({ 
  morseSequence, 
  decodedText,
  isAutoPlaying,
  highlightIndex 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to right as morse code is generated
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [morseSequence, decodedText]);

  return (
    <div className="w-full max-w-2xl bg-slate-900 rounded-xl border border-slate-700 p-6 shadow-2xl space-y-4">
      
      {/* Decoded Text Display */}
      <div className="min-h-[80px] flex items-center justify-center bg-slate-800 rounded-lg p-4 border border-slate-700/50">
         <h2 className="text-3xl md:text-4xl font-mono text-cyan-400 font-bold tracking-widest text-center break-words w-full">
           {decodedText || <span className="text-slate-600 text-xl animate-pulse">READY TO DECODE...</span>}
         </h2>
      </div>

      {/* Morse Sequence Display */}
      <div className="relative">
        <div 
          ref={scrollRef}
          className="h-32 overflow-y-auto bg-black/40 rounded-lg p-4 font-mono text-xl tracking-widest text-amber-500 border-inner shadow-inner border border-slate-800"
        >
          {morseSequence.split('').map((char, idx) => (
             <span 
              key={idx}
              className={`
                transition-colors duration-100
                ${isAutoPlaying && idx === highlightIndex 
                  ? 'text-white bg-amber-600 px-1 rounded shadow-[0_0_10px_rgba(245,158,11,0.8)]' 
                  : ''}
              `}
             >
               {char}
             </span>
          ))}
          {morseSequence.length === 0 && (
             <span className="text-slate-600 text-sm block mt-2 text-center">Signals appear here</span>
          )}
        </div>
      </div>
    </div>
  );
};