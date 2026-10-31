/**
 * FluviSAR Web Audio Sonification Utility (E22)
 * Authority: plan.md Section 12.2, 19.2 (Milestone B09)
 * Maps calibrated radar backscatter (dB) into real-time sound frequencies:
 *   Low dB (-22 dB, calm water) -> Low pitch ~250 Hz (deep rumble)
 *   High dB (-5 dB, rough vegetation / double bounce) -> High pitch ~880 Hz
 */

class RadarSonifier {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playToneForDb(db: number | null) {
    if (db === null || isNaN(db)) {
      this.stop();
      return;
    }

    this.initContext();
    if (!this.ctx || !this.gainNode) return;

    // Clamp dB between -25 dB and 0 dB
    const clampedDb = Math.max(-25, Math.min(0, db));
    // Frequency mapping: f = 220 * 2^((dB + 25) / 12) Hz
    const freq = 220 * Math.pow(2, (clampedDb + 25) / 12);

    if (!this.isPlaying) {
      this.osc = this.ctx.createOscillator();
      this.osc.type = 'triangle'; // Smooth acoustic tone
      this.osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      this.osc.connect(this.gainNode);
      this.osc.start();
      this.isPlaying = true;

      // Soft envelope in
      this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.05);
    } else if (this.osc) {
      this.osc.frequency.cancelScheduledValues(this.ctx.currentTime);
      this.osc.frequency.linearRampToValueAtTime(freq, this.ctx.currentTime + 0.03);
    }
  }

  public stop() {
    if (this.isPlaying && this.gainNode && this.ctx) {
      this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 0.05);
      setTimeout(() => {
        if (this.osc) {
          try {
            this.osc.stop();
            this.osc.disconnect();
          } catch {
            // Ignore if already stopped
          }
          this.osc = null;
        }
        this.isPlaying = false;
      }, 60);
    }
  }
}

export const radarSonifier = new RadarSonifier();

