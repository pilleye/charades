// Audio + Haptic feedback engine using Web Audio API + Capacitor Haptics
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private hapticsSupported = true;

  constructor() {
    // Haptics support will be checked when first used
  }

  private getContext(): AudioContext {
    // If context is missing or closed, create a new one
    if (!this.ctx || this.ctx.state === 'closed') {
      console.log('Creating new AudioContext');
      this.ctx = new (
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
    }

    return this.ctx;
  }

  private async ensureContextReady(): Promise<AudioContext> {
    const ctx = this.getContext();
    console.log(`AudioContext state before ready check: ${ctx.state}`);

    if (ctx.state === 'suspended') {
      try {
        console.log('AudioContext suspended, attempting to resume...');
        await ctx.resume();
        console.log('AudioContext resumed successfully');
      } catch (err) {
        console.error('Failed to resume audio context:', err);
        throw err;
      }
    }

    return ctx;
  }

  private async playHaptic(type: 'success' | 'recovery' | 'skip' | 'countdown' | 'buzzer' | 'tick', isGo?: boolean) {
    if (!this.hapticsSupported) return;
    
    try {
      console.log(`Attempting ${type} haptic feedback`);
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
      console.log(`${type} haptic completed`);
    } catch (err) {
      console.warn(`Haptics failed for ${type}, disabling:`, err);
      this.hapticsSupported = false;
    }
  }

  public async resume() {
    // Explicit resume helper for audio context
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      console.log(`Explicit resume called. Current state: ${ctx.state}`);
      try {
        await ctx.resume();
        console.log('Explicit resume successful');
      } catch (err) {
        console.error('Audio resume failed:', err);
      }
    }
  }

  public async playSuccess() {
    console.log('Playing SUCCESS sound + haptic');
    
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
      console.log('SUCCESS sound dispatched');
    } catch (err) {
      console.error('Failed to play success feedback:', err);
    }
  }

  public async playRecovery() {
    console.log('Playing RECOVERY sound + haptic');
    
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
      console.log('RECOVERY sound dispatched');
    } catch (err) {
      console.error('Failed to play recovery feedback:', err);
    }
  }

  public async playSkip() {
    console.log('Playing SKIP sound + haptic');
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
    console.log(`Playing COUNTDOWN sound + haptic (isGo: ${isGo})`);
    try {
      // Play haptic feedback
      await this.playHaptic('countdown', isGo);
      
      // Play audio
      const ctx = await this.ensureContextReady();
      const t = ctx.currentTime;

      if (isGo) {
        // GO! Sound: Mario Kart Style
        this.playTone(1046.5, 'square', t, 0.6, 0.15);
        this.playTone(1318.51, 'square', t, 0.6, 0.15);
      } else {
        // 3-2-1 Sound: Softer, distinct blip
        this.playTone(523.25, 'sine', t, 0.15, 0.3);
      }
    } catch (err) {
      console.error('Failed to play countdown feedback:', err);
    }
  }

  public async playBuzzer() {
    console.log('Playing BUZZER sound + haptic');
    try {
      // Play haptic feedback
      await this.playHaptic('buzzer');
      
      // Play audio
      const ctx = await this.ensureContextReady();
      const t = ctx.currentTime;
      const duration = 0.6;

      const masterGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, t);
      filter.frequency.linearRampToValueAtTime(200, t + duration);

      masterGain.gain.setValueAtTime(0.3, t);
      masterGain.gain.setValueAtTime(0.3, t + duration - 0.1);
      masterGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      const osc1 = ctx.createOscillator();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(140, t);
      osc1.frequency.exponentialRampToValueAtTime(80, t + duration);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(138, t);
      osc2.frequency.exponentialRampToValueAtTime(78, t + duration);

      osc1.connect(filter);
      osc2.connect(filter);

      osc1.start(t);
      osc1.stop(t + duration);
      osc2.start(t);
      osc2.stop(t + duration);
    } catch (err) {
      console.error('Failed to play buzzer feedback:', err);
    }
  }

  public async playTick() {
    try {
      // Play haptic feedback (silent for tick to avoid spam)
      await this.playHaptic('tick');
      
      // Play audio
      const ctx = await this.ensureContextReady();
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.setValueAtTime(800, t);
      gain.gain.setValueAtTime(0.02, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
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
