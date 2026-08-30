/**
 * Sound Utility for Rozi Application
 * Provides sound effects for Notifications and AI Chatbot Assistant.
 * Uses Web Audio API synthesis for zero-dependency instant playback,
 * with support for custom audio files in /public/sounds/ when provided.
 */

// Custom audio file paths (stored in public/sounds/)
const AUDIO_PATHS = {
  notification: "/sounds/notification.mp3",
  message_sent: "/sounds/sent.mp3",
  message_received: "/sounds/receive.mp3",
  pop: "/sounds/pop.mp3",
};

// Cache for loaded HTML5 Audio objects
const audioCache = {};

// Helper to check if sound is muted globally
export const isSoundEnabled = () => {
  return localStorage.getItem("rozi_sound_enabled") !== "false";
};

export const setSoundEnabled = (enabled) => {
  localStorage.setItem("rozi_sound_enabled", enabled ? "true" : "false");
};

/**
 * Web Audio API Tones for instant zero-asset playback.
 * Automatically used as fallback if mp3 files are absent or fail to load.
 */
function playSynthSound(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "notification") {
      // Pleasant double chime (E5 -> B5)
      const now = ctx.currentTime;
      [
        { freq: 659.25, time: 0 },
        { freq: 987.77, time: 0.12 },
      ].forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + time);
        gain.gain.setValueAtTime(0.12, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + time);
        osc.stop(now + time + 0.35);
      });
    } else if (type === "message_sent") {
      // Soft ascending swoosh / pop (C5 -> G5)
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === "message_received") {
      // Gentle AI response arrival melody (G4 -> B4 -> E5)
      const now = ctx.currentTime;
      [
        { freq: 392.0, time: 0 },
        { freq: 493.88, time: 0.08 },
        { freq: 659.25, time: 0.16 },
      ].forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + time);
        gain.gain.setValueAtTime(0.1, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + time);
        osc.stop(now + time + 0.25);
      });
    } else if (type === "pop") {
      // Crisp click / toggle sound
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch (err) {
    // Ignore audio context autoplay restrictions gracefully
  }
}

/**
 * Play a sound effect by name.
 * @param {'notification' | 'message_sent' | 'message_received' | 'pop'} soundName 
 * @param {number} [volume=0.5] 
 */
export const playSound = (soundName, volume = 0.5) => {
  if (!isSoundEnabled()) return;

  const path = AUDIO_PATHS[soundName];

  // Try playing audio file if available
  if (path) {
    if (!audioCache[soundName]) {
      const audio = new Audio(path);
      audioCache[soundName] = audio;
    }
    const audio = audioCache[soundName];
    audio.volume = volume;
    audio.currentTime = 0;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback to Web Audio API synth if mp3 file is missing or blocked
        playSynthSound(soundName);
      });
      return;
    }
  }

  // Direct synth playback
  playSynthSound(soundName);
};
