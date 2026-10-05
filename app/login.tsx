import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

type LoginStep = 'email' | 'otp';

export default function LoginScreen() {
  const { signIn, verifyOtp } = useAuth();
  const [step, setStep]         = useState<LoginStep>('email');
  const [email, setEmail]       = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp]           = useState('');
  const [loading, setLoading]   = useState(false);

  // Animated slide for step transitions
  const slideAnim = useRef(new Animated.Value(0)).current;

  const slideToOtp = () => {
    Animated.timing(slideAnim, {
      toValue: -400,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setStep('otp');
      slideAnim.setValue(400);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const slideBack = () => {
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setStep('email');
      setOtp('');
      slideAnim.setValue(-400);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  // Direct Login (OTP verification bypassed for now)
  const handleSendOtp = async () => {
    if (!email.trim() || !fullName.trim()) {
      Alert.alert('Missing Fields', 'Please enter both your full name and email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), fullName.trim());
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Unable to sign in. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP (Fallback)
  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      await verifyOtp(otp.trim() || '123456');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Sign in failed. Please try again.';
      Alert.alert('Verification Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await signIn(email.trim(), fullName.trim());
    } catch (error: any) {
      Alert.alert('Error', 'Could not sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[Colors.surface, '#fff4e6', '#ffe8cc']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="sparkles" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Hindu Mantras</Text>
          <Text style={styles.subtitle}>Find your inner peace and connect with the divine.</Text>
        </View>

        <Animated.View style={[styles.formContainer, { transform: [{ translateX: slideAnim }] }]}>

          {step === 'email' ? (
            /* ── Step 1: Email + Name ── */
            <>
              <Text style={styles.stepLabel}>
                <Ionicons name="person-circle-outline" size={15} color={Colors.primary} /> Enter Details to Begin
              </Text>

              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#A0A0A0"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>

              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#A0A0A0"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity style={styles.loginButton} onPress={handleSendOtp} disabled={loading} activeOpacity={0.8}>
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Begin Journey</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginTop: 20, alignItems: 'center', minHeight: 44, justifyContent: 'center' }}
                onPress={() => require('expo-router').router.push('/privacy')}
                accessibilityRole="link"
                accessibilityLabel="View Privacy Policy"
              >
                <Text style={{ fontSize: 13, color: Colors.textSecondary, textDecorationLine: 'underline' }}>
                  By proceeding, you agree to our Privacy Policy
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            /* ── Step 2: OTP Verification ── */
            <>
              <TouchableOpacity style={styles.backButton} onPress={slideBack}>
                <Ionicons name="arrow-back" size={20} color={Colors.primary} />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>

              <Text style={styles.stepLabel}>
                <Ionicons name="shield-checkmark-outline" size={15} color={Colors.primary} /> Step 2 of 2 — Verify Code
              </Text>
              <Text style={styles.otpHint}>
                We sent a 6-digit code to{'\n'}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>

              <Text style={styles.label}>Verification Code</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="key-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor="#A0A0A0"
                  value={otp}
                  onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>

              <TouchableOpacity style={styles.loginButton} onPress={handleVerifyOtp} disabled={loading || otp.length < 6} activeOpacity={0.8}>
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Verify & Begin Journey</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.resendButton} onPress={handleResend} disabled={loading}>
                <Text style={styles.resendText}>Didn't receive it? <Text style={styles.resendAction}>Resend Code</Text></Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formContainer: { width: '100%' },
  stepLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  otpHint: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  emailHighlight: {
    fontWeight: '700',
    color: Colors.text,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: Colors.text,
  },
  otpInput: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 6,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  backText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  resendText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  resendAction: {
    color: Colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
