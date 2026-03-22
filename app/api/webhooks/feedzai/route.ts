/**
 * POST /api/webhooks/feedzai
 *
 * Feedzai fraud-scoring webhook.
 * - Validates x-feedzai-api-key header against FEEDZAI_API_KEY env var
 * - Score >= 70 → creates a decision record
 * - Score < 70  → ignored (returns 200 with { ignored: true })
 * - Always returns 200 OK for successfully received webhooks
 * - All webhooks are logged for compliance audit
 */

import { NextRequest, NextResponse } from 'next/server';
import { addDecision, addAuditLog } from '../../../../lib/webhook-store';
import { notifyNewDecision } from '../../../../lib/email.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};

  try {
    body = await req.json();
  } catch {
    await addAuditLog('feedzai', '/api/webhooks/feedzai', 'rejected', {}, 'Invalid JSON body');
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // --- Header validation ---
  const apiKey = req.headers.get('x-feedzai-api-key');
  const expectedKey = process.env.FEEDZAI_API_KEY;

  if (!expectedKey) {
    console.error('[FEEDZAI] FEEDZAI_API_KEY not configured in environment');
    await addAuditLog('feedzai', '/api/webhooks/feedzai', 'rejected', body, 'FEEDZAI_API_KEY not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  if (!apiKey || apiKey !== expectedKey) {
    await addAuditLog('feedzai', '/api/webhooks/feedzai', 'rejected', body, 'Invalid API key');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // --- Score evaluation ---
  const score = typeof body.score === 'number' ? body.score : NaN;

  if (isNaN(score)) {
    await addAuditLog('feedzai', '/api/webhooks/feedzai', 'ignored', body, 'Missing or invalid score');
    return NextResponse.json({ ok: true, ignored: true, reason: 'Missing or invalid score' });
  }

  if (score < 70) {
    await addAuditLog('feedzai', '/api/webhooks/feedzai', 'ignored', body, `Score ${score} below threshold 70`);
    return NextResponse.json({ ok: true, ignored: true, reason: `Score ${score} below threshold` });
  }

  // --- Create decision record ---
  const decision = addDecision({
    source: 'feedzai',
    type: (body.event_type as string) || 'fraud_score',
    score,
    subject_id: (body.subject_id as string) || (body.user_id as string) || undefined,
    decision: `FRAUD_ALERT_${score >= 90 ? 'CRITICAL' : 'HIGH'}`,
    raw_payload: body,
  });

  await addAuditLog('feedzai', '/api/webhooks/feedzai', 'processed', body, `Decision created: ${decision.id}`);

  // Fire-and-forget email notification
  notifyNewDecision({
    hdr_id: decision.id,
    document_name: `Feedzai Alert: ${decision.decision}`,
    decision: 'ESCALATE',
    reviewer_name: 'Feedzai Webhook',
    reviewer_email: 'webhooks@feedzai.com',
    decision_note: `Fraud score ${score} from subject ${decision.subject_id || 'unknown'}`,
  });

  return NextResponse.json({
    ok: true,
    decision_id: decision.id,
    certificateStatus: decision.certificateStatus,
    score,
  });
}
