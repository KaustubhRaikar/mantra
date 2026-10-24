import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Radius, Spacing, Typography } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { CosmicBackground } from '../../src/components/CosmicBackground';
import { GlassHeader } from '../../src/components/GlassHeader';
import { GlassCard } from '../../src/components/GlassCard';
import { SriYantra } from '../../src/components/yantras/SriYantra';
import { ShivaYantra } from '../../src/components/yantras/ShivaYantra';
import { GayatriYantra } from '../../src/components/yantras/GayatriYantra';

export const YANTRA_LIST = [
  {
    id: 'sri_yantra',
    title: 'श्री यंत्र (Sri Yantra)',
    deity: 'माँ ललिता त्रिपुर सुंदरी / श्री महालक्ष्मी',
    significance: 'समस्त ब्रह्मांडीय ऊर्जा, समृद्धि एवं अद्वैत चेतना का सर्वोच्च ज्यामितीय स्वरूप।',
    benefits: 'मानसिक शांति, वास्तु दोष निवारण, एकाग्रता एवं ध्यान में त्वरित लीनता।',
    renderYantra: (size: number) => <SriYantra size={size} />,
  },
  {
    id: 'shiva_yantra',
    title: 'शिव षट्कोण यंत्र (Shiva Yantra)',
    deity: 'भगवान देवाधिदेव महादेव',
    significance: 'शिव एवं शक्ति के पूर्ण सामंजस्य का प्रतीक षट्कोण (षट्चक्र) यंत्र।',
    benefits: 'भयमुक्ति, आंतरिक मौन, इन्द्रिय निग्रह एवं समाधि अवस्था में सहायक।',
    renderYantra: (size: number) => <ShivaYantra size={size} />,
  },
  {
    id: 'gayatri_yantra',
    title: 'गायत्री सूर्य यंत्र (Gayatri Yantra)',
    deity: 'वेदमाता गायत्री / भगवान सविता',
    significance: '24 अक्षरों एवं सौर रश्मियों का दिव्य ज्यामितीय प्रकाश केंद्र।',
    benefits: 'स्मृति शक्ति, प्रज्ञा (बुद्धि) की तीव्र वृद्धि, नेत्र ज्योति एवं आत्मिक तेज।',
    renderYantra: (size: number) => <GayatriYantra size={size} />,
  },
];

export default function YantraGalleryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();

  return (
    <View style={styles.root}>
      <CosmicBackground />
      <GlassHeader
        title="पवित्र यंत्र एवं त्राटक ध्यान"
        subtitle="Sacred Geometry & Trātaka Meditation"
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Shloka Banner */}
        <GlassCard style={styles.quoteCard} glow>
          <Text style={[styles.quoteShloka, { color: colors.primary }]}>
            ॥ यंत्रं मंत्रमयं प्रोक्तं मंत्रात्मा देवतैव हि ॥
          </Text>
          <Text style={[styles.quoteMeaning, { color: colors.textSecondary }]}>
            (यंत्र मंत्र का साकार दृश्य शरीर है, और मंत्र स्वयं साक्षात देवता की चैतन्य आत्मा है।)
          </Text>
          <Text style={[styles.quoteGuidance, { color: colors.text }]}>
            त्राटक ध्यान: केंद्र बिंदु (बिंदु) पर स्थिर दृष्टि केंद्रित कर श्वास के साथ एकाग्र हों।
          </Text>
        </GlassCard>

        {/* Yantras List */}
        <View style={styles.yantraCardsCol}>
          {YANTRA_LIST.map((yantra) => (
            <TouchableOpacity
              key={yantra.id}
              activeOpacity={0.9}
              onPress={() => router.push(`/yantra/${yantra.id}` as any)}
              accessibilityRole="button"
              accessibilityLabel={`Begin Trataka meditation on ${yantra.title}`}
            >
              <GlassCard style={styles.yantraCard} glow>
                <View style={styles.yantraPreviewContainer}>
                  {yantra.renderYantra(190)}
                </View>

                <View style={styles.yantraInfoCol}>
                  <Text style={[styles.yantraTitle, { color: isDark ? '#FFFFFF' : '#171426' }]}>
                    {yantra.title}
                  </Text>
                  <Text style={[styles.yantraDeity, { color: colors.primary }]}>
                    {yantra.deity}
                  </Text>

                  <Text style={[styles.yantraDesc, { color: colors.textSecondary }]}>
                    {yantra.significance}
                  </Text>

                  <View style={styles.actionRow}>
                    <View style={styles.benefitsRow}>
                      <Ionicons name="sparkles-outline" size={14} color="#2ECC71" style={{ marginRight: 4 }} />
                      <Text style={[styles.benefitText, { color: colors.text }]}>
                        {yantra.benefits.slice(0, 36)}...
                      </Text>
                    </View>

                    <View style={[styles.tratakaBtn, { backgroundColor: colors.primary }]}>
                      <Ionicons name="eye" size={15} color="#0C0A1A" style={{ marginRight: 4 }} />
                      <Text style={styles.tratakaBtnText}>त्राटक ध्यान</Text>
                    </View>
                  </View>
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>
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
  quoteCard: {
    padding: Spacing.standard,
    borderRadius: Radius.lg,
    alignItems: 'center',
    marginBottom: Spacing.standard,
  },
  quoteShloka: {
    fontFamily: Typography.families.heading,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  quoteMeaning: {
    fontFamily: Typography.families.body,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  quoteGuidance: {
    fontFamily: Typography.families.body,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  yantraCardsCol: {
    gap: 16,
  },
  yantraCard: {
    padding: Spacing.standard,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  yantraPreviewContainer: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yantraInfoCol: {
    width: '100%',
    marginTop: 10,
  },
  yantraTitle: {
    fontFamily: Typography.families.heading,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  yantraDeity: {
    fontFamily: Typography.families.body,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  yantraDesc: {
    fontFamily: Typography.families.devanagari,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 10,
  },
  benefitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  benefitText: {
    fontFamily: Typography.families.body,
    fontSize: 11,
  },
  tratakaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  tratakaBtnText: {
    fontFamily: Typography.families.body,
    fontSize: 12,
    fontWeight: '800',
    color: '#0C0A1A',
  },
});
