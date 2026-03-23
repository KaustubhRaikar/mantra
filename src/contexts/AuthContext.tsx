import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { api } from '../services/api';

interface AuthContextData {
  user: any;
  loading: boolean;
  signIn: (email: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  sessionError: string | null;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    loadStorageData();
  }, []);

  const getDeviceId = async () => {
    let deviceId = await SecureStore.getItemAsync('device_id');
    if (!deviceId) {
      if (Platform.OS === 'android') {
        deviceId = Application.getAndroidId();
      } else {
        deviceId = await Application.getIosIdForVendorAsync();
      }
      
      if (!deviceId) {
        // Fallback for emulators/weird devices
        deviceId = 'device_' + Math.random().toString(36).substring(7);
      }
      await SecureStore.setItemAsync('device_id', deviceId);
    }
    return deviceId;
  };

  const getDeviceName = () => {
    return `${Device.brand || 'Unknown'} ${Device.modelName || 'Device'}`;
  };

  const loadStorageData = async () => {
    try {
      const storedUser = await SecureStore.getItemAsync('user');
      const token = await SecureStore.getItemAsync('token');
      const deviceId = await getDeviceId();

      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        
        // Optimistically set the user to skip the login page immediately
        setUser(parsedUser);
        setLoading(false);
        
        // Background verify session
        try {
          const verifyRes = await api.auth.verifySession(parsedUser.id, token, deviceId);
          if (verifyRes && verifyRes.is_valid === false) {
             // We've been logged out from another device or session is invalid!
             setSessionError(verifyRes.message || "Session expired.");
             await signOut();
          }
        } catch (apiError) {
          console.log('Session verification fail or network error:', apiError);
        }
        return;
      }
    } catch (error) {
      console.log('Storage read error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    // Explicitly check session (useful for app foreground events if needed)
    await loadStorageData();
  }

  const signIn = async (email: string, fullName: string) => {
    try {
      setSessionError(null);
      const StringDeviceId = await getDeviceId();
      const StringDeviceName = getDeviceName();

      const response = await api.auth.login(email, fullName, StringDeviceId, StringDeviceName);
      
      if (response && response.session && response.user) {
        await SecureStore.setItemAsync('user', JSON.stringify(response.user));
        await SecureStore.setItemAsync('token', response.session.token);
        
        setUser(response.user);
      } else {
         throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error('Sign In Error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('user');
    await SecureStore.deleteItemAsync('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, checkSession, sessionError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
