class AudioService {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private frequency: number = 600; // 600Hz is a pleasant beep tone

  constructor() {
    // Lazy initialization handled in methods to adhere to browser autoplay policies
  }

  private initContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  public startTone() {
    this.initContext();
    if (!this.audioContext) return;

    // Prevent multiple oscillators stacking
    if (this.oscillator) return;

    this.oscillator = this.audioContext.createOscillator();
    this.gainNode = this.audioContext.createGain();

    this.oscillator.type = 'sine';
    this.oscillator.frequency.setValueAtTime(this.frequency, this.audioContext.currentTime);

    // Ramp up gain to avoid clicking
    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.01);

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    this.oscillator.start();
  }

  public stopTone() {
    if (!this.audioContext || !this.oscillator || !this.gainNode) return;

    const osc = this.oscillator;
    const gain = this.gainNode;

    // Ramp down gain to avoid clicking
    const now = this.audioContext.currentTime;
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.01);

    osc.stop(now + 0.01);
    
    // Cleanup after stop
    setTimeout(() => {
        osc.disconnect();
        gain.disconnect();
    }, 20); // Slightly larger than ramp time

    this.oscillator = null;
    this.gainNode = null;
  }

  // Used for automated playback
  public playSignal(durationMs: number): Promise<void> {
    return new Promise((resolve) => {
      this.startTone();
      setTimeout(() => {
        this.stopTone();
        resolve();
      }, durationMs);
    });
  }
}

export const audioService = new AudioService();