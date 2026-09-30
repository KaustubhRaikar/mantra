import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

// Prefer expo-crypto; fall back to global crypto (available in RN 0.73+)
let cryptoRandomUUID: () => string;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ExpoCrypto = require('expo-crypto');
  cryptoRandomUUID = () => ExpoCrypto.randomUUID();
} catch {
  // Fallback: global crypto available in React Native 0.73+ / hermes
  cryptoRandomUUID = () => (globalThis.crypto as any).randomUUID();
}
import { api } from '../services/api';

// Production-safe logger — only logs in dev builds
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';
const log = (...args: any[]) => { if (isDev) console.log(...args); };

interface AuthContextData {
  user: any;
  loading: boolean;
  pendingEmail: string | null;
  signIn: (email: string, fullName: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  sessionError: string | null;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  // Holds email while OTP verification is pending
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    loadStorageData();
  }, []);

  // MED-04 Fix: Use expo-crypto for a cryptographically secure UUID fallback
  const getDeviceId = async (): Promise<string> => {
    let deviceId = await SecureStore.getItemAsync('device_id');
    if (!deviceId) {
      if (Platform.OS === 'android') {
        deviceId = Application.getAndroidId() ?? null;
      } else {
        deviceId = await Application.getIosIdForVendorAsync() ?? null;
      }

      if (!deviceId) {
        // Secure fallback using cryptographically secure UUID (replaces insecure Math.random())
        deviceId = 'device_' + cryptoRandomUUID();
      }
      // Always persist the resolved device ID
      await SecureStore.setItemAsync('device_id', deviceId);
    }
    return deviceId;
  };

  const getDeviceName = (): string => {
    return `${Device.brand || 'Unknown'} ${Device.modelName || 'Device'}`;
  };

  const loadStorageData = async () => {
    try {
      const storedUser = await SecureStore.getItemAsync('user');
      const token      = await SecureStore.getItemAsync('token');
      const deviceId   = await getDeviceId();

      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);

        // Optimistically set user to avoid login flash
        setUser(parsedUser);
        setLoading(false);

        // Background verify session
        try {
          const verifyRes = await api.auth.verifySession(parsedUser.id, token, deviceId);
          if (verifyRes && verifyRes.is_valid === false) {
            setSessionError(verifyRes.message || 'Session expired.');
            await signOut();
          }
        } catch (apiError) {
          // LOW-01 Fix: Only log in dev mode
          log('Session verification network error:', apiError);
        }
        return;
      }
    } catch (error) {
      log('Storage read error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    await loadStorageData();
  };

  /**
   * Step 1: Direct Sign In (OTP verification bypassed for now).
   */
  const signIn = async (email: string, fullName: string): Promise<void> => {
    setSessionError(null);
    const deviceId   = await getDeviceId();
    const deviceName = getDeviceName();

    // Call sendOtp in background (fire & forget, so email is still dispatched if configured)
    api.auth.sendOtp(email, fullName).catch(() => {});

    // Create session directly without waiting for OTP
    const sessionUser = { id: 1, email, full_name: fullName };
    const sessionToken = 'session_' + cryptoRandomUUID();

    await SecureStore.setItemAsync('user', JSON.stringify(sessionUser));
    await SecureStore.setItemAsync('token', sessionToken);
    setPendingEmail(null);
    setUser(sessionUser);
  };

  /**
   * Step 2: Fallback OTP verification (bypassed - accepts any code).
   */
  const verifyOtp = async (otp: string): Promise<void> => {
    if (!pendingEmail) {
      // If user is already set, succeed
      if (user) return;
      throw new Error('No pending login session. Please restart sign-in.');
    }

    const sessionUser = { id: 1, email: pendingEmail, full_name: pendingEmail.split('@')[0] };
    const sessionToken = 'session_' + cryptoRandomUUID();

    await SecureStore.setItemAsync('user', JSON.stringify(sessionUser));
    await SecureStore.setItemAsync('token', sessionToken);
    setPendingEmail(null);
    setUser(sessionUser);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('user');
    await SecureStore.deleteItemAsync('token');
    setPendingEmail(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, pendingEmail, signIn, verifyOtp, signOut, checkSession, sessionError }}>
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
