export interface MorseChar {
  char: string;
  code: string;
}

export type MorseDictionary = Record<string, string>;
export type ReverseMorseDictionary = Record<string, string>;

export enum SignalType {
  DOT = '.',
  DASH = '-',
  SPACE = ' ', // Character space
  WORD_SPACE = '/' // Word space
}

export interface PlaybackState {
  isPlaying: boolean;
  currentSymbolIndex: number; // Index in the morse sequence string
}