# 🤖 MANTRA APP — AI ENGINEERING TEAM PROMPT & TECHNICAL SPECIFICATION

> **Target Audience:** AI Engineering Team, Middleware Engineers, and NLP Data Scientists  
> **Repository Baseline:** React Native / Expo SDK 57 Client + PHP/MySQL REST Backend (v1 API)  
> **Prerequisites:** Canonical schema documented in `SCHEMA.md`, authenticated endpoints under `/api/v1/`

---

## 🎯 ROLE & CONTEXT
You are a senior AI / NLP Engineer building the AI Layer for the Mantra app ecosystem. You will construct a high-performance **FastAPI (Python)** middleware service (`https://ai.aarambhtech.in/v1`) that interfaces with the Mantra mobile app and the primary PHP/MySQL backend.

All content ingested into your Vector DB must adhere strictly to `SCHEMA.md`.

---

## 🚀 EPICS & TECHNICAL REQUIREMENTS

### 1. Vector Database & RAG Ingestion Pipeline
- **Vector DB Choice:** PgVector, Qdrant, or Pinecone.
- **Ingestion Sources:** Fetch canonical entity records from `/api/v1/mantras/read.php`, `/api/v1/aartis/read.php`, `/api/v1/chalisas/read.php`, `/api/v1/stotras/read.php`, and `/api/v1/upanishads/read.php`.
- **Chunking & Embedding Strategy:** Embed Devanagari text, English transliterations, Hindi/English translations, and spiritual meanings using multilingual text embeddings (e.g., `text-embedding-3-small` or `intfloat/multilingual-e5-large`).
- **Metadata Tagging:** Tag vector chunks with `entity_type`, `entity_id`, `deity`, `category_id`, and `source_text`.

### 2. Conversational Guru & Spiritual Assistant (Streaming SSE)
- **Endpoint:** `POST /v1/ai/chat` (Server-Sent Events / Streaming response).
- **Authentication:** Validated using `HTTP_X_USER_ID`, `HTTP_X_LOGIN_TOKEN`, `HTTP_X_DEVICE_ID`.
- **System Prompt:** Maintain a respectful, reverent, and scholarly tone ("Sadhana", "Seva", "Vedic Wisdom"). Strictly prohibit financial predictions, medical diagnosis, or superstitious guarantees.
- **Context Injection:** Retrieve top-K relevant scripture chunks using hybrid search (sparse BM25 + dense vector cosine similarity).

### 3. "Explain This Verse" & Contextual Deep-Dives
- **Endpoint:** `POST /v1/ai/explain`
- **Payload:** `{ "entity_type": "mantra", "entity_id": 12, "target_verse": "ॐ त्र्यम्बकं यजामहे...", "user_language": "hi" }`
- **Output:** Word-by-word Sanskrit breakdown, etymological origins, historical context, and recommended daily chanting count.

### 4. Real-time Sanskrit Pronunciation Coach
- **Endpoint:** `POST /v1/ai/pronunciation/evaluate`
- **Payload:** Multipart audio stream (PCM/MP3) + target Devanagari string.
- **Model Stack:** Fine-tuned Whisper or Wav2Vec2 Sanskrit model.
- **Metric:** Calculate Phoneme Error Rate (PER) and return phoneme-level highlight mapping (`correct`, `needs_work`, `mispronounced`) for front-end visual feedback.

---

## 🔒 SECURITY & DPDP COMPLIANCE RULES
1. **Data Isolation:** User chat logs and audio recordings must be linked to `user_id` and isolated per tenant.
2. **Data Erasure:** Implement `DELETE /v1/ai/user_data` triggered when a user requests in-app account deletion.
3. **Opt-In Guardrails:** Execute AI features only for users with active AI consent flags (`consent_ai = 1`).

---

## 📦 DELIVERABLES EXPECTED FROM AI TEAM
1. Open-API 3.0 OpenAPI spec file (`openapi.json`).
2. Dockerized FastAPI application with health check endpoints.
3. Python unit test suite for RAG retrieval accuracy and SSE streaming latency (<1.5s time-to-first-token).
