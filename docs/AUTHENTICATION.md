# 🔐 MANTRA APP — AUTHENTICATION & AUTHORIZATION SPECIFICATION

> **Document Identifier:** MANTRA-DOC-AUT-014  
> **Target Audience:** Security Engineers, Backend Developers, Mobile App Engineers  
> **Status:** Production Security Baseline  
> **Version:** 2.0.0  
> **Protocol:** Passwordless 2-Step OTP with Cryptographic Device Fingerprinting  

---

## 1. Authentication Philosophy

Traditional passwords introduce severe friction, account lockouts, and weak credential reuse among elderly and non-technical devotees. Social logins (Google, Apple, Facebook) compromise privacy by sharing tracking identifiers with third-party advertising networks.

Mantra implements **Passwordless 2-Step OTP Authentication bound to Hardware Device Identifiers**. This delivers maximum simplicity for the devotee alongside bank-grade security against credential stuffing, phishing, and session hijacking.

---

## 2. Authentication Lifecycle & Protocol Flow

```mermaid
sequenceDiagram
    autonumber
    actor Devotee
    participant MobileApp as Mantra Mobile Client
    participant API as Hostinger REST Gateway
    participant DB as MySQL Database
    participant Mail as Secure SMTP Service

    %% STEP 1: SEND OTP
    Devotee->>MobileApp: Enters email ("devotee@mandir.org")
    MobileApp->>API: POST /auth/send_otp.php { email, full_name }
    API->>DB: Check sliding window rate limits (Dual-Key: Email & IP)
    alt Rate Limit Exceeded (Email > 2 / 15m OR IP > 5 / 1h)
        API-->>MobileApp: HTTP 429 { status: "error", code: "RATE_LIMIT_EXCEEDED", message: "Too many requests. Please try after sometime.", retry_after: 720 }
    else Limit OK
        API->>API: Generate 6-digit CSPRNG OTP
        API->>API: Compute HMAC-SHA256(otp, PEPPER_SECRET)
        API->>DB: UPSERT pending_otps (email, hash, expires_in_10m, attempts = 0)
        API->>DB: Record hit in api_sliding_rate_limits
        API->>Mail: Dispatch sacred OTP email
        API-->>MobileApp: HTTP 200 { status: "success", message: "OTP sent" }
    end

    %% STEP 2: VERIFY OTP
    Devotee->>MobileApp: Enters 6-digit OTP ("549102")
    MobileApp->>MobileApp: Resolve Hardware Device ID & Device Name
    MobileApp->>API: POST /auth/verify_otp.php { email, otp, device_id, device_name }
    API->>DB: Check sliding window rate limits (IP > 5 / 15m)
    alt IP Rate Limit Exceeded
        API-->>MobileApp: HTTP 429 { message: "Too many requests. Please try after sometime." }
    else IP OK
        API->>DB: SELECT * FROM pending_otps WHERE email = :email
        API->>API: Constant-time hash_equals(db_hash, hmac(otp, secret))
        alt OTP Invalid (Attempts < 3)
            API->>DB: Increment attempts counter (+1)
            API-->>MobileApp: HTTP 401 { message: "Incorrect verification code. You have X attempts remaining." }
        else Attempts >= 3 OR Code Expired
            API->>DB: DELETE FROM pending_otps WHERE email = :email (Invalidated)
            API-->>MobileApp: HTTP 401 { message: "Too many incorrect attempts. Verification code invalidated." }
        else OTP Valid
            API->>DB: DELETE FROM pending_otps WHERE email = :email (Single-use)
            API->>DB: Find or Create User Record
            API->>API: Generate 64-char Cryptographic Login Token
            API->>DB: INSERT INTO user_sessions (user_id, login_token, device_id, expires_at)
            API-->>MobileApp: HTTP 200 { token, user_id, email, full_name }
            MobileApp->>MobileApp: Write token & device_id to expo-secure-store
        end
    end

    %% STEP 3: SILENT BACKGROUND SESSION VERIFICATION
    Note over MobileApp, API: Subsequent App Launches (Zero-Friction Cold Start)
    MobileApp->>API: POST /auth/verify_session.php
    Note over MobileApp, API: Headers: X-User-ID, X-Login-Token, X-Device-ID
    API->>DB: Validate user_sessions WHERE token, user_id, device_id
    API-->>MobileApp: HTTP 200 { valid: true }
```

### 2.1 Sliding Window Dual-Key Rate Limiting Specification

Authentication endpoints strictly implement **true sliding window rate limiting** with sub-second accuracy calculated against the `api_sliding_rate_limits` table:

