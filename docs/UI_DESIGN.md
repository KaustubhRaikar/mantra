# 🎨 MANTRA APP — UI DESIGN SPECIFICATION & GUIDELINES

> **Document Identifier:** MANTRA-DOC-UI-006  
> **Target Audience:** UI Designers, Mobile Front-End Engineers, Design System Leads  
> **Status:** Approved UI Design Baseline  
> **Version:** 2.0.0  
> **Design Language:** Cosmic Vedic Glassmorphism  

---

## 1. Visual Design Philosophy & Aesthetics

The Mantra application embodies **Cosmic Vedic Serenity**. Rather than sterile flat design or cluttered religious imagery, Mantra pairs ancient sacred geometry and reverent gold/saffron accents with deep celestial indigo gradients, subtle astral particle animations, and frosted glass (glassmorphism) surfaces.

```
       +-----------------------------------------------------------+
       |                  COSMIC DESIGN ATMOSPHERE                 |
       |                                                           |
       |    [ Celestial Midnight ]        [ Sacred Saffron Gold ]  |
       |           #0F0C20                       #FF9933           |
       |              |                             |              |
       |              v                             v              |
       |      Deep Spiritual Focus           Radiant Divine Energy |
       |                                                           |
       |    [ Frosted Glass Cards ]       [ Devanagari Typography ]|
       |    rgba(255, 255, 255, 0.06)      Tiro Devanagari Hindi   |
       +-----------------------------------------------------------+
```

---

## 2. Color Palette & Semantic Tokens

### 2.1 Dual Theme Palette System

#### A. Cosmic Dark Mode (Night Devotion — Default)
| Token Name | Hex Code | Semantic Role | Usage Guidance |
|---|---|---|---|
| `background` | `#080711` | Root Canvas Background | Base deep space backdrop |
| `surface` | `#161329` | Card / Sheet Background | Elevated surfaces with 85% opacity |
| `surfaceElevated` | `#1F1A3A` | Dialog / Sheet Surface | High-elevation surface |
| `primary` | `#FF9933` | Radiant Vedic Saffron | Active tabs, prayer buttons, mala counter |
| `secondary` | `#F5B041` | Sacred Gold Highlight | Deity badges, verse highlights, glowing borders |
| `accent` | `#6C5CE7` | Ambient Glow / Gradients | Background nebula gradients |
| `text` | `#FFFFFF` | High-Emphasis Text | Sanskrit Devanagari headings, titles |
| `textSecondary` | `#B3B1C9` | Medium-Emphasis Text | English translations, meanings, descriptions |
| `textMuted` | `#716D8E` | Low-Emphasis Text / Placeholders| Inactive labels, timestamp markers |
| `border` | `rgba(255, 255, 255, 0.08)` | Glassmorphic Borders | Subtle card separators |
| `borderGlow` | `rgba(255, 153, 51, 0.25)` | Saffron Radiance | Glowing active cards & orb border |

#### B. Sacred Dawn Mode (Suryodaya Light)
| Token Name | Hex Code | Semantic Role | Usage Guidance |
|---|---|---|---|
| `background` | `#F8F6F0` | Sacred Ivory Canvas | Base temple marble backdrop |
| `surface` | `#FFFFFF` | Pure Marble Surface | High-elevation card surfaces |
| `surfaceElevated` | `#F2EDE4` | Sandalwood Wash Surface | Dialog and floating sheet surface |
| `primary` | `#E67E22` | Deep Radiant Saffron | High-contrast Vedic saffron for bright daylight |
| `secondary` | `#D4AC0D` | Sacred Temple Gold | Deity badges, warm golden highlights |
| `accent` | `#5E48C8` | Deep Celestial Purple | Daylight spiritual accent |
| `text` | `#171426` | Deep Slate Charcoal | High-contrast Sanskrit Devanagari & Latin text |
| `textSecondary` | `#4E4968` | Twilight Indigo | Legible translations, meanings, and subtitles |
| `textMuted` | `#847E9C` | Incense Ash | Secondary metadata, timestamps |
| `border` | `rgba(0, 0, 0, 0.08)` | Clean Inset Borders | Clean boundaries on light marble |
| `borderGlow` | `rgba(230, 126, 34, 0.30)` | Radiant Daylight Glow | Gold/saffron borders on active cards |

### 2.2 CosmicThemeProvider Architecture
* Managed via `src/contexts/ThemeContext.tsx` with dynamic `Colors` Proxy in `src/constants/theme.ts`.
* Persists user choice in `SecureStore` under `'mantra_theme_mode'` (`'dark' | 'light' | 'system'`).
* One-tap instant switchers present in Home header, Login header, and Profile preferences.

---

## 3. Typography & Devanagari Script Standards

### 3.1 Font Family Hierarchy
* **Primary Sanskrit & Hindi Font:** `TiroDevanagariHindi_400Regular` (Google Fonts). Engineered specifically for high-fidelity rendering of Sanskrit conjunct ligatures without clipping.
* **Latin Headings & Numbers:** `Cinzel` or `Outfit` / System San Francisco / Roboto.
* **Latin Body & UI Labels:** `Inter` or System Default sans-serif.

### 3.2 Typographic Scale

| Style Token | Size | Line Height | Weight | Letter Spacing | Font Family |
|---|---|---|---|---|---|
| `displaySanskrit` | 26px | 38px | 500 | +0.5px | `Tiro Devanagari Hindi` |
| `heading1` | 24px | 32px | 700 | -0.2px | `Outfit / System` |
| `heading2` | 20px | 28px | 600 | 0px | `Outfit / System` |
| `scriptureBody` | 18px | 30px | 400 | +0.4px | `Tiro Devanagari Hindi` |
| `transliteration` | 15px | 24px | 400 (Italic)| +0.3px | `Inter / System` |
| `translationText` | 15px | 24px | 400 | 0px | `Inter / System` |
| `caption` | 12px | 16px | 500 | +0.5px | `Inter / System` |

