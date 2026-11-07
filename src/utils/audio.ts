// Real Web Audio Synthesizer for Authentic Alarm Sounds
import { AlarmSound } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private intervalId: any = null;
  private rampIntervalId: any = null;
  private currentVolume: number = 0.8;
  private activeVolume: number = 0.8;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(volume0to100: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume0to100 / 100));
    if (!this.isPlaying) {
      this.activeVolume = this.currentVolume;
    }
  }

  // Plays a single pattern or tone
  public playSound(sound: AlarmSound, durationSec: number = 3) {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.activeVolume, now);
    masterGain.connect(ctx.destination);

    switch (sound) {
      case 'radar':
        this.playRadarPing(ctx, masterGain, now);
        break;
      case 'gentle':
        this.playGentleChime(ctx, masterGain, now);
        break;
      case 'cyber':
        this.playCyberSynth(ctx, masterGain, now);
        break;
      case 'zen':
        this.playZenBowl(ctx, masterGain, now);
        break;
      case 'rooster':
        this.playRoosterWake(ctx, masterGain, now);
        break;
      case 'briefing':
        this.playGentleChime(ctx, masterGain, now);
        break;
      default:
        this.playRadarPing(ctx, masterGain, now);
        break;
    }
  }

  private playRadarPing(ctx: AudioContext, destination: AudioNode, startTime: number) {
    // Classic Apple Radar sonar beep (double ping)
    [0, 0.22].forEach(offset => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, startTime + offset);
      osc.frequency.exponentialRampToValueAtTime(1760, startTime + offset + 0.12);

      gain.gain.setValueAtTime(0.001, startTime + offset);
      gain.gain.linearRampToValueAtTime(0.7, startTime + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + offset + 0.18);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(startTime + offset);
      osc.stop(startTime + offset + 0.2);
    });
  }

  private playGentleChime(ctx: AudioContext, destination: AudioNode, startTime: number) {
    // Soothing sunrise marimba chords (E major arpeggio)
    const notes = [329.63, 415.30, 493.88, 659.25, 830.61]; // E4, G#4, B4, E5, G#5
    notes.forEach((freq, idx) => {
      const offset = idx * 0.18;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime + offset);

      gain.gain.setValueAtTime(0.001, startTime + offset);
      gain.gain.linearRampToValueAtTime(0.6 / (idx * 0.3 + 1), startTime + offset + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + offset + 1.2);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(startTime + offset);
      osc.stop(startTime + offset + 1.2);
    });
  }

  private playCyberSynth(ctx: AudioContext, destination: AudioNode, startTime: number) {
    // Futuristic cyber pulsed arpeggio
    const freqs = [440, 554.37, 659.25, 880, 1108.73];
    freqs.forEach((freq, i) => {
      const offset = i * 0.1;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime + offset);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, startTime + offset);
      filter.frequency.exponentialRampToValueAtTime(400, startTime + offset + 0.2);

      gain.gain.setValueAtTime(0.4, startTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + offset + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      osc.start(startTime + offset);
      osc.stop(startTime + offset + 0.26);
    });
  }

  private playZenBowl(ctx: AudioContext, destination: AudioNode, startTime: number) {
    // Deep Tibetan singing bowl harmonic
    const freqs = [216, 432, 648];
    freqs.forEach((f, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, startTime);

      const amp = 0.5 / (index + 1);
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(amp, startTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.5);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(startTime);
      osc.stop(startTime + 2.6);
    });
  }

  private playRoosterWake(ctx: AudioContext, destination: AudioNode, startTime: number) {
    // Energetic morning fanfare beeps
    const fanNotes = [523.25, 659.25, 783.99, 1046.50];
    fanNotes.forEach((freq, i) => {
      const offset = i * 0.14;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime + offset);

      gain.gain.setValueAtTime(0.25, startTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + offset + 0.2);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(startTime + offset);
      osc.stop(startTime + offset + 0.22);
    });
  }

  // Start continuous looping alarm for ringing screen
  public startAlarmRinging(sound: AlarmSound, briefingText?: string, graduallyIncrease: boolean = false) {
    if (this.isPlaying) return;
    this.isPlaying = true;

    if (graduallyIncrease) {
      // Start at 15% volume and ramp up over 20 seconds
      this.activeVolume = Math.max(0.08, this.currentVolume * 0.15);
      const step = (this.currentVolume - this.activeVolume) / 20;
      this.rampIntervalId = setInterval(() => {
        if (this.activeVolume < this.currentVolume) {
          this.activeVolume = Math.min(this.currentVolume, this.activeVolume + step);
        } else {
          clearInterval(this.rampIntervalId);
          this.rampIntervalId = null;
        }
      }, 1000);
    } else {
      this.activeVolume = this.currentVolume;
    }

    // Immediately play tone
    this.playSound(sound);

    // Repeat every 2.4 seconds
    this.intervalId = setInterval(() => {
      if (!this.isPlaying) return;
      this.playSound(sound);
    }, 2400);

    // Vibrate device if supported
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([800, 300, 800, 300, 1200]);
      } catch (e) {
        // ignore
      }
    }

    // If briefing requested, speak it after brief chime
    if (briefingText && 'speechSynthesis' in window) {
      setTimeout(() => {
        this.speakBriefing(briefingText);
      }, 1500);
    }
  }

  public stopAlarmRinging() {
    this.isPlaying = false;
    if (this.rampIntervalId) {
      clearInterval(this.rampIntervalId);
      this.rampIntervalId = null;
    }
    this.activeVolume = this.currentVolume;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch (e) {
        // ignore
      }
    }
  }

  public speakBriefing(text: string, lang: string = 'en-US') {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = this.currentVolume;
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed', e);
    }
  }
}

export const audioEngine = new SoundEngine();
