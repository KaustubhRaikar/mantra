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

/**
 * Uses native device TTS via expo-speech with devotional pitch & rate tuning
 */
export const playWithExpoSpeech = (
  text: string,
  onStatusUpdate?: (status: any) => void
) => {
  const cleanText = text.replace(/[\n\r]+/g, ' ').trim() || 'Om Namah Shivaya';
  let isSpeaking = true;
  let timerId: any = null;
  let elapsed = 0;

  // Estimate duration based on word count & calm chanting rate (0.82)
  const words = cleanText.split(/\s+/).length;
  const estimatedDurationSec = Math.max(6, Math.ceil(words * 0.85));

  try {
    Speech.stop();
  } catch (_) {}

  const startTime = Date.now();
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
        didJustFinish: false,
      });
    }
  }, 250);

  Speech.speak(cleanText, {
    language: 'hi-IN',
    pitch: 0.92, // Calmer, slightly deeper devotional tone
    rate: 0.82,  // Slower chanting rhythm
    onDone: () => {
      isSpeaking = false;
      if (timerId) clearInterval(timerId);
      if (onStatusUpdate) {
        onStatusUpdate({
          isLoaded: true,
          isPlaying: false,
          positionMillis: estimatedDurationSec * 1000,
          durationMillis: estimatedDurationSec * 1000,
          didJustFinish: true,
        });
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

  return {
    _player: null,
    playAsync: async () => {
      if (!isSpeaking) {
        playWithExpoSpeech(text, onStatusUpdate);
      }
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
  };
};

export const safeCreateSound = async (input: any, onStatusUpdate?: (status: any) => void) => {
  const textToSpeak = typeof input === 'object'
    ? (input.sanskrit_title || input.sanskrit || input.sanskrit_text || input.title || input.name || '')
    : String(input || '');

  const rawUrl = typeof input === 'object' ? (input.audio_url || '') : '';

  // 1. If a valid remote .mp3 file is uploaded on Hostinger server, try expo-audio first
  if (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) && !rawUrl.includes('translate.google.com')) {
    try {
      const player: any = createAudioPlayer(rawUrl);
      const adaptedSound = {
        _player: player,
        playAsync: async () => { player.play(); },
        pauseAsync: async () => { player.pause(); },
        unloadAsync: async () => {
          try {
            player.pause();
            if (typeof player.remove === 'function') player.remove();
          } catch (_) {}
        },
        setPositionAsync: async (positionMillis: number) => {
          if (typeof player.seekTo === 'function') await player.seekTo(positionMillis / 1000);
        },
      };

      if (onStatusUpdate && typeof player.addListener === 'function') {
        player.addListener('playbackStatusUpdate', (status: any) => {
          onStatusUpdate({
            isLoaded: true,
            isPlaying: status?.playing ?? false,
            positionMillis: (status?.currentTime || 0) * 1000,
            durationMillis: (status?.duration || 108) * 1000,
            didJustFinish: status?.didJustFinish ?? false,
          });
        });
      }

      player.play();
      return { sound: adaptedSound };
    } catch (e) {
      console.warn('Fallback to native expo-speech as audio player failed:', e);
    }
  }

  // 2. Default to Native Device Expo Speech Engine
  const speechSound = playWithExpoSpeech(textToSpeak || 'Om Namah Shivaya', onStatusUpdate);
  return { sound: speechSound };
};
