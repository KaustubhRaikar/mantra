import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { useTheme } from '../src/contexts/ThemeContext';
import { CosmicBackground } from '../src/components/CosmicBackground';
import { GlassCard } from '../src/components/GlassCard';
import { SpiritualButton } from '../src/components/SpiritualButton';
import { useRouter } from 'expo-router';

type LoginStep = 'email' | 'otp';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sendOtp, verifyOtp, sessionError } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();

  const [step, setStep] = useState<LoginStep>('email');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Smooth step transition animation
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Keyboard and Auto-Scroll Tracking
  const scrollRef = useRef<any>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollToInput = (offset: number) => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: offset, animated: true });
    }, 120);
  };

  // Surface any session expiration notice from AuthContext
  useEffect(() => {
    if (sessionError) {
      setErrorMessage(sessionError);
    }
  }, [sessionError]);

  // Countdown timer for resend
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const transitionToStep = (newStep: LoginStep) => {
    setErrorMessage(null);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: newStep === 'otp' ? -24 : 24,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(newStep);
      setErrorMessage(null);
      slideAnim.setValue(newStep === 'otp' ? 24 : -24);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleSendOtp = async () => {
    setErrorMessage(null);
    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter your sacred name to begin.');
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage('Please provide an email address for your sadhana account.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await sendOtp(trimmedEmail, trimmedName);
      setResendCooldown(45);
      transitionToStep('otp');
    } catch (error: any) {
      if (error?.response?.status === 429) {
        setErrorMessage('🕊️ शांतिः — Mindful pause: Please take a gentle breath for a few moments before requesting another sacred verification code.');
      } else {
        setErrorMessage(error?.response?.data?.message || error?.message || 'Unable to dispatch code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMessage(null);
    const trimmedOtp = otp.trim();

    if (trimmedOtp.length < 4) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(trimmedOtp, fullName.trim());
      router.replace('/(tabs)');
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || error?.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setErrorMessage(null);
    setLoading(true);
    try {
      await sendOtp(email.trim(), fullName.trim());
      setResendCooldown(60);
    } catch (error: any) {
      if (error?.response?.status === 429) {
        setErrorMessage('🕊️ शांतिः — Please rest for a few moments before requesting another sacred code.');
      } else {
        setErrorMessage(error?.response?.data?.message || error?.message || 'Failed to resend code. Please wait a moment.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <CosmicBackground />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top + 16, 36),
              paddingBottom: Math.max(insets.bottom + 20, 36) + (keyboardHeight > 0 ? keyboardHeight + 40 : 0),
              justifyContent: keyboardHeight > 0 ? 'flex-start' : 'center',
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          bounces={false}
        >
          <View style={styles.contentWrapper}>
            {/* Quick Theme Toggle Row */}
            <View style={styles.topActionRow}>
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                style={[
                  styles.themeToggleBtn,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                    borderColor: colors.border,
                  }
                ]}
                onPress={toggleTheme}
                accessibilityRole="button"
                accessibilityLabel={isDark ? "Switch to Sacred Dawn Light Theme" : "Switch to Cosmic Dark Night Theme"}
              >
                <Ionicons
                  name={isDark ? "sunny-outline" : "moon-outline"}
                  size={18}
                  color={isDark ? colors.primary : colors.secondary}
                />
              </TouchableOpacity>
            </View>

            {/* Sacred Branding */}
            <View style={styles.logoContainer}>
              <View style={styles.iconCircle}>
                <Text style={styles.omBig}>ॐ</Text>
              </View>
              <Text style={[styles.title, { color: colors.text }]} maxFontSizeMultiplier={1.3}>
                MANTRA
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.3}>
                Sacred Vedic Sanctuary & Sadhana Companion
              </Text>
            </View>

            {/* Auth Glass Card */}
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }], width: '100%' }}>
              <GlassCard
                style={[
                  styles.authCard,
                  {
                    backgroundColor: isDark ? 'rgba(22, 19, 43, 0.88)' : 'rgba(255, 255, 255, 0.94)',
                    borderColor: isDark ? 'rgba(255, 153, 51, 0.22)' : 'rgba(255, 153, 51, 0.35)',
                    shadowColor: isDark ? colors.primary : 'rgba(0, 0, 0, 0.1)',
                  }
                ]}
                glow={isDark}
              >
                {errorMessage && (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={16} color={Colors.error} style={{ marginRight: 6 }} />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                )}

                {step === 'email' ? (
                  <>
                    <View style={styles.stepHeaderRow}>
                      <Ionicons name="sparkles" size={15} color={colors.primary} />
                      <Text style={[styles.stepLabel, { color: isDark ? colors.secondary : colors.primary }]}>Devotee Sign In</Text>
                    </View>

                    <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
                    <View style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                        borderColor: colors.border,
                      }
                    ]}>
                      <Ionicons name="person-outline" size={18} color={colors.primary} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Enter your sacred name"
                        placeholderTextColor={colors.textMuted}
                        value={fullName}
                        onFocus={() => scrollToInput(110)}
                        onChangeText={(t) => {
                          setFullName(t);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        autoCapitalize="words"
                        autoCorrect={false}
                        maxFontSizeMultiplier={1.3}
                      />
                    </View>

                    <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
                    <View style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                        borderColor: colors.border,
                      }
                    ]}>
                      <Ionicons name="mail-outline" size={18} color={colors.primary} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="devotee@sanctuary.in"
                        placeholderTextColor={colors.textMuted}
                        value={email}
                        onFocus={() => scrollToInput(170)}
                        onChangeText={(t) => {
                          setEmail(t);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        maxFontSizeMultiplier={1.3}
                      />
                    </View>

                    <View style={styles.buttonGroup}>
                      <SpiritualButton
                        title="Begin Spiritual Journey"
                        onPress={handleSendOtp}
                        loading={loading}
                        variant="primary"
                        style={styles.buttonHeight}
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.policyLink}
                      onPress={() => router.push('/privacy')}
                      accessibilityRole="link"
                      accessibilityLabel="Read Privacy Policy"
                    >
                      <Text style={[styles.policyText, { color: colors.textSecondary }]}>
                        Protected under DPDP Act 2023 • Sacred Data Covenant
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={() => transitionToStep('email')}
                      accessibilityRole="button"
                      accessibilityLabel="Change email address"
                    >
                      <Ionicons name="chevron-back" size={16} color={colors.primary} />
                      <Text style={[styles.backText, { color: colors.primary }]}>Change Email</Text>
                    </TouchableOpacity>

                    <View style={styles.stepHeaderRow}>
                      <Ionicons name="shield-checkmark" size={15} color={isDark ? colors.secondary : colors.primary} />
                      <Text style={[styles.stepLabel, { color: isDark ? colors.secondary : colors.primary }]}>Step 2: Enter Verification Code</Text>
                    </View>

                    <Text style={[styles.otpHint, { color: colors.textSecondary }]}>
                      We sent a 6-digit verification code to{'\n'}
                      <Text style={[styles.emailHighlight, { color: colors.primary }]}>{email}</Text>
                    </Text>

                    <Text style={[styles.label, { color: colors.text }]}>6-Digit Verification Code</Text>
                    <View style={[
                      styles.inputWrapper,
                      styles.otpWrapper,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                        borderColor: colors.border,
                      }
                    ]}>
                      <Ionicons name="key-outline" size={18} color={colors.primary} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, styles.otpInput, { color: colors.text }]}
                        placeholder="• • • • • •"
                        placeholderTextColor={colors.textMuted}
                        value={otp}
                        onFocus={() => scrollToInput(150)}
                        onChangeText={(t) => {
                          setOtp(t.replace(/\D/g, '').slice(0, 6));
                          if (errorMessage) setErrorMessage(null);
                        }}
                        keyboardType="number-pad"
                        maxLength={6}
                        autoFocus
                        maxFontSizeMultiplier={1.3}
                      />
                    </View>

                    <View style={styles.buttonGroup}>
                      <SpiritualButton
                        title="Verify & Enter Sanctuary"
                        onPress={handleVerifyOtp}
                        loading={loading}
                        variant="primary"
                        style={styles.buttonHeight}
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.resendButton}
                      onPress={handleResend}
                      disabled={resendCooldown > 0 || loading}
                      accessibilityRole="button"
                    >
                      <Text style={styles.resendText}>
                        {resendCooldown > 0 ? (
                          `Resend code in ${resendCooldown}s`
                        ) : (
                          <>Didn't receive code? <Text style={styles.resendAction}>Resend</Text></>
                        )}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </GlassCard>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  themeToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 153, 51, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 153, 51, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  omBig: {
    fontFamily: Typography.families.devanagari,
    fontSize: 42,
    color: Colors.primary,
    lineHeight: 52,
  },
  title: {
    fontFamily: Typography.families.heading,
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 3,
  },
  subtitle: {
    fontFamily: Typography.families.body,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 290,
  },
  authCard: {
    padding: 24,
    borderRadius: Radius.xl,
    width: '100%',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    borderRadius: Radius.sm,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: Colors.error,
    fontWeight: '600',
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  stepLabel: {
    fontFamily: Typography.families.heading,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 16,
  },
  otpWrapper: {
    borderColor: Colors.borderGlow,
    backgroundColor: 'rgba(255, 153, 51, 0.04)',
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
    letterSpacing: 10,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: Colors.primary,
  },
  buttonGroup: {
    marginTop: 8,
    marginBottom: 14,
    width: '100%',
  },
  buttonHeight: {
    height: 52,
    width: '100%',
  },
  policyLink: {
    marginTop: 16,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  policyText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 2,
  },
  otpHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  emailHighlight: {
    color: Colors.primary,
    fontWeight: '700',
  },
  resendButton: {
    marginTop: 4,
    alignItems: 'center',
    padding: 8,
    minHeight: 44,
    justifyContent: 'center',
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
