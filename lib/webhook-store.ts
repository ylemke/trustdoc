/**
 * TrustDoc Webhook Store
 * Server-side in-memory store for webhook decisions and audit logs.
 * In production, this would be backed by PostgreSQL.
 */

export interface WebhookDecision {
  id: string;
  source: 'feedzai' | 'sumsub' | 'generic';
  type: string;
  score?: number;
  review_answer?: string;
  subject_id?: string;
  decision: string;
  certificateStatus: string;
  raw_payload: Record<string, unknown>;
  created_at: string;
}

export interface WebhookAuditLog {
  id: string;
  source: string;
  endpoint: string;
  received_at: string;
  status: 'processed' | 'ignored' | 'rejected';
  reason?: string;
  payload_hash: string;
  ip_address?: string;
}

// In-memory stores (persist for process lifetime)
const decisions: WebhookDecision[] = [];
const auditLogs: WebhookAuditLog[] = [];

// Generate a simple unique ID
function generateId(prefix: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${ts}_${rand}`;
}

// Simple SHA-256 hash of payload for audit
async function hashPayload(payload: unknown): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function addDecision(decision: Omit<WebhookDecision, 'id' | 'created_at' | 'certificateStatus'>): WebhookDecision {
  const record: WebhookDecision = {
    ...decision,
    id: generateId('dec'),
    certificateStatus: 'SHA256_ONLY',
    created_at: new Date().toISOString(),
  };
  decisions.push(record);
  console.log(`[WEBHOOK] Decision created: ${record.id} source=${record.source} decision=${record.decision}`);
  return record;
}

export async function addAuditLog(
  source: string,
  endpoint: string,
  status: 'processed' | 'ignored' | 'rejected',
  payload: unknown,
  reason?: string,
  ipAddress?: string,
): Promise<WebhookAuditLog> {
  const record: WebhookAuditLog = {
    id: generateId('audit'),
    source,
    endpoint,
    received_at: new Date().toISOString(),
    status,
    reason,
    payload_hash: await hashPayload(payload),
    ip_address: ipAddress,
  };
  auditLogs.push(record);
  console.log(`[WEBHOOK AUDIT] ${record.id} source=${source} status=${status} reason=${reason || 'n/a'}`);
  return record;
}

export function getAllDecisions(): WebhookDecision[] {
  return [...decisions].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getAllAuditLogs(): WebhookAuditLog[] {
  return [...auditLogs].sort((a, b) =>
    new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
  );
}
