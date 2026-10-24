# 🧘 MANTRA APP — USER EXPERIENCE (UX) SPECIFICATION & JOURNEYS

> **Document Identifier:** MANTRA-DOC-UX-007  
> **Target Audience:** UX Designers, Product Managers, Interaction Engineers, QA Testers  
> **Status:** Approved UX Baseline  
> **Version:** 2.0.0  
> **Design Axiom:** Reverent, Frictionless, Distraction-Free  

---

## 1. Information Architecture (IA) & Sitemap

The Mantra app navigation hierarchy is structured to minimize cognitive load, allowing users to enter a meditative mental state within seconds of launching the application.

```
                              +--------------------+
                              |  App Launch / Splash|
                              +---------+----------+
                                        |
                 +----------------------+----------------------+
                 | (First Time Launch)                         | (Returning User)
                 v                                             v
     +-----------------------+                    +-----------------------+
     | DPDP Consent & Privacy|                    | Background Auto-Auth  |
     +-----------+-----------+                    +-----------+-----------+
                 |                                             |
                 +----------------------+----------------------+
                                        |
                                        v
                       +---------------------------------+
                       |  Bottom Tab Navigator (_layout) |
                       +---------------------------------+
                                        |
      +-----------------+---------------+-----------------+-----------------+
      |                 |                                 |                 |
      v                 v                                 v                 v
[ 1. Home Tab ]   [ 2. Categories Tab ]             [ 3. Favorites Tab ] [ 4. Profile Tab ]
  - Daily Mantra    - Deity Taxonomy (Shiva, Vishnu) - Saved Mantras       - Sadhak Identity
  - Japa Mala Orb   - Category Filter (Grid/List)    - Offline Audio       - 90-Day Mala Heatmap
  - Sacred Audio    - Sub-entities Browser           - Filter Chips        - Devotional Streak
  - Quick Rituals                                                          - Settings / Privacy
      |
      +---> Global Multi-Entity Search Modal (`app/search/index.tsx`)
      |
      +---> Detail Entity Stacks:
              ├── `/mantra/[id]`        ├── `/aarti/[id]`
              ├── `/chalisa/[id]`       ├── `/pooja_vidhi/[id]`
              ├── `/stotra/[id]`        ├── `/vrat_katha/[id]`
              ├── `/festival_aarti/[id]`└── `/upanishad`
```

---

## 2. Core User Journeys

### 2.1 Journey 1: Morning Sadhana & Blind Japa Mala Practice
* **Context:** Devotee wakes up at 5:30 AM (Brahma Muhurta). Devotee sits cross-legged in the meditation corner with dimmed lighting and closed eyes.
* **Goal:** Complete 1 mala (108 chants) of Gayatri Mantra without looking at a glaring screen.

```
+-----------------------------------------------------------------------------------+
|                           MORNING JAPA FLOW DIAGRAM                               |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ Launch App ]                                                                   |
|         |                                                                         |
|         v                                                                         |
|  [ Tap "Jaap Mala" on Home Screen ]                                               |
|         |                                                                         |
|         v                                                                         |
|  [ Select Goal: "108" ] ---> Audio Bell Chimes softly                             |
|         |                                                                         |
|         v                                                                         |
|  [ Devotee closes eyes and taps screen with thumb ]                               |
|         |                                                                         |
|         +---> Each tap produces a crisp light haptic pulse                        |
|         |     (Confirms bead counted without visual verification)                 |
|         |                                                                         |
|         +---> Bead 108 Reached:                                                   |
|                 - Distinct triple-pulse vibration                                 |
|                 - Resonant temple bell chime sound                                |
|                 - Screen illuminates in warm radiant gold                         |
|         |                                                                         |
|         v                                                                         |
|  [ SQLite automatically records +1 Mala to today's date ]                         |
|         |                                                                         |
|         v                                                                         |
|  [ Devotee feels peaceful accomplishment and closes app ]                         |
+-----------------------------------------------------------------------------------+
```

---

### 2.2 Journey 2: Scriptural In-Depth Study & Meaning
* **Context:** A young seeker hears the verse *"Karpura Gauram Karunavataram"* and wants to understand its meaning and origin.
* **Flow:**
  1. Opens Search bar, types *"karpura"*.
  2. Instant search returns *Shiva Aarti / Karpura Gauram* with deity badge.
  3. Detail view opens:
     - Hero section displays large Devanagari text with audio play trigger.
     - User taps **"Word-by-Word Meaning"** accordion.
     - Explanations reveal: *Karpura* = Camphor-white; *Gauram* = Pure complexion; *Karunavataram* = Embodiment of compassion.
  4. Devotee taps **"Bookmark / Favorite"** icon -> Instant optimistic state update with subtle golden heart bounce animation.

---

### 2.3 Journey 3: Step-by-Step Pooja Vidhi Ritual Guide
* **Context:** Devotee is performing Ganesh Chaturthi pooja at home. Hands are occupied with flowers and water vessels.
* **Flow:**
  1. Opens `/pooja_vidhi/1`.
  2. Screen presents structured procedural cards:
     - **Step 1: Deepa Prajvalan** (Lighting the lamp) + Sloka text + audio chant.
     - **Step 2: Achamanam** (Purification of hands) + Sloka text.
     - **Step 3: Sankalp** (Devotional vow declaration).
  3. Checkbox toggles mark each ritual step as completed, retaining state even if the app reloads.

---

## 3. Interaction Design & Sensory Rules

1. **Eyes-Free Operation:** In the Japa counter, the entire screen surface is an active tap target. Devotees do not need to look at or aim for a small button.
2. **Preventing Accidental Double Taps:** A debounce threshold of $180\text{ ms}$ prevents accidental rapid double-counting during Japa counting.
3. **Lock-Screen Playback Support:** When reciting long Chalisas (Hanuman Chalisa) or 1000 names (Vishnu Sahasranama), the devotee can lock the phone or put it in their pocket; audio continues seamlessly with lock-screen title and controls.
4. **Haptic Hierarchy:**
   * Light impact: Individual bead count.
   * Medium impact: Bookmark / Favorite toggle.
   * Heavy double pulse: Mala milestone (21, 54, 108).
   * Error buzz: Network sync retry failure.

---

## 4. Edge Cases, Offline States & Graceful Degradation

| Scenario | UX Handling | Devotee Impact |
|---|---|---|
| **No Internet Connection** | App displays an ambient top banner: *"Offline Sanctuary Mode"*. All cached scriptures, SQLite Japa history, and downloaded audio tracks remain 100% accessible. | Devotee can continue prayers without interruption. |
| **Missing Audio Vocal Recording** | Audio player button is replaced with an elegant *"Vocal recording in preparation"* chip. No broken playback or error alerts. | Zero frustration; reading remains undisturbed. |
| **App Unexpectedly Terminated** | Japa bead counts within the current mala session are saved to SQLite on every tap. App reloads precisely at the last counted bead. | Zero lost chants; devotion progress preserved. |
| **Silent Switch Enabled (iOS)** | Audio player honors `playsInSilentModeIOS: true` so prayers play through the speaker even if the iPhone physical mute switch is toggled. | Devotee hears audio prayers reliably. |

---

## 5. Cognitive Load & Spiritual Focus Principles
* **Zero Dark Patterns:** No countdown timers, no artificial urgency, no paywalls blocking sacred verses.
* **Reverent Transitions:** All modal presentations and page routes utilize serene 250ms cross-fades rather than aggressive sliding motions.
* **Night Devotion Mode:** Dark cosmic theme is default; eliminates harsh blue light during early morning (Brahma Muhurta) or bedtime prayers.
