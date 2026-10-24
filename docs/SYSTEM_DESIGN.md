# 📐 MANTRA APP — DETAILED SYSTEM DESIGN DOCUMENT (SDD)

> **Document Identifier:** MANTRA-DOC-DES-005  
> **Target Audience:** Lead Engineers, Software Architects, Senior Developers  
> **Status:** Active System Design Baseline  
> **Version:** 2.0.0  
> **Date:** October 2026  

---

## 1. Introduction & Design Scope

This System Design Document specifies the concrete software designs, class interfaces, state machines, algorithmic workflows, and module decompositions for the **Mantra** mobile client, PHP REST services, and AI middleware pipelines.

---

## 2. Frontend Component & State Design

### 2.1 Provider Hierarchy & Context Composition

```
                    +--------------------------------+
                    |       Root App Component       |
                    |        (app/_layout.tsx)       |
                    +---------------+----------------+
                                    |
                                    v
                    +--------------------------------+
                    |      QueryClientProvider       |
                    |     (TanStack React Query)     |
                    +---------------+----------------+
                                    |
                                    v
                    +--------------------------------+
                    |          AuthProvider          |
                    |   (Session & Device Identity)  |
                    +---------------+----------------+
                                    |
                                    v
                    +--------------------------------+
                    |        FavoritesProvider       |
                    |  (Bookmarks & Sync Triggers)   |
                    +---------------+----------------+
                                    |
                                    v
                    +--------------------------------+
                    |       CosmicThemeProvider      |
                    |  (Color tokens, sacred palette)|
                    +---------------+----------------+
                                    |
                                    v
                    +--------------------------------+
                    |   Stack / Tabs (expo-router)   |
                    +--------------------------------+
```

### 2.2 Audio Player State Machine (`AudioPlayerService`)

The mobile client manages audio sessions through a deterministic state machine built on `expo-audio`:

```
                 +--------------+
                 |     IDLE     |
                 +-------+------+
                         |
                   play(entity)
                         |
                         v
                 +--------------+  load error
                 |   LOADING    +-------------> [ ERROR_RETRY ]
                 +-------+------+
                         |
                    buffer ready
                         |
                         v
       +-------->+--------------+<-------+
       |         |   PLAYING    |        |
 pause |         +-------+------+        | resume
       |                 |               |
       +---------+-------+------+--------+
                 |    PAUSED    |
                 +-------+------+
                         |
                  track finished
                         |
                         v
                 +--------------+
                 |  COMPLETED   |
                 +--------------+
```

* **Playback Parameters:**
  * Sample rate: 44.1 kHz, 16-bit stereo.
  * Audio interruption listener ducks volume if incoming phone call occurs; pauses on headset disconnect.

---

## 3. Data Synchronization Engine & Conflict Resolution

### 3.1 Japa Mala Counter Synchronization Algorithm

Because devotees may count mantras on multiple devices (e.g., iPhone during morning commute, Android tablet at home altar), simple "last-write-wins" leads to lost devotion data.

```
ALGORITHM: SyncJaapLogs(local_logs, remote_logs)
INPUT: 
  local_logs: List of { date: String, totalChants: Int, completedMalas: Int }
  remote_logs: List of { date: String, totalChants: Int, completedMalas: Int }
OUTPUT: 
  merged_logs: List of { date: String, totalChants: Int, completedMalas: Int }

1. Initialize Map mergedMap
2. FOR EACH item IN remote_logs DO:
     mergedMap[item.date] = { 
       totalChants: item.totalChants, 
       completedMalas: item.completedMalas 
     }
3. FOR EACH item IN local_logs DO:
     IF item.date EXISTS IN mergedMap THEN:
       // Check if this device already contributed this delta
       IF item.isDirty == TRUE THEN:
         mergedMap[item.date].totalChants += item.localDeltaChants
         mergedMap[item.date].completedMalas += item.localDeltaMalas
       END IF
     ELSE:
       mergedMap[item.date] = { 
         totalChants: item.totalChants, 
         completedMalas: item.completedMalas 
       }
     END IF
4. Write mergedMap back to SQLite `jaap_daily_logs`
5. Reset local isDirty flag to FALSE
6. RETURN sorted array of mergedMap by date DESC
```

