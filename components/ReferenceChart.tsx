import React from 'react';
import { MORSE_CODE_MAP } from '../constants';
import { BookOpen } from 'lucide-react';

interface ItemProps {
  char: string;
  code: string;
}

const Item: React.FC<ItemProps> = ({ char, code }) => (
  <div className="flex items-center justify-between bg-slate-800/40 hover:bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700/50 transition-all group select-none">
    <span className="font-bold text-slate-300 group-hover:text-white">{char}</span>
    <span className="font-mono text-amber-500/90 group-hover:text-amber-400 text-sm tracking-widest">{code}</span>
  </div>
);

export const ReferenceChart: React.FC = () => {
  const letters = Object.entries(MORSE_CODE_MAP).filter(([k]) => /^[A-Z]$/.test(k)).sort();
  const numbers = Object.entries(MORSE_CODE_MAP).filter(([k]) => /^[0-9]$/.test(k)).sort();
  const symbols = Object.entries(MORSE_CODE_MAP).filter(([k]) => !/^[A-Z0-9]$/.test(k)).sort();

  return (
    <div className="w-full bg-slate-900/30 rounded-2xl border border-slate-800 p-6">
       <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
             <BookOpen className="text-indigo-400 w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">Reference Chart</h3>
       </div>

      <div className="space-y-8">
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">Letters</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {letters.map(([char, code]) => <Item key={char} char={char} code={code} />)}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">Numbers</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
             {numbers.map(([char, code]) => <Item key={char} char={char} code={code} />)}
          </div>
        </div>
        
        <details className="group/details">
           <summary className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2 cursor-pointer hover:text-slate-300 flex items-center justify-between select-none">
              <span>Punctuation & Symbols</span>
              <span className="transform transition-transform group-open/details:rotate-180">▼</span>
           </summary>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
             {symbols.map(([char, code]) => <Item key={char} char={char} code={code} />)}
           </div>
        </details>
      </div>
    </div>
  );
};