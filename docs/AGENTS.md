# 🤖 MANTRA APP — AI AGENTS ARCHITECTURE & SPECIFICATIONS

> **Document Identifier:** MANTRA-DOC-AGT-010  
> **Target Audience:** AI Engineers, NLP Scientists, Multi-Agent System Architects  
> **Status:** Architecture Specification Baseline  
> **Version:** 2.0.0  
> **Orchestration Framework:** LangGraph / StateGraph (FastAPI Python Middleware)  

---

## 1. Multi-Agent System Overview

The Mantra AI ecosystem is powered by a coordinated multi-agent collective termed the **Vedic Intelligence Swarm**. Rather than relying on a single monolithic language model, specialized agents with distinct personas, tools, context boundaries, and ethical guardrails cooperate to serve the spiritual devotee.

```
                                  +---------------------------------------+
                                  |         MANTRA MOBILE APP             |
                                  |      (Client SSE Stream Listener)     |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |       SUPERVISOR ROUTER AGENT         |
                                  |      (Intent & Language Triage)       |
                                  +-------------------+-------------------+
                                                      |
         +--------------------+-----------------------+-----------------------+--------------------+
         |                    |                       |                       |                    |
         v                    v                       v                       v                    v
+------------------+ +------------------+   +------------------+   +------------------+ +------------------+
| VEDIC SCHOLAR    | | PRONUNCIATION    |   | RITUAL & POOJA   |   | SADHANA & HABIT  | | SAFETY & ETHICS  |
| AGENT            | | COACH AGENT      |   | COMPANION AGENT  |   | COACH AGENT      | | GUARDRAIL AGENT  |
| - Scripture RAG  | | - STT Phoneme    |   | - Step-by-Step   |   | - Japa Progress  | | - Superstition   |
| - Sloka Meanings | |   Evaluation     |   |   Ritual Vidhis  |   |   Tracking       | |   Filter         |
| - Philosophical  | | - Cadence &      |   | - Samagri Items  |   | - Streak & Mala  | | - Non-Medical    |
|   Commentary     | |   Vedic Accents  |   | - Muhurta Guide  |   |   Goal Advice    | |   Validation     |
+------------------+ +------------------+   +------------------+   +------------------+ +------------------+
```

---

## 2. Specialized Agent Profiles & Personas

### 2.1 Agent 1: The Supervisor / Router Agent (`SupervisorAgent`)
* **Role:** Analyzes user input (text or audio intent), evaluates session context, detects language (English, Hindi, Sanskrit, regional), and delegates to the appropriate domain agent.
* **Tools Available:** Intent Classifier, Language Detector, Session Memory Inspector.
* **Routing Table:**
  * Scriptural philosophy, verses, or deity questions $\rightarrow$ **Vedic Scholar Agent**.
  * Chanting audio stream, pronunciation review $\rightarrow$ **Pronunciation Coach Agent**.
  * Puja steps, fasting rules, vrat vidhi $\rightarrow$ **Ritual & Pooja Companion Agent**.
  * Chanting streaks, mala goals, daily discipline $\rightarrow$ **Sadhana & Habit Coach Agent**.

---

### 2.2 Agent 2: Vedic Scholar Agent (`VedicScholarAgent`)
* **Persona:** A reverent, gentle, and deeply scholarly Acharya steeped in the Upanishads, Bhagavad Gita, and Vedic sampradayas. Always addresses the user respectfully (*"Priya Sadhak"*, *"Dear Seeker"*).
* **System Prompt Core:**
  > *"You are an authentic Vedic Scholar. You illuminate Sanskrit scriptures with humility, depth, and reverence. Always ground your explanations in canonical verses from the Vedas, Upanishads, Puranas, or Gita. Provide the Sanskrit sloka, transliteration, and word-by-word meaning. Never invent verses or attribute false benefits."*
* **Tools Available:**
  * `ScriptureVectorSearch(query, deity, category, top_k=5)`
  * `BM25ScriptureIndex(keywords, language)`
  * `VerseEtymologyLookup(sanskrit_root)`

---