### 3.2 Favorites Synchronization Algorithm

Favorites utilize a **Distributed Set Union with Tombstones**:
* Adding an item sets `is_deleted = 0` and `updated_at = NOW()`.
* Removing an item sets `is_deleted = 1` and `updated_at = NOW()`.
* Sync compares timestamps: if local `updated_at` > remote `updated_at`, local state overwrites server; otherwise, server state overwrites local.

---

## 4. Backend Modular Design & API Request Flow

### 4.1 Request Processing Pipeline

```
[ Incoming HTTP Request ]
          |
          v
[ Apache mod_rewrite ] ----> Routes to /api/v1/*.php
          |
          v
[ headers.php ] -----------> Enforces JSON Content-Type, CORS, TLS, No-Sniff
          |
          v
[ rate_limit.php ] --------> Evaluates Client IP & Payload Key against `rate_limits` table
          |
   (Limit breached? -> HTTP 429 Exit)
          |
          v
[ Auth Verification ] -----> Validates X-User-ID, X-Login-Token, X-Device-ID (if private route)
          |
   (Invalid session? -> HTTP 401 Exit)
          |
          v
[ Controller Logic ] ------> Executes PDO Prepared Statements (Zero SQL Injection)
          |
          v
[ normalizer.php ] --------> Formats record into Canonical Schema format
          |
          v
[ HTTP 200 JSON Response ]
```

---

## 5. AI RAG & Pronunciation Evaluation Design

### 5.1 Retrieval-Augmented Generation (RAG) Architecture

```
 Devotee Query: "What is the spiritual significance of the Maha Mrityunjaya Mantra?"
                                      |
                                      v
           +-----------------------------------------------------+
           | Query Preprocessor & Devanagari Entity Extractor    |
           +--------------------------+--------------------------+
                                      |
                 +--------------------+--------------------+
                 |                                         |
                 v                                         v
   +-----------------------------+           +-----------------------------+
   | Dense Vector Embedding      |           | Sparse Keyword BM25 Index   |
   | (text-embedding-3-small)    |           | (Sanskrit & Hindi Lemmas)   |
   +--------------+--------------+           +--------------+--------------+
                  |                                         |
                  +--------------------+--------------------+
                                       |
                                       v
                     +-----------------------------------+
                     | Reciprocal Rank Fusion (RRF)      |
                     | Top-5 Canonical Verses Retained   |
                     +-----------------+-----------------+
                                       |
                                       v
                     +-----------------------------------+
                     | Prompt Assembler with System      |
                     | Boundaries & Scriptural Citations |
                     +-----------------+-----------------+
                                       |
                                       v
                     +-----------------------------------+
                     | LLM Streamer (SSE Chunk Output)   |
                     +-----------------------------------+
```

### 5.2 Pronunciation Evaluator Algorithm

1. Devotee recites verse into microphone. Client captures 16kHz WAV mono audio.
2. Audio stream is sent via multipart POST to `/v1/ai/pronunciation/evaluate`.
3. Sanskrit Speech Recognition Model (Fine-tuned Wav2Vec2/Whisper) extracts spoken phoneme sequence:
   $$\text{P}_{\text{user}} = [p_1, p_2, \dots, p_n]$$
4. Canonical text is converted into IPA phonemes:
   $$\text{P}_{\text{canonical}} = [c_1, c_2, \dots, c_m]$$
5. Dynamic Time Warping (DTW) and Levenshtein alignment compute edit operations:
   * **Exact Match:** Phoneme scored 1.0 (Green).
   * **Vowel Length Substitution (e.g., short 'a' vs long 'aa'):** Phoneme scored 0.6 (Orange).
   * **Consonant Deletion / Severe Mispronunciation:** Phoneme scored 0.0 (Red).
6. Server returns JSON array of phoneme scores with audio offset markers for real-time frontend visualization.
