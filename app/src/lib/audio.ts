// Audio + Haptic feedback engine using Web Audio API + Capacitor Haptics
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

console.log('[SoundEngine] audio.ts module loaded/reloaded');

class SoundEngine {
  private ctx: AudioContext | null = null;
  private hapticsSupported = true;

  constructor() {
    // Haptics support will be checked when first used
  }

  private getContext(): AudioContext {
    // If context is missing or closed, create a new one
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioContextClass = (window.AudioContext || 
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      
      if (!AudioContextClass) {
        console.error('[SoundEngine] CRITICAL: Web Audio API not supported in this environment');
        throw new Error('Web Audio API not supported');
      }

      this.ctx = new AudioContextClass();
      console.warn(`[SoundEngine] NEW AudioContext created. ID: ${Math.random().toString(36).substr(2, 9)}, State: ${this.ctx.state}`);

      this.ctx.onstatechange = () => {
        console.warn(`[SoundEngine] AudioContext state change detected: -> ${this.ctx?.state}`);
      };
    }

    return this.ctx;
  }

  private async ensureContextReady(): Promise<AudioContext> {
    const ctx = this.getContext();
    const startTime = Date.now();

    console.log(`[SoundEngine] checking context: state=${ctx.state}, time=${ctx.currentTime.toFixed(3)}`);

    if (ctx.state === 'suspended') {
      try {
        console.warn('[SoundEngine] AudioContext suspended. Attempting auto-resume...');
        await ctx.resume();
        console.warn(`[SoundEngine] Auto-resume finished. New state: ${ctx.state} (took ${Date.now() - startTime}ms)`);
      } catch (err) {
        console.error('[SoundEngine] Auto-resume failed:', err);
      }
    }
    
    // Recovery: If state is running but currentTime is not advancing, the context might be "stuck"
    if (ctx.state === 'running') {
      const t1 = ctx.currentTime;
      await new Promise(r => setTimeout(r, 10));
      if (ctx.currentTime === t1 && t1 > 0) {
        console.error('[SoundEngine] AudioContext HEURISTIC: State is "running" but currentTime is stuck at ' + t1 + '. Recreating context...');
        try {
          await ctx.close();
        } catch (e) { /* ignore */ }
        this.ctx = null;
        return this.getContext();
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

  public async resume() {
    // Explicit resume helper for audio context
    try {
      const ctx = this.getContext();
      const oldState = ctx.state;
      console.log(`[SoundEngine] Manual resume requested. Current state: ${oldState}`);
      
      if (ctx.state !== 'running') {
        await ctx.resume();
        console.log(`[SoundEngine] ctx.resume() call finished. State: ${oldState} -> ${ctx.state}`);
      }

      // Always try to prime if we are running or just became running
      if (ctx.state === 'running') {
        console.log('[SoundEngine] Priming running context with silent oscillator');
        // Prime with a silent sound to ensure it's "unlocked" and destination is active
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.0001; 
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(0);
        osc.stop(0.001);
      }
    } catch (err) {
      console.error('[SoundEngine] Manual resume failed:', err);
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
    } catch (err) {
      console.error('[SoundEngine] Failed in playBuzzer:', err);
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
