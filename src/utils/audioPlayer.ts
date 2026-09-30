// Resilient Audio player for Expo SDK 57 / Expo Go compatibility
let ExpoAudio: any = null;
let ExpoAVAudio: any = null;

try {
  ExpoAudio = require('expo-audio');
} catch (e) {
  // Ignore
}

try {
  ExpoAVAudio = require('expo-av')?.Audio;
} catch (e) {
  // Ignore
}

export const safeSetAudioMode = async () => {
  try {
    if (ExpoAudio?.setAudioModeAsync) {
      await ExpoAudio.setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
      });
    } else if (ExpoAVAudio?.setAudioModeAsync) {
      await ExpoAVAudio.setAudioModeAsync({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
      });
    }
  } catch (e) {
    console.warn('Audio mode setup:', e);
  }
};

export const safeCreateSound = async (uri: string, onStatusUpdate?: (status: any) => void) => {
  // 1. Try Expo SDK 57 expo-audio (supported in Expo Go SDK 57)
  if (ExpoAudio?.createAudioPlayer) {
    try {
      const player = ExpoAudio.createAudioPlayer(uri);
      
      // Adapt player to unified sound interface
      const adaptedSound = {
        _player: player,
        playAsync: async () => player.play(),
        pauseAsync: async () => player.pause(),
        unloadAsync: async () => {
          try {
            player.pause();
            player.release?.();
          } catch (_) {}
        },
        setPositionAsync: async (positionMillis: number) => {
          player.seekTo?.(positionMillis / 1000);
        },
      };

      if (onStatusUpdate) {
        player.addListener?.('playbackStatusUpdate', (status: any) => {
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
    } catch (err) {
      console.warn('expo-audio failed, falling back to expo-av', err);
    }
  }

  // 2. Fall back to legacy expo-av if present
  if (ExpoAVAudio?.Sound) {
    return await ExpoAVAudio.Sound.createAsync(
      { uri },
      { shouldPlay: true },
      onStatusUpdate
    );
  }

  throw new Error('No audio engine available in current environment.');
};