---

## 4. Key Component Specifications

### 4.1 Tactile Japa Mala Counter Orb

```
                       +-----------------------+
                       |      ( 108 MALAS )    |  <-- Goal Selector Pills
                       +-----------+-----------+
                                   |
                                   v
                             .---''''---.
                           .'     OM     '.
                          /   108 / 108    \
                         |    COMPLETED!    |   <-- Sacred Golden Orb
                          \    [TAP HERE]  /       (Pulsing Radial Glow)
                           '.            .'
                             '---....---'
                                   |
                       +-----------+-----------+
                       |  Mala Streak: 14 Days |
                       +-----------------------+
```

* **Visual Behavior:** Radial golden gradient with pulsing ring animation on tap.
* **Bead Ring Indicator:** SVG circular stroke tracking progress toward 21, 54, 108, or 1008 beads.
* **Touch Target:** Minimum $240 \times 240\text{ pt}$ circular touch region allowing effortless blind tapping.

### 4.2 Scripture Reader Card & View-Mode Toggle

Devotees can toggle visible script layers using segmented pills:
* `[ Devanagari ]`
* `[ Transliteration ]`
* `[ English Translation ]`
* `[ Hindi Translation ]`

Each section is rendered inside a frosted glass container (`backgroundColor: rgba(255, 255, 255, 0.05)`, `borderRadius: 16`, `borderWidth: 1`, `borderColor: rgba(255, 153, 51, 0.15)`).

### 4.3 Compact & Expanded Audio Player

* **Compact Docked Player:** Sticky bottom player docked above the navigation tab bar. Displays track title, deity thumbnail, play/pause button, and progress scrubber line.
* **Full-Screen Sacred Player:** High-resolution deity artwork, circular audio scrubber, playback speed selector ($0.75x, 1.0x, 1.25x$), loop mode toggle, and offline download badge.

---

## 5. Micro-Interactions & Animations

1. **Japa Bead Tap:** Instant $0.96$ scale depression with 80ms rebound spring, triggering light haptic vibration.
2. **Mala Milestone Celebration:** Upon completing the 108th bead, an ambient golden particle burst radiates outward, accompanied by a soft vibration pattern.
3. **Tab Transition:** Smooth cross-fade with 200ms cubic-bezier easing to prevent harsh page flashing.

---

## 6. Accessibility & Inclusivity Guidelines (WCAG 2.1 AA)

* **Contrast Ratio:** Text on dark cosmic surfaces maintains a minimum contrast ratio of $4.8:1$ (exceeding WCAG AA requirements).
* **Dynamic Type Support:** Text components respect user OS font scale multipliers up to $1.6\times$ without text clipping.
* **Screen Reader Accessibility:** All icons and interactive prayer buttons provide explicit `accessibilityLabel` and `accessibilityRole`.

---

## 7. Production Component System (`src/components/`)

The application has been unified under a 12-component shared library adhering strictly to Cosmic Vedic Glassmorphism tokens:

| Component | File Path | Interaction & Visual Behavior |
|---|---|---|
| **CosmicBackground** | `src/components/CosmicBackground.tsx` | Ambient `#080711` midnight canvas with subtle radiant Saffron (`#FF9933`) and Purple (`#6C5CE7`) auras and translucent Om watermark. |
| **GlassHeader** | `src/components/GlassHeader.tsx` | Sticky frosted glass header with blurred backdrop, $\ge 48\times 48\text{dp}$ touch target back button, title, subtitle, and dynamic action slot. |
| **GlassCard** | `src/components/GlassCard.tsx` | Translucent frosted container (`rgba(22, 19, 43, 0.72)`) with glowing border variant and touch feedback. |
| **SpiritualButton** | `src/components/SpiritualButton.tsx` | Primary gradient button (`#FF9933` to `#F5B041`), glass secondary button, and destructive variant with haptic feedback. |
| **ScriptureCard** | `src/components/ScriptureCard.tsx` | Devotional list item with Devanagari Sanskrit title, English translation, category tag, and one-touch favorite toggle. |
| **JapaOrb** | `src/components/JapaOrb.tsx` | 220dp Sacred Golden Chanting Orb with radial pulsing ripple animations, progress ring, daily count, and 27/54/108 mala milestone pills. |
| **ScriptureReader** | `src/components/ScriptureReader.tsx` | Universal scripture engine powering all 7 detail categories with `A-`/`A+` font scaling, [Sanskrit \| Hindi \| Meaning \| Translit] segmented tabs, and docked audio bar. |
| **AudioPlayerBar** | `src/components/AudioPlayerBar.tsx` | Docked bottom audio control bar with play/pause, time elapsed, scrub slider, and loop toggle. |
| **SearchBar** | `src/components/SearchBar.tsx` | Dark glass search input with instant clear button and accessibility labels. |
| **EmptyState** | `src/components/EmptyState.tsx` | Serene spiritual illustration and recovery button for zero-search or empty favorites states. |
| **SkeletonLoader** | `src/components/SkeletonLoader.tsx` | Shimmering glass placeholder cards preventing layout shift during queries. |
| **CustomTabBar** | `src/components/CustomTabBar.tsx` | Bottom navigation dock in frosted midnight glass (`#141126` to `#1F1A3A`) with active saffron indicators. |

