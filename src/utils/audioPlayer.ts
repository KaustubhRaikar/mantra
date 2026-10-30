import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Speech from 'expo-speech';

export const safeSetAudioMode = async () => {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    });
  } catch (e) {
    console.warn('Audio mode setup:', e);
  }
};

let cachedVoiceIdentifier: string | undefined = undefined;
let isVoiceInitialized = false;

/**
 * Discovers the highest quality natural/neural human-like voice available on the device
 * (e.g., Google WaveNet / Neural2 voices on Android, Apple Enhanced Siri voices on iOS)
 */
export const getBestDevotionalVoice = async (): Promise<string | undefined> => {
  if (isVoiceInitialized) return cachedVoiceIdentifier;

  try {
    const voices = await Speech.getAvailableVoicesAsync();
    if (!voices || voices.length === 0) {
      isVoiceInitialized = true;
      return undefined;
    }

    // 1. Filter for Hindi / Sanskrit voices
    const indicVoices = voices.filter(
      (v) =>
        v.language &&
        (v.language.toLowerCase().startsWith('hi') ||
          v.language.toLowerCase().startsWith('sa'))
    );

    const candidates = indicVoices.length > 0 ? indicVoices : voices;

    // 2. Prioritize Enhanced quality or Neural/Network voices
    const neuralVoice = candidates.find(
      (v) =>
        (v.quality && String(v.quality).toLowerCase() === 'enhanced') ||
        (v.identifier && /neural|network|wavenet|studio|natural|enhanced/i.test(v.identifier)) ||
        (v.name && /neural|network|wavenet|studio|natural|enhanced/i.test(v.name))
    );

    if (neuralVoice) {
      cachedVoiceIdentifier = neuralVoice.identifier;
    } else if (indicVoices.length > 0) {
      // Pick first Indic voice
      cachedVoiceIdentifier = indicVoices[0].identifier;
    }

    isVoiceInitialized = true;
    return cachedVoiceIdentifier;
  } catch (e) {
    console.warn('Voice discovery error:', e);
    isVoiceInitialized = true;
    return undefined;
  }
};

/**
 * Validates whether a string is a remote audio file or relative path
 */
