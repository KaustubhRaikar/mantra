import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { CosmicBackground } from '../src/components/CosmicBackground';
import { GlassCard } from '../src/components/GlassCard';
import { SpiritualButton } from '../src/components/SpiritualButton';
import { useRouter } from 'expo-router';

type LoginStep = 'email' | 'otp';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, verifyOtp } = useAuth();
  const [step, setStep] = useState<LoginStep>('email');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const slideToOtp = () => {
    Animated.timing(slideAnim, {
      toValue: -400,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setStep('otp');
      slideAnim.setValue(400);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  const slideBack = () => {
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setStep('email');
      setOtp('');
      slideAnim.setValue(-400);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

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
      <CosmicBackground />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* Sacred Branding */}
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.omBig}>ॐ</Text>
          </View>
          <Text style={styles.title} maxFontSizeMultiplier={1.3}>
            MANTRA
          </Text>
          <Text style={styles.subtitle} maxFontSizeMultiplier={1.3}>
            Connect with the Divine & Find Inner Serenity
          </Text>
        </View>

        {/* Auth Glass Card */}
        <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
          <GlassCard style={styles.authCard} glow>
            {step === 'email' ? (
              <>
                <Text style={styles.stepLabel}>
                  <Ionicons name="sparkles" size={14} color={Colors.primary} /> Devotee Registration
                </Text>

                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={18} color={Colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your sacred name"
                    placeholderTextColor={Colors.textMuted}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    maxFontSizeMultiplier={1.3}
                  />
                </View>

                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={18} color={Colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="devotee@sanctuary.in"
                    placeholderTextColor={Colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxFontSizeMultiplier={1.3}
                  />
                </View>

                <View style={{ marginTop: Spacing.standard }}>
                  <SpiritualButton
                    title="Begin Spiritual Journey"
                    onPress={handleSendOtp}
                    loading={loading}
                    variant="primary"
                  />
                </View>

                <TouchableOpacity
                  style={styles.policyLink}
                  onPress={() => router.push('/privacy')}
                  accessibilityRole="link"
                  accessibilityLabel="Read Privacy Policy"
                >
                  <Text style={styles.policyText}>
                    By proceeding, you agree to our DPDP Privacy Policy
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.backButton} onPress={slideBack}>
                  <Ionicons name="chevron-back" size={18} color={Colors.primary} />
                  <Text style={styles.backText}>Change Details</Text>
                </TouchableOpacity>

                <Text style={styles.stepLabel}>
                  <Ionicons name="shield-checkmark" size={14} color={Colors.primary} /> Step 2: Verification Code
                </Text>
                <Text style={styles.otpHint}>
                  We sent a 6-digit code to{'\n'}
                  <Text style={styles.emailHighlight}>{email}</Text>
                </Text>

                <Text style={styles.label}>Verification Code</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="key-outline" size={18} color={Colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="123456"
                    placeholderTextColor={Colors.textMuted}
                    value={otp}
                    onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                    maxFontSizeMultiplier={1.3}
                  />
                </View>

                <View style={{ marginTop: Spacing.standard }}>
                  <SpiritualButton
                    title="Verify & Enter Sanctuary"
                    onPress={handleVerifyOtp}
                    loading={loading}
                    disabled={otp.length < 6}
                    variant="primary"
                  />
                </View>

                <TouchableOpacity style={styles.resendButton} onPress={handleResend} disabled={loading}>
                  <Text style={styles.resendText}>
                    Didn't receive it? <Text style={styles.resendAction}>Resend Code</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </GlassCard>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.large,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.large,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 153, 51, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 51, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.compact,
  },
  omBig: {
    fontFamily: Typography.families.devanagari,
    fontSize: 40,
    color: Colors.primary,
  },
  title: {
    fontFamily: Typography.families.heading,
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: Typography.families.body,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  authCard: {
    padding: Spacing.large,
    borderRadius: Radius.xl,
  },
  stepLabel: {
    fontFamily: Typography.families.heading,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.standard,
  },
  label: {
    fontFamily: Typography.families.body,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.standard,
    height: 48,
    marginBottom: Spacing.standard,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: Typography.families.body,
    fontSize: 15,
    color: Colors.text,
    height: '100%',
  },
  otpInput: {
    letterSpacing: 6,
    fontSize: 18,
    fontWeight: '700',
  },
  policyLink: {
    marginTop: Spacing.standard,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  policyText: {
    fontSize: 12,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.standard,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 4,
  },
  otpHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.standard,
    lineHeight: 18,
  },
  emailHighlight: {
    color: Colors.primary,
    fontWeight: '700',
  },
  resendButton: {
    marginTop: Spacing.standard,
    alignItems: 'center',
    padding: Spacing.compact,
  },
  resendText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  resendAction: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
