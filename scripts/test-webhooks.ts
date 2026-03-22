/**
 * Webhook Unit Test Script
 * Run with: npx tsx scripts/test-webhooks.ts
 *
 * Tests the webhook-store module directly (no server needed).
 */

import { addDecision, addAuditLog, getAllDecisions, getAllAuditLogs } from '../lib/webhook-store';

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  PASS: ${name}`);
      passed++;
    } else {
      console.log(`  FAIL: ${name}`);
      failed++;
    }
  }

  console.log('=== Webhook Store Tests ===\n');

  // Test 1: Empty decisions at start
  const emptyDecisions = getAllDecisions();
  assert(emptyDecisions.length === 0, 'getAllDecisions returns empty array initially');

  // Test 2: Add Feedzai decision (score >= 70)
  const feedzaiDecision = addDecision({
    source: 'feedzai',
    type: 'fraud_score',
    score: 87,
    subject_id: 'user_42',
    decision: 'FRAUD_ALERT_HIGH',
    raw_payload: { score: 87, event_type: 'transaction_score', subject_id: 'user_42' },
  });
  assert(feedzaiDecision.id.startsWith('dec_'), 'Feedzai decision has correct ID prefix');
  assert(feedzaiDecision.source === 'feedzai', 'Feedzai decision has correct source');
  assert(feedzaiDecision.score === 87, 'Feedzai decision has correct score');
  assert(feedzaiDecision.decision === 'FRAUD_ALERT_HIGH', 'Feedzai decision has correct decision');
  assert(feedzaiDecision.certificateStatus === 'SHA256_ONLY', 'Feedzai decision has certificateStatus SHA256_ONLY');
  assert(!!feedzaiDecision.created_at, 'Feedzai decision has created_at');

  // Test 3: Decisions list should have 1 entry
  const decisionsAfterFeedzai = getAllDecisions();
  assert(decisionsAfterFeedzai.length === 1, 'getAllDecisions returns 1 decision after adding Feedzai');

  // Test 4: Add Sumsub KYC decision
  const sumsubDecision = addDecision({
    source: 'sumsub',
    type: 'KYC_REVIEW',
    review_answer: 'RED',
    subject_id: 'applicant_123',
    decision: 'KYC_REJECTED_FINAL',
    raw_payload: { reviewAnswer: 'RED', applicantId: 'applicant_123' },
  });
  assert(sumsubDecision.source === 'sumsub', 'Sumsub decision has correct source');
  assert(sumsubDecision.review_answer === 'RED', 'Sumsub decision has RED review answer');

  // Test 5: Add generic decision
  const genericDecision = addDecision({
    source: 'generic',
    type: 'generic_event',
    subject_id: 'entity_456',
    decision: 'WEBHOOK_RECEIVED_GENERIC_EVENT',
    raw_payload: { event_type: 'generic_event', entity_id: 'entity_456' },
  });
  assert(genericDecision.source === 'generic', 'Generic decision has correct source');

  // Test 6: All decisions returned in reverse chronological order
  const allDecisions = getAllDecisions();
  assert(allDecisions.length === 3, 'getAllDecisions returns 3 decisions');
  assert(
    new Date(allDecisions[0].created_at).getTime() >= new Date(allDecisions[1].created_at).getTime(),
    'Decisions are sorted newest first'
  );

  // Test 7: Audit logs
  await addAuditLog('feedzai', '/api/webhooks/feedzai', 'processed', { score: 87 }, 'Decision created');
  await addAuditLog('feedzai', '/api/webhooks/feedzai', 'ignored', { score: 45 }, 'Score below threshold');
  await addAuditLog('sumsub', '/api/webhooks/sumsub', 'rejected', {}, 'Invalid HMAC');

  const auditLogs = getAllAuditLogs();
  assert(auditLogs.length === 3, 'getAllAuditLogs returns 3 entries');
  assert(auditLogs[0].source === 'sumsub' || auditLogs[0].source === 'feedzai', 'Audit log has correct source');
  assert(!!auditLogs[0].payload_hash, 'Audit log has payload hash');

  // Test 8: HMAC computation test
  console.log('\n=== HMAC Tests ===\n');

  const encoder = new TextEncoder();
  const secret = 'test_secret_key';
  const body = '{"reviewAnswer":"RED","applicantId":"123"}';

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const hmac = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');

  assert(hmac.length === 64, 'HMAC-SHA256 produces 64-char hex string');
  assert(/^[0-9a-f]+$/.test(hmac), 'HMAC is valid hex');

  // Verify same input produces same output
  const signature2 = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const hmac2 = Array.from(new Uint8Array(signature2)).map(b => b.toString(16).padStart(2, '0')).join('');
  assert(hmac === hmac2, 'HMAC is deterministic for same input');

  // Different body produces different HMAC
  const signature3 = await crypto.subtle.sign('HMAC', key, encoder.encode(body + 'extra'));
  const hmac3 = Array.from(new Uint8Array(signature3)).map(b => b.toString(16).padStart(2, '0')).join('');
  assert(hmac !== hmac3, 'Different body produces different HMAC');

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
