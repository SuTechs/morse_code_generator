import { MorseDictionary, ReverseMorseDictionary } from './types';

export const MORSE_CODE_MAP: MorseDictionary = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
};

// Create reverse map for decoding
export const REVERSE_MORSE_MAP: ReverseMorseDictionary = Object.entries(MORSE_CODE_MAP).reduce(
  (acc, [char, code]) => {
    acc[code] = char;
    return acc;
  },
  {} as ReverseMorseDictionary
);

// Timing Constants (in ms)
export const UNIT_LENGTH = 100; // Speed of transmission (WPM determinant)
export const DOT_DURATION = UNIT_LENGTH;
export const DASH_DURATION = UNIT_LENGTH * 3;
export const SYMBOL_SPACE = UNIT_LENGTH; // Space between parts of the same letter
export const LETTER_SPACE = UNIT_LENGTH * 3; // Space between letters
export const WORD_SPACE = UNIT_LENGTH * 7; // Space between words

// Input recognition thresholds
export const INPUT_DOT_MAX = 200; // ms
export const INPUT_LETTER_GAP = 500; // ms to determine end of letter
export const INPUT_WORD_GAP = 1200; // ms to determine space