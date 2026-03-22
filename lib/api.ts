/**
 * TrustDoc Review UI — API client
 * Prompt 4: MFA session management — 5-minute session token cached in memory/cookie
 */
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost';

// ── MFA Session (Prompt 4) ────────────────────────────────────────────────────
// In-memory store for the 5-minute MFA session token.
// On page reload the user re-enters TOTP (acceptable security tradeoff).
let _mfaSession: { token: string; expiresAt: number } | null = null;

export function getMfaSessionToken(): string | null {
  if (!_mfaSession) return null;
  if (Date.now() > _mfaSession.expiresAt) {
    _mfaSession = null;
    return null;
  }
  return _mfaSession.token;
}

export function setMfaSessionToken(token: string): void {
  _mfaSession = {
    token,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  };
}

export function isMfaSessionActive(): boolean {
  return getMfaSessionToken() !== null;
}

export function clearMfaSession(): void {
  _mfaSession = null;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
let _accessToken: string | null = null;

export function setAccessToken(token: string): void {
  _accessToken = token;
  if (typeof window !== 'undefined') {
    localStorage.setItem('td_access_token', token);
  }
}

export function getAccessToken(): string | null {
  if (_accessToken) return _accessToken;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('td_access_token');
  }
  return null;
}

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── API calls ─────────────────────────────────────────────────────────────────
export function logout(): void {
  _accessToken = null;
  clearMfaSession();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('td_access_token');
    localStorage.removeItem('trustdoc_mfa_session');

    // Only clear current user - HDRs, notifications, and chat history must persist!
    localStorage.removeItem('trustdoc_current_user');
  }
}

export async function login(email: string, password: string) {
  try {
    const { data } = await axios.post(`${API}:8002/api/v1/auth/login`, { email, password });
    setAccessToken(data.access_token);
    return data;
  } catch (error) {
    // Fallback to dev mode if backend is not available
    if (process.env.NODE_ENV === 'development') {
      const { loginDev } = await import('./api-dev');
      const data = await loginDev(email, password);
      setAccessToken(data.access_token);
      console.log('⚠️ Backend auth failed, using dev mode login');
      return data;
    }
    throw error;
  }
}

/**
 * Validate MFA token (TOTP or session token).
 * On success with TOTP: stores returned 5-min session token (Prompt 4).
 */
export async function validateMfa(mfaToken: string): Promise<{
  valid: boolean;
  user_id: string;
  mfa_session_token: string | null;
}> {
  const { data } = await axios.post(
    `${API}:8002/api/v1/auth/mfa/validate`,
    { mfa_token: mfaToken },
    { headers: authHeaders() },
  );
  if (data.mfa_session_token) {
    setMfaSessionToken(data.mfa_session_token);
  }
  return data;
}

export async function createHdr(payload: {
  ai_output: string;
  ai_tool: string;
  context: { context_hash: string; document_ids: string[]; uris: string[]; summary?: string };
  decision: 'APPROVE' | 'OVERRIDE' | 'ESCALATE';
  mfa_token: string;
  decision_note?: string;
}) {
  try {
    const { data } = await axios.post(
      `${API}:8001/api/v1/records/hdr`,
      payload,
      { headers: authHeaders() },
    );
    return data;
  } catch (error) {
    // Fallback to dev mode if backend is not available
    if (process.env.NODE_ENV === 'development') {
      const { createHdrDev } = await import('./api-dev');
      console.log('⚠️ Backend HDR creation failed, using dev mode');
      return await createHdrDev(payload);
    }
    throw error;
  }
}

export async function getHdr(hdrId: string) {
  const { data } = await axios.get(
    `${API}:8001/api/v1/records/hdr/${hdrId}`,
    { headers: authHeaders() },
  );
  return data;
}

export async function verifyRecord(recordId: string) {
  const { data } = await axios.get(`${API}:8003/api/v1/verify/${recordId}`);
  return data;
}
