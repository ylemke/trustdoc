/**
 * POST /api/webhooks/generic
 *
 * Generic webhook handler for arbitrary providers.
 * - Validates x-api-key header against a set of known API keys
 *   (in production, these would come from a database lookup)
 * - Logs and stores all webhooks for compliance audit
 * - Always returns 200 OK for valid webhooks
 */

import { NextRequest, NextResponse } from 'next/server';
import { addDecision, addAuditLog } from '../../../../lib/webhook-store';
import { notifyNewDecision } from '../../../../lib/email.service';

export const dynamic = 'force-dynamic';

/**
 * In production this would query the database for registered webhook API keys.
 * For now, keys are stored in the GENERIC_WEBHOOK_KEYS env var as a comma-separated list.
 * Example: GENERIC_WEBHOOK_KEYS=key_abc123,key_def456
 */
function isValidApiKey(key: string): { valid: boolean; provider?: string } {
  const keysEnv = process.env.GENERIC_WEBHOOK_KEYS || '';
  if (!keysEnv) {
    return { valid: false };
  }

  const registeredKeys = keysEnv.split(',').map(k => k.trim()).filter(Boolean);
  const found = registeredKeys.includes(key);
  return { valid: found, provider: found ? 'registered_provider' : undefined };
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};

  try {
    body = await req.json();
  } catch {
    await addAuditLog('generic', '/api/webhooks/generic', 'rejected', {}, 'Invalid JSON body');
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // --- API key validation ---
  const apiKey = req.headers.get('x-api-key') || '';

  if (!apiKey) {
    await addAuditLog('generic', '/api/webhooks/generic', 'rejected', body, 'Missing x-api-key header');
    return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
  }

  const { valid, provider } = isValidApiKey(apiKey);

  if (!valid) {
    await addAuditLog('generic', '/api/webhooks/generic', 'rejected', body, 'Invalid API key');
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  // --- Store decision ---
  const eventType = (body.event_type as string) || (body.type as string) || 'generic_event';

  const decision = addDecision({
    source: 'generic',
    type: eventType,
    subject_id: (body.subject_id as string) || (body.user_id as string) || (body.entity_id as string) || undefined,
    decision: `WEBHOOK_RECEIVED_${eventType.toUpperCase()}`,
    raw_payload: body,
  });

  await addAuditLog('generic', '/api/webhooks/generic', 'processed', body, `Decision stored: ${decision.id}, provider: ${provider}`);

  // Fire-and-forget email notification
  notifyNewDecision({
    hdr_id: decision.id,
    document_name: `Generic Webhook: ${eventType}`,
    decision: 'APPROVE',
    reviewer_name: `${provider || 'Generic'} Webhook`,
    reviewer_email: 'webhooks@trustdoc.dev',
    decision_note: `Event ${eventType} from provider ${provider || 'unknown'}`,
  });

  return NextResponse.json({
    ok: true,
    decision_id: decision.id,
    certificateStatus: decision.certificateStatus,
    event_type: eventType,
  });
}
