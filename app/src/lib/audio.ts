// Audio + Haptic feedback engine using Web Audio API + Capacitor Haptics
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private hapticsSupported = true;
  private lastResumeAttempt = 0;

  constructor() {
    // Haptics support will be checked when first used
  }

  private getContext(): AudioContext {
    // If context is missing or closed, create a new one
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioContextClass = (window.AudioContext || 
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      
      if (!AudioContextClass) {
        console.error('Web Audio API not supported in this environment');
        throw new Error('Web Audio API not supported');
      }

      this.ctx = new AudioContextClass();
      console.warn('[SoundEngine] AudioContext created. State:', this.ctx.state);

      this.ctx.onstatechange = () => {
        console.warn('[SoundEngine] AudioContext state changed to:', this.ctx?.state);
      };
    }

    return this.ctx;
  }

  private async ensureContextReady(): Promise<AudioContext> {
    const ctx = this.getContext();

    if (ctx.state === 'suspended') {
      // Avoid spamming resume calls if they are failing
      const now = Date.now();
      if (now - this.lastResumeAttempt > 1000) {
        this.lastResumeAttempt = now;
        try {
          console.warn('[SoundEngine] Attempting to resume context from ensureContextReady. Current state:', ctx.state);
          await ctx.resume();
          console.warn('[SoundEngine] Resume attempt finished. New state:', ctx.state);
        } catch (err) {
          console.error('[SoundEngine] Failed to resume audio context:', err);
        }
      }
    }

    return ctx;
  }

  private async playHaptic(type: 'success' | 'recovery' | 'skip' | 'countdown' | 'buzzer' | 'tick', isGo?: boolean) {
    if (!this.hapticsSupported) return;
    
    try {
      switch (type) {
        case 'success':
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case 'recovery':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'skip':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'countdown':
          await Haptics.impact({ style: isGo ? ImpactStyle.Heavy : ImpactStyle.Light });
          break;
        case 'buzzer':
          await Haptics.notification({ type: NotificationType.Error });
          break;
        case 'tick':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
      }
    } catch (err) {
      console.warn(`[SoundEngine] Haptics failed for ${type}, disabling:`, err);
      this.hapticsSupported = false;
    }
  }

  public async resume() {
    // Explicit resume helper for audio context
    try {
      const ctx = this.getContext();
      console.warn('[SoundEngine] Manual resume requested. Current state:', ctx.state);
      
      if (ctx.state === 'suspended') {
        await ctx.resume();
        console.warn('[SoundEngine] ctx.resume() completed. State now:', ctx.state);
      }

      // If still suspended after resume (common on iOS if not a user gesture), 
      // we can't do much more here, but we can try to prime it if it IS running.
      if (ctx.state === 'running') {
        // Prime with a silent sound to ensure it's "unlocked"
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.001; 
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(0);
        osc.stop(0.001);
      }
    } catch (err) {
      console.error('[SoundEngine] Audio resume failed:', err);
    }
  }

  public async playSuccess() {
    
    // Play haptic feedback (don't await to avoid blocking audio)
    this.playHaptic('success');
    
    try {
      // Play audio
      const ctx = await this.ensureContextReady();
      const t = ctx.currentTime;

      // Play a major triad (C major: C5, E5, G5)
      this.playTone(523.25, 'sine', t, 0.3);
      this.playTone(659.25, 'sine', t + 0.05, 0.3);
      this.playTone(783.99, 'sine', t + 0.1, 0.4);
    } catch (err) {
      console.error('Failed to play success feedback:', err);
    }
  }

  public async playRecovery() {
    
    // Play haptic feedback (don't await to avoid blocking audio)
    this.playHaptic('recovery');
    
    try {
      // Play audio
      const ctx = await this.ensureContextReady();
      const t = ctx.currentTime;

      // Recovery "Power Up" sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, t);
      osc.frequency.exponentialRampToValueAtTime(1046.5, t + 0.15);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.4);

      // "Ding" accent at the end
      this.playTone(1567.98, 'triangle', t + 0.1, 0.4, 0.1);
    } catch (err) {
      console.error('Failed to play recovery feedback:', err);
    }
  }

  public async playSkip() {
    try {
      // Play haptic feedback
      await this.playHaptic('skip');
      
      // Play audio
      const ctx = await this.ensureContextReady();
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.2);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    } catch (err) {
      console.error('Failed to play skip feedback:', err);
    }
  }

  public async playCountdown(isGo: boolean = false) {
    try {
      // Play haptic feedback
      await this.playHaptic('countdown', isGo);
      
      // Play audio
      const ctx = await this.ensureContextReady();
      const t = ctx.currentTime;

      if (isGo) {
        // GO! Sound: Mario Kart Style high peak
        // A combination of frequencies to make it "thick"
        this.playTone(1046.5, 'square', t, 0.6, 0.4); // C6
        this.playTone(1318.51, 'square', t, 0.6, 0.4); // E6
        this.playTone(1567.98, 'square', t, 0.6, 0.4); // G6
      } else {
        // 3-2-1 Sound: Sharp, neutral mid-beep
        this.playTone(523.25, 'square', t, 0.1, 0.4); // C5
      }
    } catch (err) {
      console.error('Failed to play countdown feedback:', err);
    }
  }

  public async playBuzzer() {
    try {
      // Play haptic feedback
      await this.playHaptic('buzzer');
      
      // Play audio
      const ctx = await this.ensureContextReady();
      const t = ctx.currentTime;
      const pulseCount = 4;
      const pulseDuration = 0.12;
      const gap = 0.04;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.4, t); // Louder
      masterGain.connect(ctx.destination);

      // Bright Arcade Buzzer: Fast pulses of filtered square waves
      // Using a major-ish interval (250Hz and 375Hz - Perfect Fifth)
      // High-energy but "clean" (not gritty)
      for (let i = 0; i < pulseCount; i++) {
        const startTime = t + i * (pulseDuration + gap);
        
        [250, 375].forEach(freq => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, startTime);
          
          // Filter out the "grittiness" while keeping the "thickness"
          filter.type = 'lowpass';
          filter.frequency.value = 2500;
          
          g.gain.setValueAtTime(0, startTime);
          g.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
          g.gain.setValueAtTime(0.3, startTime + pulseDuration - 0.01);
          g.gain.linearRampToValueAtTime(0, startTime + pulseDuration);
          
          osc.connect(filter);
          filter.connect(g);
          g.connect(masterGain);
          
          osc.start(startTime);
          osc.stop(startTime + pulseDuration);
        });
      }
    } catch (err) {
      console.error('Failed to play buzzer feedback:', err);
    }
  }

  public async playUrgentTick() {
    try {
      if (this.hapticsSupported) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      }
      
      const ctx = await this.ensureContextReady();
      const t = ctx.currentTime;
      
      const freq = 800; 
      const volume = 0.4; // Significantly louder
      const duration = 0.1; 

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + duration);
    } catch (err) {
      console.error('Failed to play urgent tick:', err);
    }
  }

  public async playTick(freq: number = 800, volume: number = 0.01) {
    try {
      // Play haptic feedback (silent for tick to avoid spam)
      await this.playHaptic('tick');
      
      // Play audio
      const ctx = await this.ensureContextReady();
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    } catch (err) {
      console.error('Failed to play tick feedback:', err);
    }
  }

  private playTone(
    freq: number,
    type: OscillatorType,
    startTime: number,
    duration: number,
    volume: number = 0.2
  ) {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const soundEngine = new SoundEngine();
