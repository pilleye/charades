// Audio + Haptic feedback engine using Web Audio API + Capacitor Haptics
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

console.log('[SoundEngine] audio.ts module loaded/reloaded');

// Use native AudioContext
type AudioContextType = typeof AudioContext;
const AudioContextClass: AudioContextType = window.AudioContext ||
  (window as unknown as { webkitAudioContext: AudioContextType }).webkitAudioContext;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private hapticsSupported = true;
  private contextCreatedAt: number = 0;

  // Recreate context if older than this (Safari kills audio after ~2min idle)
  private static readonly MAX_CONTEXT_AGE_MS = 60 * 1000; // 1 minute

  constructor() {
    // Haptics support will be checked when first used
  }

  private getContext(): AudioContext {
    // If context is missing or closed, create a new one
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContextClass();
      this.contextCreatedAt = Date.now();
      console.log(`[SoundEngine] NEW AudioContext created. State: ${this.ctx.state}`);

      this.ctx.onstatechange = () => {
        console.log(`[SoundEngine] AudioContext state changed: -> ${this.ctx?.state}`);
      };
    }

    return this.ctx;
  }

  private isContextStale(): boolean {
    if (!this.ctx || this.ctx.state === 'closed') return false;
    const age = Date.now() - this.contextCreatedAt;
    const isStale = age > SoundEngine.MAX_CONTEXT_AGE_MS;
    if (isStale) {
      console.log(`[SoundEngine] Context is stale (age: ${Math.round(age / 1000)}s)`);
    }
    return isStale;
  }

  private async ensureContextReady(): Promise<AudioContext> {
    // If context is stale, recreate it
    if (this.isContextStale()) {
      console.log('[SoundEngine] Recreating stale context...');
      await this.destroy();
    }

    const ctx = this.getContext();

    if (ctx.state === 'suspended') {
      try {
        console.log('[SoundEngine] AudioContext suspended. Resuming...');
        await ctx.resume();
        console.log(`[SoundEngine] Resumed. State: ${ctx.state}`);
      } catch (err) {
        console.error('[SoundEngine] Resume failed:', err);
      }
    }

    return ctx;
  }

  private async playHaptic(type: 'success' | 'recovery' | 'skip' | 'countdown' | 'buzzer' | 'tick', isGo?: boolean) {
    if (!this.hapticsSupported) {
      console.log(`[SoundEngine] Haptics skipped (supported=false) for ${type}`);
      return;
    }
    
    try {
      console.log(`[SoundEngine] Triggering haptic: ${type}`);
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

  public async init() {
    // Initialize audio context during a user gesture (game start, resume from pause)
    console.log('[SoundEngine] init() called');
    try {
      // If context already exists and is usable, just resume it
      if (this.ctx && this.ctx.state !== 'closed') {
        console.log(`[SoundEngine] Context already exists (state=${this.ctx.state}), resuming`);
        if (this.ctx.state === 'suspended') {
          await this.ctx.resume();
        }
        console.log(`[SoundEngine] AudioContext ready. State: ${this.ctx.state}`);
        return;
      }

      const ctx = this.getContext();

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      console.log(`[SoundEngine] AudioContext initialized. State: ${ctx.state}`);
    } catch (err) {
      console.error('[SoundEngine] init() failed:', err);
    }
  }

  public async destroy() {
    // Close and release the audio context (on pause, game end)
    console.log('[SoundEngine] destroy() called');
    if (this.ctx) {
      try {
        await this.ctx.close();
        console.log('[SoundEngine] AudioContext closed');
      } catch (e) {
        console.warn('[SoundEngine] Error closing context:', e);
      }
      this.ctx = null;
    }
  }

  public async resume() {
    // Resume audio context - called when tab becomes visible during active game
    try {
      if (!this.ctx || this.ctx.state === 'closed') {
        console.log('[SoundEngine] resume() - no context, calling init()');
        await this.init();
        return;
      }

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
        console.log(`[SoundEngine] Context resumed. State: ${this.ctx.state}`);
      }
    } catch (err) {
      console.error('[SoundEngine] resume() failed:', err);
    }
  }

  public async playSuccess() {
    console.log('[SoundEngine] playSuccess() called');
    this.playHaptic('success');
    
    try {
      const ctx = await this.ensureContextReady();
      const t = ctx.currentTime;
      console.log(`[SoundEngine] Scheduling playSuccess tones at t=${t.toFixed(3)}`);

      this.playTone(523.25, 'sine', t, 0.3);
      this.playTone(659.25, 'sine', t + 0.05, 0.3);
      this.playTone(783.99, 'sine', t + 0.1, 0.4);
    } catch (err) {
      console.error('[SoundEngine] Failed in playSuccess:', err);
    }
  }

  public async playRecovery() {
    console.log('[SoundEngine] playRecovery() called');
    this.playHaptic('recovery');
    
    try {
      const ctx = await this.ensureContextReady();
      const t = ctx.currentTime;
      console.log(`[SoundEngine] Scheduling playRecovery at t=${t.toFixed(3)}`);

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

      this.playTone(1567.98, 'triangle', t + 0.1, 0.4, 0.1);
    } catch (err) {
      console.error('[SoundEngine] Failed in playRecovery:', err);
    }
  }

  public async playSkip() {
    console.log('[SoundEngine] playSkip() called');
    try {
      this.playHaptic('skip');
      
      const ctx = await this.ensureContextReady();
      const t = ctx.currentTime;
      console.log(`[SoundEngine] Scheduling playSkip at t=${t.toFixed(3)}`);

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
      console.error('[SoundEngine] Failed in playSkip:', err);
    }
  }

  public async playCountdown(isGo: boolean = false) {
    console.log(`[SoundEngine] playCountdown(isGo=${isGo}) called`);
    try {
      this.playHaptic('countdown', isGo);
      
      const ctx = await this.ensureContextReady();
      const t = ctx.currentTime;
      console.log(`[SoundEngine] Scheduling countdown at t=${t.toFixed(3)}`);

      if (isGo) {
        this.playTone(1046.5, 'square', t, 0.6, 0.4); // C6
        this.playTone(1318.51, 'square', t, 0.6, 0.4); // E6
        this.playTone(1567.98, 'square', t, 0.6, 0.4); // G6
      } else {
        this.playTone(523.25, 'square', t, 0.1, 0.4); // C5
      }
    } catch (err) {
      console.error('[SoundEngine] Failed in playCountdown:', err);
    }
  }

  public async playBuzzer() {
    console.log('[SoundEngine] playBuzzer() called');
    try {
      this.playHaptic('buzzer');
      
      const ctx = await this.ensureContextReady();
      const t = ctx.currentTime;
      console.log(`[SoundEngine] Scheduling buzzer at t=${t.toFixed(3)}`);

      const pulseCount = 4;
      const pulseDuration = 0.12;
      const gap = 0.04;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.4, t);
      masterGain.connect(ctx.destination);

      for (let i = 0; i < pulseCount; i++) {
        const startTime = t + i * (pulseDuration + gap);

        [250, 375].forEach(freq => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, startTime);

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
      console.log(`[SoundEngine] playBuzzer scheduled ${pulseCount} pulses, ends at t=${(t + pulseCount * (pulseDuration + gap)).toFixed(3)}`);

    } catch (err) {
      console.error('[SoundEngine] Failed in playBuzzer:', err);
    }
  }

  public async playUrgentTick() {
    console.log('[SoundEngine] playUrgentTick() called');
    try {
      this.playHaptic('tick');

      const ctx = await this.ensureContextReady();
      const t = ctx.currentTime;

      const freq = 800;
      const volume = 0.4;
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
      console.log(`[SoundEngine] playUrgentTick scheduled at t=${t.toFixed(3)}`);
    } catch (err) {
      console.error('[SoundEngine] Failed in playUrgentTick:', err);
    }
  }

  public async playTick(freq: number = 800, volume: number = 0.01) {
    try {
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
      console.error('[SoundEngine] Failed in playTick:', err);
    }
  }

  private playTone(
    freq: number,
    type: OscillatorType,
    startTime: number,
    duration: number,
    volume: number = 0.2
  ) {
    try {
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
      console.log(`[SoundEngine] playTone SUCCESS: ${freq}Hz, ${type}, duration=${duration}s`);
    } catch (e) {
      console.error(`[SoundEngine] playTone FAILED: ${freq}Hz`, e);
    }
  }
}

export const soundEngine = new SoundEngine();

// Debug helper - call from browser console: window.testAudio()
(window as unknown as { testAudio: () => void }).testAudio = () => {
  console.log('[TEST] Testing audio...');
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  console.log(`[TEST] Created context. State: ${ctx.state}`);

  ctx.resume().then(() => {
    console.log(`[TEST] Context resumed. State: ${ctx.state}`);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 440;
    gain.gain.value = 0.5;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);

    console.log('[TEST] Playing 440Hz tone for 0.5s...');
  });
};
