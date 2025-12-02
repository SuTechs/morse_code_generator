import React, { useState, useRef, useEffect, useCallback } from 'react';
import { audioService } from '../services/audioService';
import { INPUT_DOT_MAX } from '../constants';

interface MorseKeyerProps {
  onSignalInput: (signal: string) => void;
  disabled?: boolean;
}

export const MorseKeyer: React.FC<MorseKeyerProps> = ({ onSignalInput, disabled }) => {
  const [isActive, setIsActive] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  // Handlers for starting tone
  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    // Prevent default to stop scrolling/selecting on mobile
    if (e.type === 'touchstart') e.preventDefault();
    if (isActive) return;

    setIsActive(true);
    startTimeRef.current = Date.now();
    audioService.startTone();
  }, [isActive, disabled]);

  // Handlers for stopping tone
  const handleEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
     if (disabled) return;
     if (e.type === 'touchend') e.preventDefault();
    
    if (!isActive || startTimeRef.current === null) return;

    const endTime = Date.now();
    const duration = endTime - startTimeRef.current;
    
    audioService.stopTone();
    setIsActive(false);
    startTimeRef.current = null;

    // Determine signal type
    const signal = duration < INPUT_DOT_MAX ? '.' : '-';
    onSignalInput(signal);
  }, [isActive, disabled, onSignalInput]);

  // Ensure tone stops if mouse leaves button while pressed
  const handleLeave = useCallback(() => {
    if (isActive) {
      audioService.stopTone();
      setIsActive(false);
      startTimeRef.current = null;
    }
  }, [isActive]);

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div 
        className={`
          relative w-64 h-64 rounded-full border-8 
          flex items-center justify-center cursor-pointer transition-all duration-100 ease-out
          select-none touch-none
          ${isActive 
            ? 'bg-amber-500 border-amber-300 shadow-[0_0_50px_rgba(245,158,11,0.6)] scale-95' 
            : 'bg-slate-800 border-slate-600 shadow-xl hover:border-slate-500 hover:shadow-2xl active:scale-95'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        `}
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleLeave}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
      >
        <div className={`text-center pointer-events-none transition-opacity ${isActive ? 'opacity-100' : 'opacity-70'}`}>
          <span className="block text-4xl font-bold text-white mb-2">TAP</span>
          <span className="block text-sm text-slate-300 uppercase tracking-widest">
            {isActive ? 'TRANSMITTING' : 'HOLD FOR DASH'}
          </span>
        </div>
        
        {/* Ripple effect rings */}
        {isActive && (
           <>
            <div className="absolute inset-0 rounded-full border border-amber-200 opacity-50 animate-ping"></div>
           </>
        )}
      </div>
    </div>
  );
};