/**
 * POST /api/webhooks/sumsub
 *
 * Sumsub KYC webhook with HMAC-SHA256 signature validation.
 *
 * CRITICAL: rawBody is computed ONLY within this route handler.
 *           No global Fastify/Next.js body parser is modified.
 *
 * - HMAC-SHA256 validation using SUMSUB_WEBHOOK_SECRET
 * - reviewAnswer == "RED" → creates KYC decision record
 * - reviewAnswer != "RED" → ignored (returns 200 with { ignored: true })
 * - Invalid HMAC → returns 401
 * - Always logs for compliance audit
 */

import { NextRequest, NextResponse } from 'next/server';
import { addDecision, addAuditLog } from '../../../../lib/webhook-store';
import { notifyNewDecision } from '../../../../lib/email.service';

export const dynamic = 'force-dynamic';

/**
 * Compute HMAC-SHA256 of the raw body using the webhook secret.
 * This is scoped entirely to this route — no global parser changes.
 */
async function computeHmacSha256(rawBody: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Timing-safe comparison to prevent timing attacks on HMAC validation.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function POST(req: NextRequest) {
  // --- Read raw body for HMAC (scoped to this route only) ---
  const rawBody = await req.text();
  let body: Record<string, unknown> = {};

  try {
    body = JSON.parse(rawBody);
  } catch {
    await addAuditLog('sumsub', '/api/webhooks/sumsub', 'rejected', {}, 'Invalid JSON body');
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // --- HMAC-SHA256 validation ---
  const secret = process.env.SUMSUB_WEBHOOK_SECRET;

  if (!secret) {
    console.error('[SUMSUB] SUMSUB_WEBHOOK_SECRET not configured in environment');
    await addAuditLog('sumsub', '/api/webhooks/sumsub', 'rejected', body, 'SUMSUB_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  // Sumsub sends the digest in x-payload-digest header (lowercase hex)
  const receivedDigest = req.headers.get('x-payload-digest')
    || req.headers.get('x-sumsub-signature')
    || '';

  if (!receivedDigest) {
    await addAuditLog('sumsub', '/api/webhooks/sumsub', 'rejected', body, 'Missing HMAC signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  const expectedDigest = await computeHmacSha256(rawBody, secret);

  if (!timingSafeEqual(receivedDigest.toLowerCase(), expectedDigest.toLowerCase())) {
    await addAuditLog('sumsub', '/api/webhooks/sumsub', 'rejected', body, 'Invalid HMAC signature');
    return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
  }

  // --- Review answer evaluation ---
  const reviewAnswer = (body.reviewAnswer as string)
    || ((body.reviewResult as Record<string, unknown>)?.reviewAnswer as string)
    || '';

  if (reviewAnswer !== 'RED') {
    await addAuditLog('sumsub', '/api/webhooks/sumsub', 'ignored', body, `reviewAnswer=${reviewAnswer}, not RED`);
    return NextResponse.json({ ok: true, ignored: true, reason: `reviewAnswer=${reviewAnswer}` });
  }

  // --- Create KYC decision record ---
  const applicantId = (body.applicantId as string) || (body.externalUserId as string) || undefined;
  const reviewRejectType = ((body.reviewResult as Record<string, unknown>)?.reviewRejectType as string) || 'UNKNOWN';

  const decision = addDecision({
    source: 'sumsub',
    type: (body.type as string) || 'KYC_REVIEW',
    review_answer: reviewAnswer,
    subject_id: applicantId,
    decision: `KYC_REJECTED_${reviewRejectType}`,
    raw_payload: body,
  });

  await addAuditLog('sumsub', '/api/webhooks/sumsub', 'processed', body, `KYC decision created: ${decision.id}`);

  // Fire-and-forget email notification
  notifyNewDecision({
    hdr_id: decision.id,
    document_name: `Sumsub KYC: ${decision.decision}`,
    decision: 'ESCALATE',
    reviewer_name: 'Sumsub Webhook',
    reviewer_email: 'webhooks@sumsub.com',
    decision_note: `KYC rejected (${reviewRejectType}) for applicant ${applicantId || 'unknown'}`,
  });

  return NextResponse.json({
    ok: true,
    decision_id: decision.id,
    certificateStatus: decision.certificateStatus,
    review_answer: reviewAnswer,
  });
}
