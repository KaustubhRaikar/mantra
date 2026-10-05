import * as FileSystem from 'expo-file-system/legacy';

const AUDIO_DIR = `${FileSystem.documentDirectory}offline_audio/`;

export const ensureAudioDir = async () => {
  const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(AUDIO_DIR, { intermediates: true });
  }
};

export const getLocalAudioUri = async (remoteUrl: string): Promise<string | null> => {
  if (!remoteUrl) return null;
  try {
    await ensureAudioDir();
    const filename = remoteUrl.split('/').pop() || `audio_${Date.now()}.mp3`;
    const localUri = `${AUDIO_DIR}${filename}`;
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (fileInfo.exists) {
      return localUri;
    }
  } catch {
    // Ignore error
  }
  return null;
};

export const downloadAudioForOffline = async (remoteUrl: string): Promise<string | null> => {
  if (!remoteUrl) return null;
  try {
    await ensureAudioDir();
    const filename = remoteUrl.split('/').pop() || `audio_${Date.now()}.mp3`;
    const localUri = `${AUDIO_DIR}${filename}`;

    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (fileInfo.exists) {
      return localUri;
    }

    const downloadRes = await FileSystem.downloadAsync(remoteUrl, localUri);
    if (downloadRes.status === 200) {
      return downloadRes.uri;
    }
  } catch (err) {
    console.warn('Failed to download audio for offline:', err);
  }
  return null;
};

export const removeOfflineAudio = async (remoteUrl: string): Promise<void> => {
  if (!remoteUrl) return;
  try {
    const filename = remoteUrl.split('/').pop() || '';
    if (!filename) return;
    const localUri = `${AUDIO_DIR}${filename}`;
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(localUri);
    }
  } catch (err) {
    console.warn('Failed to delete offline audio:', err);
  }
};
