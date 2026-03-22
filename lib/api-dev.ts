/**
 * DEV MODE: Mock authentication and MFA for testing
 * Remove this file in production!
 */

export async function loginDev(email: string, password: string): Promise<{
  access_token: string;
  user: { id: string; email: string };
}> {
  // Accept any password in dev mode for admin@trustdoc.dev
  if (email === 'admin@trustdoc.dev') {
    console.log('🔓 DEV MODE: Login bypassed for', email);
    return {
      access_token: 'dev-token-' + Date.now(),
      user: {
        id: 'dev-user-123',
        email: email,
      },
    };
  }

  throw new Error('Invalid credentials');
}

export async function validateMfaDev(mfaToken: string): Promise<{
  valid: boolean;
  user_id: string;
  mfa_session_token: string | null;
}> {
  // Accept any 6-digit code in dev mode
  if (mfaToken.length === 6 && /^\d+$/.test(mfaToken)) {
    console.log('🔓 DEV MODE: MFA bypassed with code:', mfaToken);
    return {
      valid: true,
      user_id: 'dev-user-123',
      mfa_session_token: 'dev-session-' + Date.now(),
    };
  }

  return {
    valid: false,
    user_id: '',
    mfa_session_token: null,
  };
}

export async function createHdrDev(payload: {
  ai_output: string;
  ai_tool: string;
  context: { context_hash: string; document_ids: string[]; uris: string[]; summary?: string };
  decision: 'APPROVE' | 'OVERRIDE' | 'ESCALATE';
  mfa_token: string;
  decision_note?: string;
}): Promise<{
  hdr_id: string;
  record_hash: string;
  verify_url: string;
}> {
  console.log('🔓 DEV MODE: HDR created with decision:', payload.decision);

  // Generate mock HDR response
  const hdrId = 'hdr_dev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
  const recordHash = 'a1b2c3d4e5f6' + Date.now().toString(16);

  return {
    hdr_id: hdrId,
    record_hash: recordHash,
    verify_url: `http://localhost:3001/verify/${hdrId}`,
  };
}

export const DEV_MODE = process.env.NODE_ENV === 'development';
