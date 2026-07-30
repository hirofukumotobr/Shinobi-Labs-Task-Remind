import type { SoundId } from '../types';
import type { Translations } from '../i18n/translations';

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

/** Additive-synthesis instrument description: a fundamental plus weighted harmonic partials. */
interface Voice {
  harmonics: { ratio: number; gain: number }[];
  attack: number;
  release: number;
  filterFreq: number;
}

const voices = {
  classic: { harmonics: [{ ratio: 1, gain: 1 }, { ratio: 2, gain: 0.3 }], attack: 0.01, release: 0.15, filterFreq: 3000 },
  gentle: { harmonics: [{ ratio: 1, gain: 1 }, { ratio: 2, gain: 0.2 }, { ratio: 3, gain: 0.05 }], attack: 0.05, release: 0.5, filterFreq: 2000 },
  alert: { harmonics: [{ ratio: 1, gain: 1 }, { ratio: 3, gain: 0.4 }, { ratio: 5, gain: 0.2 }], attack: 0.005, release: 0.05, filterFreq: 5000 },
  digital: { harmonics: [{ ratio: 1, gain: 1 }, { ratio: 2, gain: 0.5 }, { ratio: 4, gain: 0.3 }], attack: 0.002, release: 0.03, filterFreq: 6000 },
  bell: {
    harmonics: [{ ratio: 1, gain: 1 }, { ratio: 2, gain: 0.55 }, { ratio: 2.76, gain: 0.35 }, { ratio: 5.4, gain: 0.18 }],
    attack: 0.002,
    release: 1.2,
    filterFreq: 8000,
  },
} satisfies Record<string, Voice>;

interface ActiveVoice {
  oscillators: OscillatorNode[];
  master: GainNode;
}

function playVoiceNote(ctx: AudioContext, frequency: number, duration: number, volume: number, voice: Voice): ActiveVoice {
  const now = ctx.currentTime;
  const master = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = voice.filterFreq;
  filter.connect(master);
  master.connect(ctx.destination);

  const attack = Math.min(voice.attack, Math.max(duration * 0.4, 0.001));
  const release = voice.release;
  const sustainEnd = Math.max(now + attack + 0.01, now + duration - Math.min(release, duration * 0.5));

  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(volume, now + attack);
  master.gain.setValueAtTime(volume, sustainEnd);
  master.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);

  const oscillators: OscillatorNode[] = [];
  const stopAt = now + duration + release + 0.1;

  for (const { ratio, gain } of voice.harmonics) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = frequency * ratio;

    const harmGain = ctx.createGain();
    harmGain.gain.value = gain;
    osc.connect(harmGain);
    harmGain.connect(filter);
    osc.start(now);
    osc.stop(stopAt);
    oscillators.push(osc);
  }

  return { oscillators, master };
}

function stopActiveVoice(ctx: AudioContext, active: ActiveVoice) {
  const now = ctx.currentTime;
  try {
    active.master.gain.cancelScheduledValues(now);
    active.master.gain.setValueAtTime(active.master.gain.value, now);
    active.master.gain.linearRampToValueAtTime(0.0001, now + 0.03);
  } catch {
    // gain param may already be at a fixed value
  }
  active.oscillators.forEach((osc) => {
    try {
      osc.stop(now + 0.04);
    } catch {
      // oscillator may have already ended naturally
    }
  });
}

interface PlaybackHandle {
  activeVoices: Set<ActiveVoice>;
  pendingTimeouts: Set<number>;
  stoppedRef: { current: boolean };
  ctx: AudioContext;
}

function createNoteScheduler(handle: PlaybackHandle, voice: Voice, volume: number) {
  return (frequency: number, duration: number, delaySeconds: number) => {
    const fire = () => {
      if (handle.stoppedRef.current) return;
      const active = playVoiceNote(handle.ctx, frequency, duration, volume, voice);
      handle.activeVoices.add(active);
      const cleanupMs = (duration + voice.release + 0.15) * 1000;
      window.setTimeout(() => handle.activeVoices.delete(active), cleanupMs);
    };

    if (delaySeconds > 0) {
      const id = window.setTimeout(() => {
        handle.pendingTimeouts.delete(id);
        fire();
      }, delaySeconds * 1000);
      handle.pendingTimeouts.add(id);
    } else {
      fire();
    }
  };
}

interface SoundPreset {
  cycleSeconds: number;
  play: (handle: PlaybackHandle) => void;
}

function tonePreset(
  voiceName: keyof typeof voices,
  frequency: number,
  duration: number,
  volume: number,
  cycleSeconds: number,
  hits: number[],
): SoundPreset {
  return {
    cycleSeconds,
    play: (handle) => {
      const schedule = createNoteScheduler(handle, voices[voiceName], volume);
      for (const delay of hits) schedule(frequency, duration, delay);
    },
  };
}

const soundPresets: Record<SoundId, SoundPreset> = {
  classic: tonePreset('classic', 880, 0.15, 0.28, 0.9, [0, 0.25]),
  gentle: tonePreset('gentle', 523, 0.6, 0.22, 1.4, [0]),
  alert: tonePreset('alert', 1046, 0.12, 0.22, 0.5, [0]),
  digital: tonePreset('digital', 1400, 0.07, 0.2, 0.4, [0, 0.11]),
  bell: tonePreset('bell', 660, 0.7, 0.25, 1.6, [0]),
};

export const soundIds: SoundId[] = ['classic', 'gentle', 'alert', 'digital', 'bell'];

export function getSoundLabel(id: SoundId, t: Translations): string {
  switch (id) {
    case 'gentle':
      return t.soundGentle;
    case 'alert':
      return t.soundAlert;
    case 'digital':
      return t.soundDigital;
    case 'bell':
      return t.soundBell;
    default:
      return t.soundClassic;
  }
}

export function playAlertSound(soundId: SoundId, durationSeconds = 15): () => void {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') ctx.resume();

  const preset = soundPresets[soundId] ?? soundPresets.classic;
  const handle: PlaybackHandle = {
    activeVoices: new Set(),
    pendingTimeouts: new Set(),
    stoppedRef: { current: false },
    ctx,
  };

  preset.play(handle);
  const intervalId = window.setInterval(() => preset.play(handle), preset.cycleSeconds * 1000);
  const stopIntervalId = window.setTimeout(() => window.clearInterval(intervalId), durationSeconds * 1000);
  handle.pendingTimeouts.add(stopIntervalId);

  return function stop() {
    if (handle.stoppedRef.current) return;
    handle.stoppedRef.current = true;

    window.clearInterval(intervalId);
    window.clearTimeout(stopIntervalId);
    handle.pendingTimeouts.forEach((id) => window.clearTimeout(id));
    handle.pendingTimeouts.clear();

    handle.activeVoices.forEach((voice) => stopActiveVoice(ctx, voice));
    handle.activeVoices.clear();
  };
}

export function notifyUser(title: string, body: string) {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') new Notification(title, { body });
    });
  }
}