export const resolveAudioUrl = (url?: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Never treat plain text or JSON as audio URL
  if (trimmed.startsWith('[') || trimmed.startsWith('{') || trimmed.includes(' ')) {
    return null;
  }

  // Prepend backend host for relative server uploads
  if (trimmed.startsWith('/uploads') || trimmed.startsWith('uploads/')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `https://mantra.aarambhtech.in${cleanPath}`;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return null;
};

const GENERIC_LABELS = [
  'mantra details',
  'mantra detail',
  'aarti details',
  'aarti sangrah',
  'stotra details',
  'stotra recitation',
  'pooja vidhi',
  'vrat katha',
  'details',
  'untitled',
  'undefined',
  'null',
];

/**
 * Sanitizes input text so TTS NEVER reads out URLs, paths, JSON brackets, or generic UI labels.
 */
export const sanitizeDevotionalText = (rawText: string, fallbackTitle?: string): string => {
  const isGeneric = (str?: string) => {
    if (!str || typeof str !== 'string') return true;
    const lower = str.trim().toLowerCase();
    return GENERIC_LABELS.some((lbl) => lower === lbl || lower.includes('details'));
  };

  let candidate = (rawText && typeof rawText === 'string') ? rawText.trim() : '';

  // Discard generic candidate
  if (isGeneric(candidate)) {
    candidate = '';
  }

  // Discard URL, file path, or audio extension candidates
  if (
    candidate.startsWith('http://') ||
    candidate.startsWith('https://') ||
    candidate.startsWith('file://') ||
    candidate.startsWith('/') ||
    /\.(mp3|wav|m4a|aac|ogg|json)$/i.test(candidate)
  ) {
    candidate = '';
  }

  if (!candidate) {
    if (fallbackTitle && !isGeneric(fallbackTitle)) {
      candidate = fallbackTitle.trim();
    } else {
      return 'ॐ नमः शिवाय';
    }
  }

  // Clean brackets, code snippets, or excessive punctuation
  const clean = candidate
    .replace(/\[.*?\]/g, ' ')
    .replace(/\{.*?\}/g, ' ')
    .replace(/[\n\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return clean && !isGeneric(clean) ? clean : 'ॐ नमः शिवाय';
};

/**
 * Uses native device TTS with highest quality natural human-like voice and devotional tuning
 */
export const playWithExpoSpeech = (
  text: string,
  onStatusUpdate?: (status: any) => void,
  fallbackTitle?: string,
  repeatCount: number = 1
) => {
  const cleanText = sanitizeDevotionalText(text, fallbackTitle);
  let isSpeaking = true;
  let timerId: any = null;
  let elapsed = 0;
  let currentCycle = 1;
  const targetCycles = repeatCount <= 0 ? Infinity : repeatCount;

  // Estimate duration based on word count & calm chanting rate (0.82)
  const words = cleanText.split(/\s+/).length;
  const estimatedDurationSec = Math.max(5, Math.ceil(words * 0.82));

  try {
    Speech.stop();
  } catch (_) {}

  const startChantCycle = async () => {
    const voiceId = await getBestDevotionalVoice();
    const startTime = Date.now();

    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
      if (!isSpeaking) {
        if (timerId) clearInterval(timerId);
        return;
      }
      elapsed = (Date.now() - startTime) / 1000;
      const progressSec = Math.min(elapsed, estimatedDurationSec);
      if (onStatusUpdate) {
        onStatusUpdate({
          isLoaded: true,
          isPlaying: true,
          positionMillis: progressSec * 1000,
          durationMillis: estimatedDurationSec * 1000,
          currentCycle,
          targetCycles,
          didJustFinish: false,
        });
      }
    }, 250);

    Speech.speak(cleanText, {
      language: 'hi-IN',
      voice: voiceId,
      pitch: 0.95, // Calmer, resonant devotional tone
      rate: 0.80,  // Reverent, slower chanting rhythm
      onDone: () => {
        if (!isSpeaking) return;

        if (currentCycle < targetCycles) {
          currentCycle++;
          elapsed = 0;
          if (onStatusUpdate) {
            onStatusUpdate({
              isLoaded: true,
              isPlaying: true,
              positionMillis: 0,
              durationMillis: estimatedDurationSec * 1000,
              currentCycle,
              targetCycles,
              didJustFinish: false,
            });
          }
          // Brief sacred pause before next repetition
          setTimeout(() => {
            if (isSpeaking) startChantCycle();
          }, 600);
        } else {
          isSpeaking = false;
          if (timerId) clearInterval(timerId);
          if (onStatusUpdate) {
            onStatusUpdate({
              isLoaded: true,
              isPlaying: false,
              positionMillis: estimatedDurationSec * 1000,
              durationMillis: estimatedDurationSec * 1000,
              currentCycle,
              targetCycles,
              didJustFinish: true,
            });
          }
        }
      },
      onStopped: () => {
        isSpeaking = false;
        if (timerId) clearInterval(timerId);
        if (onStatusUpdate) {
          onStatusUpdate({
            isLoaded: true,
            isPlaying: false,
            positionMillis: elapsed * 1000,
            durationMillis: estimatedDurationSec * 1000,
            currentCycle,
            targetCycles,
            didJustFinish: false,
          });
        }
      },
      onError: (err) => {
        console.warn('Expo Speech Error:', err);
        isSpeaking = false;
        if (timerId) clearInterval(timerId);
      },
    });
  };

  startChantCycle();

  return {
    _player: null,
    playAsync: async () => {
      isSpeaking = true;
      startChantCycle();
    },
    pauseAsync: async () => {
      isSpeaking = false;
      if (timerId) clearInterval(timerId);
      try {
        await Speech.stop();
      } catch (_) {}
      if (onStatusUpdate) {
        onStatusUpdate({
          isLoaded: true,
          isPlaying: false,
          positionMillis: elapsed * 1000,
          durationMillis: estimatedDurationSec * 1000,
          currentCycle,
          targetCycles,
          didJustFinish: false,
        });
      }
    },
    unloadAsync: async () => {
      isSpeaking = false;
      if (timerId) clearInterval(timerId);
      try {
        await Speech.stop();
      } catch (_) {}
    },
    setPositionAsync: async (positionMillis: number) => {
      elapsed = positionMillis / 1000;
    },
    setIsLoopingAsync: async (_isLooping: boolean) => {
      // Loop handled via cycle tracking
    },
  };
};

/**
 * Creates audio sound instance or natural speech synthesis.
 * Strictly guarantees that audio URLs and file paths are NEVER spoken aloud.
 */
export const safeCreateSound = async (
  input: any,
  onStatusUpdate?: (status: any) => void,
  options?: { repeatCount?: number; forceSpeech?: boolean }
) => {
  let rawUrl: string | null = null;
  let textToSpeak = '';
  let titleFallback = '';

  if (typeof input === 'string') {
    rawUrl = resolveAudioUrl(input);
    if (!rawUrl) {
      textToSpeak = input;
    }
  } else if (input && typeof input === 'object') {
    rawUrl = resolveAudioUrl(input.audio_url || input.audioUrl || input.audio);
    textToSpeak =
      input.textToSpeak ||
      input.activeTabText ||
      input.sanskrit ||
      input.sanskrit_text ||
      input.sanskrit_title ||
      input.lyrics ||
      input.verse ||
      '';
    titleFallback = input.deityName || input.title || input.name || input.vidhi_name || '';
  }

  const repeatCount = options?.repeatCount ?? 1;

  // 1. If genuine remote MP3/audio is available and speech is not forced, use expo-audio
  if (rawUrl && !options?.forceSpeech) {
    try {
      const player: any = createAudioPlayer(rawUrl);
      let currentCycle = 1;
      const targetCycles = repeatCount <= 0 ? Infinity : repeatCount;

      const adaptedSound = {
        _player: player,
        playAsync: async () => {
          player.play();
        },
        pauseAsync: async () => {
          player.pause();
        },
        unloadAsync: async () => {
          try {
            player.pause();
            if (typeof player.remove === 'function') player.remove();
          } catch (_) {}
        },
        setPositionAsync: async (positionMillis: number) => {
          if (typeof player.seekTo === 'function') await player.seekTo(positionMillis / 1000);
        },
        setIsLoopingAsync: async (isLooping: boolean) => {
          try {
            if (player) player.loop = isLooping;
          } catch (_) {}
        },
      };

      if (onStatusUpdate && typeof player.addListener === 'function') {
        player.addListener('playbackStatusUpdate', (status: any) => {
          const didFinish = status?.didJustFinish ?? false;
          if (didFinish && currentCycle < targetCycles) {
            currentCycle++;
            player.seekTo(0);
            player.play();
            onStatusUpdate({
              isLoaded: true,
              isPlaying: true,
              positionMillis: 0,
              durationMillis: (status?.duration || 108) * 1000,
              currentCycle,
              targetCycles,
              didJustFinish: false,
            });
            return;
          }

          onStatusUpdate({
            isLoaded: true,
            isPlaying: status?.playing ?? false,
            positionMillis: (status?.currentTime || 0) * 1000,
            durationMillis: (status?.duration || 108) * 1000,
            currentCycle,
            targetCycles,
            didJustFinish: didFinish,
          });
        });
      }

      player.play();
      return { sound: adaptedSound, isAvailable: true };
    } catch (e) {
      console.warn('Remote audio playback failed, falling back to TTS:', e);
    }
  }

  // 2. Fallback to Natural Devanagari Voice Synthesis
  // Ensures clean text only (NEVER speaking URLs or file paths)
  const cleanMantra = sanitizeDevotionalText(textToSpeak, titleFallback);
  const speechSound = playWithExpoSpeech(cleanMantra, onStatusUpdate, titleFallback, repeatCount);
  return { sound: speechSound, isAvailable: true };
};
