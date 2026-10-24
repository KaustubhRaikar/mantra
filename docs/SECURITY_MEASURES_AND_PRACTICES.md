# 🛡️ MANTRA APP — SECURITY MEASURES & BEST PRACTICES

> **Document Identifier:** MANTRA-DOC-SEC-008  
> **Target Audience:** Security Engineers, Compliance Officers, Penetration Testers, Backend Architects  
> **Status:** Production Security Baseline  
> **Version:** 2.0.0  
> **Compliance Benchmarks:** OWASP Mobile Top 10, OWASP API Top 10, DPDP Act 2023 (India), GDPR  

---

## 1. Security Architecture & Threat Model (STRIDE)

```
+---------------------------------------------------------------------------------------------------+
|                                STRIDE THREAT ANALYSIS & MITIGATIONS                               |
+-------------------+-----------------------------------------+-------------------------------------+
| Threat Category   | Potential Vector                        | Applied Mantra Defense              |
+-------------------+-----------------------------------------+-------------------------------------+
| **Spoofing**      | Forging OTP verification requests       | HMAC-SHA256 hashing; device ID      |
|                   | or impersonating another user ID        | binding; token-derived user_id.     |
+-------------------+-----------------------------------------+-------------------------------------+
| **Tampering**     | Modifying Japa count payloads in transit| TLS 1.3 enforced; HMAC signed       |
|                   | or local SQLite injection               | sync tokens; PDO parameterized SQL. |
+-------------------+-----------------------------------------+-------------------------------------+
| **Repudiation**   | Denying consent to data collection or   | Structured consent logs with audit  |
|                   | unauthorized deletion requests          | timestamps in `user_consents`.      |
+-------------------+-----------------------------------------+-------------------------------------+
| **Information**   | Memory scraping, unencrypted Keychain,  | `expo-secure-store` for tokens;     |
| **Disclosure**    | or plain-text OTP transmission          | OTP masked in logs; no PII in URLs. |
+-------------------+-----------------------------------------+-------------------------------------+
| **Denial of**     | OTP SMS/Email bombing attacks;          | Dual-key rate limiting (Email + IP);|
| **Service**       | scraping scripture content at scale     | token bucket limits via SQLite/DB.  |
+-------------------+-----------------------------------------+-------------------------------------+
| **Elevation of**  | Horizontal privilege escalation         | Server derives user identity solely |
| **Privilege**     | via forged user_id in POST body         | from validated session Bearer token.|
+-------------------+-----------------------------------------+-------------------------------------+
```

---

## 2. Authentication & Cryptographic Controls

### 2.1 OTP Cryptographic Hashing (REQ-T1-03)
* **Secret Pepper:** Plaintext OTPs are never stored in the database.
* **Algorithm:**
  $$\text{Hash} = \text{HMAC-SHA256}(\text{otp\_code}, \text{SERVER\_PEPPER\_SECRET})$$
* **Constant-Time Verification:** Verification utilizes PHP `hash_equals()` to prevent side-channel timing attacks:
  ```php
  $calculated_hash = hash_hmac('sha256', $otp_input, $server_secret);
  if (!hash_equals($db_hash, $calculated_hash)) {
      // Increment attempt counter & exit
  }
  ```

### 2.2 Rate Limiting Policies (REQ-T1-01, REQ-T1-02)

```
+-------------------------------------------------------------------------------+
|                            DUAL RATE LIMIT POLICY                             |
+---------------------------+-----------------------------------+---------------+
| Endpoint                  | Limit Constraint                  | Action on Hit |
+---------------------------+-----------------------------------+---------------+
| `/auth/send_otp.php`      | Max 3 OTP sends / 10 min / Email  | HTTP 429      |
| `/auth/send_otp.php`      | Max 10 OTP sends / 1 hour / IP    | HTTP 429      |
| `/auth/verify_otp.php`    | Max 5 failed attempts / OTP code  | Invalidate OTP|
| `/auth/verify_otp.php`    | Max 10 attempts / 10 min / IP     | HTTP 429      |
| `/jaap/sync.php`          | Max 30 sync calls / 1 minute / IP | HTTP 429      |
+---------------------------+-----------------------------------+---------------+
```