| Endpoint | Target Key | Limit Quota | Sliding Window | Response Code | Breach Payload & Header |
|---|---|---|---|:---:|---|
| `/auth/send_otp.php` | Devotee Email | **5 requests** | 15 Minutes (900s) | HTTP 429 | `Retry-After: <sec>` • *"Too many OTP requests for this email. Please check your inbox or try again after 15 minutes."* |
| `/auth/send_otp.php` | Originating IP | **30 requests** | 1 Hour (3600s) | HTTP 429 | `Retry-After: <sec>` • *"Too many requests from this network. Please try again after some time."* |
| `/auth/verify_otp.php` | Originating IP | **15 attempts** | 15 Minutes (900s) | HTTP 429 | `Retry-After: <sec>` • *"Too many requests. Please try after sometime."* |
| `/auth/verify_otp.php` | OTP Token Code | **3 attempts** | Per OTP lifecycle | HTTP 401 | Immediate database token erasure • Code Invalidated |

### 2.2 Production-Ready Zero Bypass Baseline
* **Removal of Offline Sandbox Codes:** Hardcoded bypass test codes (`108108`, `123456`) and offline mock session generation have been completely eliminated from the client application and server verification pipeline.
* **Mandatory Devotee Email Verification:** Every devotee session must be issued by the production backend with a verified cryptographic 64-character token bound to hardware Keystore/Keychain identifiers.
* **Official Subdomain OTP Dispatch (`no-reply@mantra.aarambhtech.in`):** Verification codes are delivered from `no-reply@mantra.aarambhtech.in` configured with Hostinger DNS MX, SPF (`v=spf1 include:_spf.mail.hostinger.com ~all`), DMARC (`v=DMARC1; p=none`), and DKIM records to guarantee pristine email deliverability.
* **Keyboard-Aware Auto-Scrolling UX:** The mobile client (`app/login.tsx`) dynamically listens to virtual keyboard events and programmatically scrolls focused text inputs and action buttons into clear visibility above the keyboard.
* **Light Theme UI Polish:** The authentication interface (`app/login.tsx`) dynamically adapts to both "Sacred Dawn Light Theme" and "Cosmic Dark Night Theme" without hardcoded dark container overlaps, ensuring pristine Devanagari typography, radiant saffron highlights, and high-contrast readability.

---

## 3. Cryptographic Device Fingerprinting

Every issued session is hard-locked to the physical hardware device on which the OTP was confirmed:

### 3.1 Device ID Resolution Hierarchy
```typescript
import * as Application from 'expo-application';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

export async function resolveHardwareDeviceId(): Promise<string> {
  let hardwareId: string | null = null;

  if (Platform.OS === 'android') {
    hardwareId = Application.getAndroidId();
  } else if (Platform.OS === 'ios') {
    hardwareId = await Application.getIosIdForVendorAsync();
  }

  if (hardwareId && hardwareId !== 'unknown') {
    return hardwareId;
  }

  // Cryptographic Fallback stored permanently in Hardware Keychain
  let fallbackId = await SecureStore.getItemAsync('mantra_device_uuid');
  if (!fallbackId) {
    fallbackId = Crypto.randomUUID();
    await SecureStore.setItemAsync('mantra_device_uuid', fallbackId);
  }
  return fallbackId;
}
```

---

## 4. Authorization Model & Header Specification

All authenticated endpoints (`/jaap/sync.php`, `/favorites/sync.php`, `/auth/delete_account.php`, `/ai/chat`) require the following standard HTTP headers:

| Header Name | Type | Description | Security Requirement |
|---|---|---|---|
| `X-User-ID` | Integer | Primary User Identifier | Cross-checked against session token |
| `X-Login-Token` | String (64 hex) | Cryptographic Session Bearer | Validated against database hash |
| `X-Device-ID` | String | Bound Hardware Fingerprint | Must match device registered with session |

### 4.1 Anti-Privilege Escalation Enforcement
Backend scripts enforce authorization using the following standard gatekeeper:

```php
function getAuthorizedUserId(PDO $db): int {
    $userId = $_SERVER['HTTP_X_USER_ID'] ?? null;
    $token  = $_SERVER['HTTP_X_LOGIN_TOKEN'] ?? null;
    $device = $_SERVER['HTTP_X_DEVICE_ID'] ?? null;

    if (!$userId || !$token || !$device) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Missing authentication headers."]);
        exit();
    }

    $stmt = $db->prepare(
        "SELECT user_id FROM user_sessions 
         WHERE user_id = :uid 
           AND login_token = :token 
           AND device_id = :device 
           AND expires_at > NOW() 
         LIMIT 1"
    );
    $stmt->execute([':uid' => $userId, ':token' => $token, ':device' => $device]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Unauthorized session or device mismatch."]);
        exit();
    }

    return (int)$userId;
}
```

---

## 5. Token Revocation & Multi-Device Management

1. **User Logout:** Calling `/auth/logout.php` deletes the specific `login_token` row in `user_sessions`, leaving sessions on other personal devices unaffected.
2. **Account Deletion:** Invoking `/auth/delete_account.php` cascade-deletes all active sessions across all devices immediately.
3. **Session Expiry:** Inactive sessions automatically expire after 180 days (`expires_at = DATE_ADD(NOW(), INTERVAL 180 DAY)`), requiring re-verification via OTP.
