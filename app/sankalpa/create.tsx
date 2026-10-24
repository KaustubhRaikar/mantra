import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Radius, Spacing, Typography } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { GlassHeader } from '../../src/components/GlassHeader';
import { GlassCard } from '../../src/components/GlassCard';
import {
  sankalpaStorage,
  ANUSHTHAN_PRESETS,
  AnushthanPreset,
} from '../../src/services/sankalpaStorage';

export default function CreateSankalpaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();

  const [selectedPreset, setSelectedPreset] = useState<AnushthanPreset | null>(
    ANUSHTHAN_PRESETS[0]
  );
  const [customTitle, setCustomTitle] = useState('');
  const [customDeity, setCustomDeity] = useState('');
  const [customMantra, setCustomMantra] = useState('');
  const [customDays, setCustomDays] = useState('21');
  const [customDailyMalas, setCustomDailyMalas] = useState('11');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const handleCreate = async () => {
    let payload;
    if (isCustomMode) {
      if (!customTitle.trim()) {
        Alert.alert('त्रुटि', 'कृपया संकल्प का शीर्षक दर्ज करें।');
        return;
      }
      payload = {
        title: customTitle.trim(),
        deity: customDeity.trim() || 'सर्व देवता',
        mantraText: customMantra.trim(),
        targetDays: parseInt(customDays, 10) || 21,
        dailyMalas: parseInt(customDailyMalas, 10) || 11,
      };
    } else if (selectedPreset) {
      payload = {
        title: selectedPreset.title,
        deity: selectedPreset.deity,
        mantraText: selectedPreset.mantraText,
        targetDays: selectedPreset.targetDays,
        dailyMalas: selectedPreset.dailyMalas,
      };
    } else {
      return;
    }

    try {
      await sankalpaStorage.createAnushthan(payload);
      Alert.alert(
        'संकल्प सिद्ध हो! 🕉️',
        `आपका "${payload.title}" संकल्प सफलतापूर्वक प्रारंभ हो चुका है।`,
        [{ text: 'साधना प्रारंभ करें', onPress: () => router.replace('/sankalpa' as any) }]
      );
    } catch (e) {
      Alert.alert('त्रुटि', 'संकल्प सुरक्षित करने में समस्या आई।');
    }
  };

  return (
    <View style={styles.root}>
      <CosmicBackground />
      <GlassHeader
        title="पवित्र संकल्प ग्रहण"
        subtitle="Initiate Sacred Sadhana Vow"
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Sacred Sankalpa Shloka */}
        <GlassCard style={styles.shlokaCard} glow>
          <Text style={[styles.shlokaTitle, { color: colors.primary }]}>
            ॥ पावन संकल्प वाक्य ॥
          </Text>
          <Text style={[styles.shlokaBody, { color: colors.text }]}>
            ॐ विष्णुर्विष्णुर्विष्णुः... मम कायिक-वाचिक-मानसिक पाप निवारणार्थं,
            इष्टदेवता प्रसन्नतार्थं शुभ संकल्पं करिष्ये।
          </Text>
          <Text style={[styles.shlokaMeaning, { color: colors.textSecondary }]}>
            (मैं अपने समस्त विकारों की शुद्धि एवं ईष्ट कृपा प्राप्ति हेतु यह व्रत संकल्प धारण करता हूँ।)
          </Text>
        </GlassCard>

        {/* Mode Selector: Presets vs Custom */}
        <View style={styles.modeTabsRow}>
          <TouchableOpacity
            onPress={() => setIsCustomMode(false)}
            style={[
              styles.modeTab,
              !isCustomMode && {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.modeTabText,
                { color: !isCustomMode ? '#0C0A1A' : colors.textSecondary },
              ]}
            >
              शास्त्रोक्त संकल्प (Presets)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsCustomMode(true)}
            style={[
              styles.modeTab,
              isCustomMode && {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.modeTabText,
                { color: isCustomMode ? '#0C0A1A' : colors.textSecondary },
              ]}
            >
              व्यक्तिगत संकल्प (Custom)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Presets List */}
        {!isCustomMode ? (
          <View style={styles.presetsList}>
            {ANUSHTHAN_PRESETS.map((p) => {
              const isSelected = selectedPreset?.id === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setSelectedPreset(p)}
                  activeOpacity={0.88}
                >
                  <GlassCard
                    style={[
                      styles.presetCard,
                      isSelected && {
                        borderColor: colors.primary,
                        backgroundColor: isDark
                          ? 'rgba(255, 153, 51, 0.12)'
                          : 'rgba(230, 126, 34, 0.08)',
                      },
                    ]}
                  >
                    <View style={styles.presetHeader}>
                      <View style={styles.presetTitleCol}>
                        <Text style={[styles.presetTitle, { color: colors.text }]}>
                          {p.title}
                        </Text>
                        <Text style={[styles.presetDeity, { color: colors.primary }]}>
                          {p.deity}
                        </Text>
                      </View>
                      <Ionicons
                        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                        size={22}
                        color={isSelected ? colors.primary : colors.textMuted}
                      />
                    </View>

                    <Text style={[styles.presetDesc, { color: colors.textSecondary }]}>
                      {p.description}
                    </Text>

                    <View style={styles.presetBadgeRow}>
                      <View style={styles.pillBadge}>
                        <Text style={[styles.pillText, { color: colors.text }]}>
                          ⏳ {p.targetDays} दिन
                        </Text>
                      </View>
                      <View style={styles.pillBadge}>
                        <Text style={[styles.pillText, { color: colors.text }]}>
                          📿 {p.dailyMalas} माला प्रतिदिन
                        </Text>
                      </View>
                      <View style={styles.pillBadge}>
                        <Text style={[styles.pillText, { color: colors.primary }]}>
                          लक्ष्य: {p.totalMalas} माला
                        </Text>
                      </View>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          /* Custom Form */
          <GlassCard style={styles.customFormCard}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>संकल्प शीर्षक (Title)</Text>
            <TextInput
              style={[
                styles.textInput,
                { color: colors.text, borderColor: colors.border },
              ]}
              placeholder="उदा. 41-दिवसीय महामृत्युंजय साधना"
              placeholderTextColor={colors.textMuted}
              value={customTitle}
              onChangeText={setCustomTitle}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>इष्ट देव / देवी (Deity)</Text>
            <TextInput
              style={[
                styles.textInput,
                { color: colors.text, borderColor: colors.border },
              ]}
              placeholder="उदा. भगवान शिव / माँ दुर्गा"
              placeholderTextColor={colors.textMuted}
              value={customDeity}
              onChangeText={setCustomDeity}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>मंत्र (Sacred Mantra)</Text>
            <TextInput
              style={[
                styles.textInput,
                styles.textAreaInput,
                { color: colors.text, borderColor: colors.border },
              ]}
              placeholder="ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              value={customMantra}
              onChangeText={setCustomMantra}
            />

            <View style={styles.customGrid}>
              <View style={styles.customCol}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>दिवसीय अवधि (Days)</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { color: colors.text, borderColor: colors.border },
                  ]}
                  keyboardType="numeric"
                  value={customDays}
                  onChangeText={setCustomDays}
                />
              </View>

              <View style={styles.customCol}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>दैनिक माला (Daily Malas)</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { color: colors.text, borderColor: colors.border },
                  ]}
                  keyboardType="numeric"
                  value={customDailyMalas}
                  onChangeText={setCustomDailyMalas}
                />
              </View>
            </View>
          </GlassCard>
        )}

        {/* Submit Initiation Button */}
        <TouchableOpacity
          onPress={handleCreate}
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <Ionicons name="sparkles" size={18} color="#0C0A1A" style={{ marginRight: 6 }} />
          <Text style={styles.submitBtnText}>संकल्प ग्रहण करें (Initiate Vow)</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.standard,
  },
  shlokaCard: {
    padding: Spacing.standard,
    borderRadius: Radius.lg,
    alignItems: 'center',
    marginBottom: Spacing.standard,
  },
  shlokaTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  shlokaBody: {
    fontFamily: Typography.families.devanagari,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  shlokaMeaning: {
    fontFamily: Typography.families.body,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
  },
  modeTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.standard,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  modeTabText: {
    fontFamily: Typography.families.body,
    fontSize: 12,
    fontWeight: '700',
  },
  presetsList: {
    gap: 10,
    marginBottom: Spacing.standard,
  },
  presetCard: {
    padding: Spacing.standard,
    borderRadius: Radius.lg,
  },
  presetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  presetTitleCol: {
    flex: 1,
    paddingRight: 8,
  },
  presetTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 15,
    fontWeight: '700',
  },
  presetDeity: {
    fontFamily: Typography.families.body,
    fontSize: 12,
    marginTop: 2,
  },
  presetDesc: {
    fontFamily: Typography.families.devanagari,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  presetBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  pillBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  pillText: {
    fontFamily: Typography.families.body,
    fontSize: 11,
    fontWeight: '600',
  },
  customFormCard: {
    padding: Spacing.standard,
    borderRadius: Radius.lg,
    marginBottom: Spacing.standard,
  },
  inputLabel: {
    fontFamily: Typography.families.heading,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: Typography.families.body,
    fontSize: 14,
  },
  textAreaInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  customGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  customCol: {
    flex: 1,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: Radius.full,
    marginTop: Spacing.compact,
  },
  submitBtnText: {
    fontFamily: Typography.families.heading,
    fontSize: 15,
    fontWeight: '800',
    color: '#0C0A1A',
  },
});
