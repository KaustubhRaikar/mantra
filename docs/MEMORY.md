# 🧠 MANTRA APP — AI MEMORY & CONTEXT ARCHITECTURE

> **Document Identifier:** MANTRA-DOC-MEM-011  
> **Target Audience:** AI Engineers, Data Engineers, Middleware Architects  
> **Status:** Active Engineering Architecture  
> **Version:** 2.0.0  
> **Storage Technologies:** Redis, PostgreSQL + pgvector, Local SQLite  

---

## 1. Multi-Tiered Memory Hierarchy

The Mantra AI ecosystem deploys a four-tiered memory hierarchy to balance low-latency conversational context, scriptural recall, and user privacy:

```
+===================================================================================================+
|                                    FOUR-TIERED MEMORY TOPOLOGY                                    |
+===================================================================================================+
| TIER 1: WORKING / SESSION MEMORY (Ephemeral)                                                      |
| • Scope: Active conversation turn (last 6-8 exchanges)                                            |
| • Technology: Redis In-Memory Cache (TTL: 2 hours)                                                |
| • Purpose: Immediate pronoun resolution, multi-turn follow-ups during live chat                  |
+---------------------------------------------------------------------------------------------------+
| TIER 2: EPISODIC CONVERSATION MEMORY (Short-to-Medium Term)                                        |
| • Scope: Summaries of past spiritual guidance sessions (rolling 30-day window)                    |
| • Technology: Encrypted PostgreSQL `ai_chat_sessions` table                                       |
| • Purpose: Remembering user's ongoing spiritual focus (e.g., studying Isha Upanishad)             |
+---------------------------------------------------------------------------------------------------+
| TIER 3: DEVOTIONAL PROFILE & HABIT MEMORY (Structured User State)                                |
| • Scope: Devotee's spiritual profile (favorite deity, average daily malas, active sankalpa)       |
| • Technology: SQLite (local client) synced with MySQL `user_spiritual_profiles`                   |
| • Purpose: Personalizing morning recommendations and greeting context                             |
+---------------------------------------------------------------------------------------------------+
| TIER 4: SEMANTIC SCRIPTURAL MEMORY (Immutable Long-Term Knowledge)                               |
| • Scope: Entire corpus of canonical Hindu scriptures, slokas, meanings, and commentaries          |
| • Technology: PostgreSQL 16 with `pgvector` / Qdrant (HNSW Vector Index)                          |
| • Purpose: Ground truth for Retrieval-Augmented Generation (RAG)                                  |
+===================================================================================================+
```

---

## 2. Semantic Scriptural Memory & Vector Store Design

### 2.1 Embedding Models & Index Parameters
* **Primary Embedding Model:** `text-embedding-3-small` (OpenAI, 1536 dimensions) with fallback to open-source `intfloat/multilingual-e5-large` (1024 dimensions) for on-premise execution.
* **Vector Index:** Hierarchical Navigable Small World (**HNSW**) with cosine similarity distance metric:
  ```sql
  CREATE INDEX scripture_vector_hnsw_idx 
  ON scripture_embeddings 
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
  ```

### 2.2 Ingestion & Chunking Specification

```
[ Canonical Entity JSON ]
          |
          +---> Split into Semantic Chunks:
          |       • Chunk A: Sacred Sanskrit Verse + Transliteration (High Priority)
          |       • Chunk B: Word-by-Word Sanskrit Etymology
          |       • Chunk C: English & Hindi Translation
          |       • Chunk D: Spiritual Benefits & Practical Sadhana Guidelines
          |
          v
[ Embedder Engine ] -> Generates 1536-dim vector per chunk
          |
          v
[ Vector Store Record ]
{
  "id": "mantra_chunk_108_A",
  "entity_id": 108,
  "entity_type": "mantra",
  "deity": "Shiva",
  "category_id": 1,
  "chunk_type": "verse",
  "text": "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्...",
  "embedding": [0.0142, -0.0521, ..., 0.0891]
}
```

---

## 3. Context Window Management & Token Optimization

### 3.1 Token Budget Allocation (4,096 Token Context Window)

To ensure rapid response times and predictable operational costs, every agent prompt adheres to a strict token budget:

```
+-------------------------------------------------------------------------------+
|                       TOKEN BUDGET ALLOCATION (4,096 LIMIT)                   |
+------------------------------+--------------------+---------------------------+
| Segment                      | Allocated Tokens   | Description               |
+------------------------------+--------------------+---------------------------+
| **System Persona & Rules**   | 600 tokens         | Reverent Acharya persona  |
| **Devotee Profile Context**  | 250 tokens         | Deity, mala streaks       |
| **Retrieved Canonical RAG**  | 1,800 tokens       | Top-4 scripture chunks    |
| **Recent Session History**   | 650 tokens         | Compressed turns          |
| **Devotee Current Prompt**   | 200 tokens         | Input question            |
| **Generation Buffer**        | 600 tokens         | Output response room      |
+------------------------------+--------------------+---------------------------+
```

### 3.2 Context Compaction & Rolling Summaries
When a session exceeds 6 conversational turns:
1. An asynchronous background task triggers a summarizer model.
2. Turns $1$ to $4$ are distilled into a compact 100-token contextual digest:
   * *Example:* `"Devotee asked about Shiva's third eye and benefits of chanting Maha Mrityunjaya. Acharya explained the conquest of ego and suggested 1 mala daily."*
3. The raw turns are pruned from working memory, leaving the compact summary and the 2 most recent turns in the active prompt buffer.

---

## 4. Privacy, DPDP Compliance & Memory Erasure

### 4.1 Strict Tenant Isolation
* Memory records are partitioned by `user_id`. No agent or context retrieval query can access or cross-reference conversations belonging to another devotee.
* Vector embeddings of user notes or personal reflections are tagged with tenant metadata and encrypted at rest using AES-256.

### 4.2 Right to be Forgotten (Hard Purge)
When a devotee triggers **"Delete My Account and Data"** (`/v1/auth/delete_account.php`):
1. **Redis Flush:** All active session keys `sess:user:{id}:*` are purged immediately.
2. **Episodic Memory Delete:** All rows in `ai_chat_sessions` and `ai_chat_messages` where `user_id = :id` are permanently deleted.
3. **Vector Prune:** Any personalized embeddings associated with the user are deleted from PostgreSQL via `DELETE FROM user_embeddings WHERE user_id = :id`.
4. **Audit Receipt:** A cryptographically signed deletion certificate is logged in the compliance ledger.
