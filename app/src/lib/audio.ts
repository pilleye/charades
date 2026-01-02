// Audio Engine using Web Audio API

class SoundEngine {
  private ctx: AudioContext | null = null;

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

  public async resume() {
    // Explicit resume helper
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
    console.log('Attempting to play SUCCESS sound');
    try {
      const ctx = await this.ensureContextReady();
      const t = ctx.currentTime;

      // Play a major triad (C major: C5, E5, G5)
      this.playTone(523.25, 'sine', t, 0.3);
      this.playTone(659.25, 'sine', t + 0.05, 0.3);
      this.playTone(783.99, 'sine', t + 0.1, 0.4);
      console.log('SUCCESS sound dispatched');
    } catch (err) {
      console.error('Failed to play success sound:', err);
    }
  }

  public async playRecovery() {
    console.log('Attempting to play RECOVERY sound');
    try {
      const ctx = await this.ensureContextReady();
      const t = ctx.currentTime;

      // Recovery "Power Up" sound
      // Fast upward glissando + sparkle
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Slide up from C5 to C6
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
      this.playTone(1567.98, 'triangle', t + 0.1, 0.4, 0.1); // G6 high ping
      console.log('RECOVERY sound dispatched');
    } catch (err) {
      console.error('Failed to play recovery sound:', err);
    }
  }

  public async playSkip() {
    console.log('Attempting to play SKIP sound');
    try {
      const ctx = await this.ensureContextReady();
      const t = ctx.currentTime;

      // A quick sliding pitch down "whoosh"
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
      console.log('SKIP sound dispatched');
    } catch (err) {
      console.error('Failed to play skip sound:', err);
    }
  }

  public async playCountdown(isGo: boolean = false) {
    console.log(`Attempting to play COUNTDOWN sound (isGo: ${isGo})`);
    try {
      const ctx = await this.ensureContextReady();
      const t = ctx.currentTime;

      if (isGo) {
        // GO! Sound: Mario Kart Style
        // High energy, harmonized square waves
        // C6 (1046.5) + E6 (1318.5)
        this.playTone(1046.5, 'square', t, 0.6, 0.15);
        this.playTone(1318.51, 'square', t, 0.6, 0.15);
      } else {
        // 3-2-1 Sound: Softer, distinct blip (Woodblock-ish sine)
        // C5 (523.25)
        this.playTone(523.25, 'sine', t, 0.15, 0.3);
      }
      console.log('COUNTDOWN sound dispatched');
    } catch (err) {
      console.error('Failed to play countdown sound:', err);
    }
  }

  public async playBuzzer() {
    console.log('Attempting to play BUZZER sound');
    try {
      const ctx = await this.ensureContextReady();
      const t = ctx.currentTime;
      const duration = 0.6;

      // Create a master gain/filter graph for a cleaner sound
      const masterGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Lowpass filter to round off the sharp edges of square waves
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, t); // Start muffled
      filter.frequency.linearRampToValueAtTime(200, t + duration); // Close filter

      masterGain.gain.setValueAtTime(0.3, t);
      masterGain.gain.setValueAtTime(0.3, t + duration - 0.1);
      masterGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Oscillator 1: Main body (Square wave)
      // Pitch drops slightly to signify "Time Down" / "Stop"
      const osc1 = ctx.createOscillator();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(140, t);
      osc1.frequency.exponentialRampToValueAtTime(80, t + duration);

      // Oscillator 2: Sub-oscillator for weight (Sine)
      // Adds fundamental bass without harshness
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(138, t); // Slight detune
      osc2.frequency.exponentialRampToValueAtTime(78, t + duration);

      osc1.connect(filter);
      osc2.connect(filter);

      osc1.start(t);
      osc1.stop(t + duration);
      osc2.start(t);
      osc2.stop(t + duration);
      console.log('BUZZER sound dispatched');
    } catch (err) {
      console.error('Failed to play buzzer sound:', err);
    }
  }

  public async playTick() {
    // console.log('Attempting to play TICK sound'); // Commented out to reduce noise
    try {
      const ctx = await this.ensureContextReady();
      const t = ctx.currentTime;

      // Very short blip
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.setValueAtTime(800, t);
      // Quieter tick
      gain.gain.setValueAtTime(0.02, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    } catch (err) {
      console.error('Failed to play tick sound:', err);
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