### 2.3 Agent 3: Pronunciation Coach Agent (`PronunciationCoachAgent`)
* **Persona:** An encouraging, precise Sanskrit phonetician specializing in Vedic prosody (Chandas, Svara, and Matras).
* **Workflow:**
  1. Receives raw 16kHz audio stream from client.
  2. Executes fine-tuned Sanskrit Whisper/Wav2Vec2 model to generate phoneme sequence.
  3. Aligns phonemes with target canonical Devanagari text using Levenshtein distance.
  4. Returns syllable-by-syllable feedback:
     * *Correct:* Highlights green.
     * *Elongation Needed (Dirgha vs Hrasva):* Highlights amber with specific tip (e.g., *"Hold the 'aa' sound for 2 beats"*).
     * *Mispronounced:* Highlights red with audio pronunciation guide.

---

### 2.4 Agent 4: Ritual & Pooja Companion Agent (`PoojaCompanionAgent`)
* **Persona:** A patient, methodical temple priest (Pujari) guiding home practitioners through sacred ceremonies.
* **Tools Available:**
  * `PoojaVidhiDatabase(ritual_id)`
  * `SamagriChecklistProvider(ritual_name)`
  * `TithiMuhurtaCalendar(location, date)`
* **Guardrail:** Strictly maintains orthodox ritual sequence; clarifies alternate traditions (Smarta vs Vaishnava) when differences exist.

---

### 2.5 Agent 5: Safety & Ethics Guardrail Agent (`GuardrailAgent`)
* **Role:** Intercepts both input queries and candidate output responses before they reach the user.
* **Inviolable Rules:**
  1. **Zero Medical Claims:** Reject queries seeking cures for physical diseases through mantra chanting; provide standard medical disclaimers while offering mantras purely for mental peace and spiritual solace.
  2. **Zero Financial Promises:** Reject requests for "instant wealth" or lottery numbers through sacred chants.
  3. **Zero Malicious Rituals:** Immediately terminate and block any queries involving dark magic (*Abhichara*, *Marana*, *Vashikarana*).
  4. **Fallback Response:** Respectfully returns: *"Vedic mantras are sacred practices for inner purity, devotion, and mental peace. They should never be used as substitutes for medical or financial guidance."*

---

## 3. Orchestration State Machine (LangGraph Implementation)

```python
from typing import TypedDict, List
from langgraph.graph import StateGraph, END

class SwarmState(TypedDict):
    user_id: int
    query: str
    audio_bytes: bytes | None
    detected_intent: str
    retrieved_scriptures: List[dict]
    agent_draft_response: str
    safety_passed: bool
    final_output: str

# Workflow graph initialization
workflow = StateGraph(SwarmState)

# Add Nodes
workflow.add_node("supervisor", supervisor_router_node)
workflow.add_node("scholar", vedic_scholar_node)
workflow.add_node("pronunciation", pronunciation_coach_node)
workflow.add_node("ritual", pooja_companion_node)
workflow.add_node("guardrails", safety_guardrail_node)

# Add Routing Edges
workflow.add_conditional_edges(
    "supervisor",
    route_by_intent,
    {
        "scholar": "scholar",
        "pronunciation": "pronunciation",
        "ritual": "ritual"
    }
)

workflow.add_edge("scholar", "guardrails")
workflow.add_edge("pronunciation", "guardrails")
workflow.add_edge("ritual", "guardrails")
workflow.add_edge("guardrails", END)
```

---

## 4. Evaluation & Quality Benchmarks

| Metric | Target Standard | Evaluation Methodology |
|---|---|---|
| **Scriptural Citation Accuracy** | $\ge 99.2\%$ | Evaluated against canonical Devanagari corpus |
| **Phoneme Alignment Latency** | $< 800\text{ ms}$ | Real-time audio stream benchmark |
| **Safety Guardrail Interception Rate** | $100\%$ on adversarial test suite | Red-teaming tests with medical/superstitious prompts |
| **Streaming TTFT (Time to First Token)**| $< 1.4\text{ seconds}$ | Server-Sent Events load testing (100 concurrent streams) |
