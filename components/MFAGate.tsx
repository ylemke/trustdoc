'use client';

/**
 * MFA Gate component — Prompt 4 implementation.
 *
 * First call: user enters 6-digit TOTP → validates → stores 5-min session token.
 * Subsequent calls within 5 minutes: session token is used automatically.
 * No TOTP re-entry until session expires.
 */
import { useState, useEffect } from 'react';
import { validateMfa, isMfaSessionActive, getMfaSessionToken } from '@/lib/api';
import { validateMfaDev, DEV_MODE } from '@/lib/api-dev';

interface MFAGateProps {
  onVerified: (token: string) => void;
  onReset?: () => void;
}

export function MFAGate({ onVerified, onReset }: MFAGateProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

  // Check if MFA session is already active on mount (Prompt 4)
  useEffect(() => {
    if (isMfaSessionActive()) {
      setSessionActive(true);
      const token = getMfaSessionToken()!;
      onVerified(token);
    }
  }, [onVerified]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length < 6) return;
    setLoading(true);
    setError('');
    try {
      // Try real MFA first, fallback to dev mode
      let result;
      try {
        result = await validateMfa(code);
      } catch (apiError) {
        if (DEV_MODE) {
          console.log('⚠️ Backend MFA failed, using dev mode');
          result = await validateMfaDev(code);
        } else {
          throw apiError;
        }
      }

      if (result.valid) {
        // Use session token if issued, else use the TOTP code itself
        const token = result.mfa_session_token ?? code;
        setSessionActive(true);
        onVerified(token);
      } else {
        setError('Invalid code. Try again.');
        setCode('');
      }
    } catch {
      setError('Invalid code. Try again.');
      setCode('');
    } finally {
      setLoading(false);
    }
  }

  // Session active — show indicator, no TOTP needed
  if (sessionActive) {
    return (
      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
        <span className="text-lg text-emerald-600">✓</span>
        <div>
          <p className="text-sm font-medium text-neutral-900">Identity verified</p>
          <p className="text-xs text-emerald-600">MFA session active (5 min)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl ring-1 ring-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
      <h3 className="font-semibold text-neutral-900 mb-1">Verify your identity</h3>
      <p className="text-sm text-neutral-500 mb-4">
        {DEV_MODE ? (
          <>
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-1 rounded-md ring-1 ring-amber-600/20 mr-2">DEV MODE</span>
            Enter any 6-digit code (e.g., 123456) to continue. You will not be asked again for 5 minutes.
          </>
        ) : (
          <>
            Enter your 6-digit authenticator code to record your decision.
            You will not be asked again for 5 minutes.
          </>
        )}
      </p>
      <form onSubmit={handleVerify} className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6,8}"
          maxLength={8}
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          style={{ color: '#000000 !important', backgroundColor: '#ffffff !important', caretColor: '#000000 !important' }}
          className="w-36 border-2 border-neutral-300 rounded-lg px-4 py-2 font-mono text-center text-xl font-bold placeholder-neutral-400 focus:border-neutral-900 focus:outline-none transition-all"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="bg-neutral-900 text-white rounded-lg px-6 py-2 font-medium hover:bg-neutral-800 disabled:opacity-40 transition-colors"
        >
          {loading ? '…' : 'Verify'}
        </button>
      </form>
      {error && <p className="text-sm text-rose-600 mt-2">{error}</p>}
    </div>
  );
}