### 2.3 Hardware Device Fingerprinting
Every session is cryptographically bound to the physical device:
* **Android:** Native hardware `Application.getAndroidId()`.
* **iOS:** Vendor ID `Application.getIosIdForVendorAsync()`.
* **Fallback:** Cryptographic UUID generated via `expo-crypto` and persisted in hardware Keychain.
* **Token Invalidation:** If a session token is replayed from an unregistered device ID, the backend immediately terminates the token and logs a security alert.

---

## 3. Data Protection & DPDP Act 2023 Compliance

The Digital Personal Data Protection (DPDP) Act 2023 mandates strict governance of citizen personal data:

```
+-------------------------------------------------------------------------------+
|                          DPDP COMPLIANCE LIFECYCLE                            |
+-------------------------------------------------------------------------------+
|                                                                               |
|  [ Launch ] ---> [ Explicit Consent Screen ]                                  |
|                        |                                                      |
|                        +---> Granular Consent Toggles:                        |
|                        |     [x] Core Prayers & App Functionality (Mandatory) |
|                        |     [ ] Anonymous Performance Analytics (Optional)   |
|                        |     [ ] AI Spiritual Assistant Features (Optional)   |
|                        v                                                      |
|           [ Consent Timestamp & Version Stored in DB ]                        |
|                        |                                                      |
|      +-----------------+-----------------+                                    |
|      |                                   |                                    |
|      v                                   v                                    |
|  [ Right to Data Portability ]       [ Right to Erasure / Deletion ]          |
|  `/v1/auth/export_data.php`          `/v1/auth/delete_account.php`            |
|  Devotee downloads encrypted         Permanently hard-deletes user record,    |
|  JSON file containing all Japa       session tokens, favorites, Japa logs,    |
|  logs, favorites, and profile data.  and AI conversation histories.           |
+-------------------------------------------------------------------------------+
```

---

## 4. Network & Transport Security

1. **Transport Layer Security:** Enforce TLS 1.3 exclusively across all endpoints (`https://mantra.aarambhtech.in` and `https://ai.aarambhtech.in`). Support for TLS 1.0, 1.1, and insecure cipher suites is disabled at the web server layer.
2. **HTTP Hardening Headers:**
   * `Content-Security-Policy: default-src 'self'`
   * `X-Content-Type-Options: nosniff`
   * `X-Frame-Options: DENY`
   * `Strict-Transport-Security: max-age=31536000; includeSubDomains`
   * `Referrer-Policy: strict-origin-when-cross-origin`
3. **CORS Restrictions:** Cross-Origin Resource Sharing is locked down to authorized native application bundle origins and testing environments; wildcard `*` headers are forbidden on authenticated routes.

---

## 5. Storage Security (KeyStore & SQLite Encryption)

* **Tokens & Cryptographic Secrets:** Stored strictly inside `expo-secure-store`, backed by:
  * Android: **Hardware-backed KeyStore** (AES-256-GCM).
  * iOS: **Apple Keychain Services** (`kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`).
* **Relational Storage:** `expo-sqlite` stores non-sensitive, large-scale prayer logs and scripture caches. Sensitive user credentials are never written to SQLite tables.

---

## 6. Incident Response & Vulnerability Management

* **Vulnerability Disclosure Policy:** Security researchers can report findings to `security@aarambhtech.in`.
* **Zero Logging of Sensitive Secrets:** Application and server logs automatically scrub email addresses, OTP codes, and authentication tokens through regex filters before writing to disk.
* **Regular Dependency Audits:** Automated `npm audit` and `composer audit` integrated into CI/CD pipelines to block builds with high or critical CVSS vulnerabilities.
