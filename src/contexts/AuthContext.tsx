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
  sendOtp: (email: string, fullName: string) => Promise<boolean>;
  verifyOtp: (otp: string, fullName?: string) => Promise<void>;
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
        // Secure fallback using cryptographically secure UUID
        deviceId = 'device_' + cryptoRandomUUID();
      }
      await SecureStore.setItemAsync('device_id', deviceId);
    }
    return deviceId;
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('user');
    await SecureStore.deleteItemAsync('token');
    setPendingEmail(null);
    setUser(null);
  };

  const loadStorageData = async () => {
    try {
      const storedUser = await SecureStore.getItemAsync('user');
      const token      = await SecureStore.getItemAsync('token');
      const deviceId   = await getDeviceId();

      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);

        setUser(parsedUser);
        setLoading(false);

        // Background verify session if not guest and if server-issued token (64 hex characters)
        const isServerSession = token && /^[a-f0-9]{64}$/i.test(token);
        if (!parsedUser.is_guest && isServerSession) {
          try {
            const verifyRes = await api.auth.verifySession(parsedUser.id, token, deviceId);
            if (verifyRes && verifyRes.is_valid === false) {
              setSessionError(verifyRes.message || 'Session expired.');
              await signOut();
            }
          } catch (apiError) {
            log('Session verification network notice:', apiError);
          }
        }
        return;
      }
    } catch (error) {
      log('Storage read error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStorageData();
  }, []);

  const checkSession = async () => {
    await loadStorageData();
  };

  /**
   * Step 1: Send OTP to Devotee Email
   */
  const sendOtp = async (email: string, fullName: string): Promise<boolean> => {
    setSessionError(null);
    setPendingEmail(email);

    try {
      await api.auth.sendOtp(email, fullName);
      return true;
    } catch (err: any) {
      log('sendOtp network notice:', err);
      // Propagate explicit server errors (e.g., 429 rate limits or 400 validation)
      if (err?.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      // If offline or network error, allow proceeding to OTP step for offline/sandbox test
      return true;
    }
  };

  /**
   * Step 2: Verify 6-digit OTP code & establish session
   */
  const verifyOtp = async (otp: string, fullName?: string): Promise<void> => {
    const targetEmail = pendingEmail;
    if (!targetEmail) {
      throw new Error('Email verification context missing. Please enter your email again.');
    }
    const deviceId = await getDeviceId();
    const deviceName = Device.modelName || 'Mobile Devotee Device';

    try {
      const res = await api.auth.verifyOtp(targetEmail, otp, deviceId, deviceName);
      const token = res?.session?.token || res?.token;
      if (res && token && res.user) {
        const verifiedUser = { ...res.user, is_guest: false };
        await SecureStore.setItemAsync('user', JSON.stringify(verifiedUser));
        await SecureStore.setItemAsync('token', token);
        setPendingEmail(null);
        setUser(verifiedUser);

        try {
          const { syncManager } = require('../services/syncManager');
          syncManager.syncJaapLogs();
        } catch (_) {}
        return;
      }
      throw new Error(res?.message || 'Verification failed. Please check the code.');
    } catch (err: any) {
      log('Server OTP verification notice:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Verification failed. Please check the code.';
      throw new Error(errorMsg);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      pendingEmail,
      sendOtp,
      verifyOtp,
      signOut,
      checkSession,
      sessionError,
    }}>
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
