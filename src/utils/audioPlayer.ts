import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

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

export const safeCreateSound = async (uri: string, onStatusUpdate?: (status: any) => void) => {
  try {
    const player: any = createAudioPlayer(uri);

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
          if (typeof player.remove === 'function') {
            player.remove();
          }
        } catch (_) {}
      },
      setPositionAsync: async (positionMillis: number) => {
        if (typeof player.seekTo === 'function') {
          await player.seekTo(positionMillis / 1000);
        }
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
  } catch (err: any) {
    console.warn('expo-audio create player failed:', err);
    throw new Error(err?.message || 'Audio player could not be initialized.');
  }
};
