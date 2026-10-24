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
    API->>DB: Check rate_limits (IP & Email)
    alt Rate Limit Exceeded
        API-->>MobileApp: HTTP 429 Too Many Requests
    else Limit OK
        API->>API: Generate 6-digit CSPRNG OTP
        API->>API: Compute HMAC-SHA256(otp, PEPPER_SECRET)
        API->>DB: UPSERT pending_otps (email, hash, expires_in_10m)
        API->>Mail: Dispatch sacred OTP email
        API-->>MobileApp: HTTP 200 { status: "success", message: "OTP sent" }
    end

    %% STEP 2: VERIFY OTP
    Devotee->>MobileApp: Enters 6-digit OTP ("549102")
    MobileApp->>MobileApp: Resolve Hardware Device ID & Device Name
    MobileApp->>API: POST /auth/verify_otp.php { email, otp, device_id, device_name }
    API->>DB: SELECT * FROM pending_otps WHERE email = :email
    API->>API: Constant-time hash_equals(db_hash, hmac(otp, secret))
    alt OTP Invalid or Expired
        API->>DB: Increment attempts counter (+1)
        API-->>MobileApp: HTTP 401 Invalid Code
    else OTP Valid
        API->>DB: DELETE FROM pending_otps WHERE email = :email (Single-use)
        API->>DB: Find or Create User Record
        API->>API: Generate 64-char Cryptographic Login Token
        API->>DB: INSERT INTO user_sessions (user_id, login_token, device_id, expires_at)
        API-->>MobileApp: HTTP 200 { token, user_id, email, full_name }
        MobileApp->>MobileApp: Write token & device_id to expo-secure-store
    end

    %% STEP 3: SILENT BACKGROUND SESSION VERIFICATION
    Note over MobileApp, API: Subsequent App Launches (Zero-Friction Cold Start)
    MobileApp->>API: POST /auth/verify_session.php
    Note over MobileApp, API: Headers: X-User-ID, X-Login-Token, X-Device-ID
    API->>DB: Validate user_sessions WHERE token, user_id, device_id
    API-->>MobileApp: HTTP 200 { valid: true }
```

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
