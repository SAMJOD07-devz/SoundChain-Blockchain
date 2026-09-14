/**
 * Web Audio API Procedural Synthesizer for SoundChain
 * Provides authentic, lightweight procedural synth audio loops tailored for each demo track genre.
 * Includes FFT AnalyserNode hookup for live audio waveform & spectrum visualizer components.
 */

class AudioSynthEngine {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.currentTrackId = null;
    this.intervalId = null;
    this.step = 0;
    this.activeNodes = [];
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  getAnalyser() {
    this.init();
    return this.analyser;
  }

  playTrack(trackId) {
    this.init();
    if (this.isPlaying && this.currentTrackId === trackId) return;
    this.stop();

    this.isPlaying = true;
    this.currentTrackId = trackId;
    this.step = 0;

    if (trackId === "track-1") {
      // Midnight Signals — Synthwave (120 BPM)
      this.startSynthwaveLoop();
    } else if (trackId === "track-2") {
      // Glass Horizon — Ambient Chill (95 BPM)
      this.startAmbientLoop();
    } else {
      // Afterglow Circuit — Electro Cyber (128 BPM)
      this.startCyberLoop();
    }
  }

  // 1. Synthwave Engine: 80s bassline + nostalgic saw chord pads
  startSynthwaveLoop() {
    const tempo = 120;
    const stepTime = (60 / tempo) / 2; // 8th notes ~250ms
    const bassNotes = [110, 110, 130.81, 130.81, 98, 98, 123.47, 123.47]; // A2, C3, G2, B2
    const padChords = [
      [220, 261.63, 329.63], // Am
      [174.61, 220, 261.63], // F
      [196, 246.94, 293.66], // G
      [164.81, 196, 246.94], // Em
    ];

    this.playSynthPad(padChords[0], 2.0);

    this.intervalId = setInterval(() => {
      if (!this.isPlaying) return;

      // Bass pulse
      const noteFreq = bassNotes[this.step % bassNotes.length];
      this.triggerSynthBass(noteFreq, stepTime * 0.85);

      // Pad trigger every 8 steps
      if (this.step % 8 === 0) {
        const chordIndex = Math.floor(this.step / 8) % padChords.length;
        this.playSynthPad(padChords[chordIndex], stepTime * 7.5);
      }

      // Snare on 2 & 4
      if (this.step % 4 === 2) {
        this.triggerSnare();
      }

      // Hi-hat on every 8th
      if (this.step % 2 === 1) {
        this.triggerHihat();
      }

      this.step++;
    }, stepTime * 1000);
  }

  // 2. Ambient Chill Engine: Warm shimmering sine pads + lo-fi bells
  startAmbientLoop() {
    const tempo = 90;
    const stepTime = (60 / tempo);
    const chords = [
      [130.81, 196.00, 246.94, 329.63], // Cmaj7
      [146.83, 220.00, 261.63, 349.23], // Dm7
      [164.81, 246.94, 293.66, 392.00], // Em7
      [174.61, 261.63, 329.63, 440.00], // Fmaj7
    ];
    const bellPitches = [523.25, 659.25, 783.99, 987.77, 1046.50];

    this.intervalId = setInterval(() => {
      if (!this.isPlaying) return;

      if (this.step % 4 === 0) {
        const chord = chords[Math.floor(this.step / 4) % chords.length];
        this.playWarmAmbientPad(chord, stepTime * 3.8);
      }

      // Random bell arpeggios
      if (Math.random() > 0.4) {
        const pitch = bellPitches[Math.floor(Math.random() * bellPitches.length)];
        this.triggerCrystalBell(pitch);
      }

      this.step++;
    }, stepTime * 1000);
  }

  // 3. Cyber Electro Engine: Punchy kick, syncopated saw leads, futuristic glitch
  startCyberLoop() {
    const tempo = 128;
    const stepTime = (60 / tempo) / 4; // 16th notes
    const arpNotes = [146.83, 174.61, 220, 293.66, 349.23, 440, 293.66, 220];

    this.intervalId = setInterval(() => {
      if (!this.isPlaying) return;

      // Punchy kick on beat 1, 5, 9, 13
      if (this.step % 4 === 0) {
        this.triggerCyberKick();
      }

      // Snare on 4, 12
      if (this.step % 8 === 4) {
        this.triggerSnare();
      }

      // Arpeggio lead
      const freq = arpNotes[this.step % arpNotes.length];
      this.triggerCyberLead(freq, stepTime * 0.7);

      this.step++;
    }, stepTime * 1000);
  }

  // Instrument Generators
  triggerSynthBass(freq, duration) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(4, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playSynthPad(chordFreqs, duration) {
    if (!this.ctx) return;
    chordFreqs.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(600, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + duration * 0.5);

      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    });
  }

  playWarmAmbientPad(chordFreqs, duration) {
    if (!this.ctx) return;
    chordFreqs.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    });
  }

  triggerCrystalBell(freq) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 1.2);
  }

  triggerCyberKick() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  triggerSnare() {
    if (!this.ctx) return;
    // Noise buffer for snare snap
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
  }

  triggerHihat() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 7000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
  }

  triggerCyberLead(freq, duration) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(freq * 1.5, this.ctx.currentTime);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  setVolume(volume) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(volume, 1)) * 0.25, this.ctx.currentTime);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isPlaying = false;
  }
}

export const audioSynth = new AudioSynthEngine();
