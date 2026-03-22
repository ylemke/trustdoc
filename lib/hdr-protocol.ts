/**
 * TrustDoc HDR Protocol - Sprint 3
 * Enhanced Human Decision Record with Enterprise WORM Ledger anchoring
 */

import { getCurrentUser, getGovernanceConfig, getInternalPolicy } from './store';
import { getChatHistory, type ChatMessage } from '@/components/ComplianceChat';

export interface HDRPayload {
  // Metadata
  timestamp: string;
  user_id: string;
  user_email: string;
  user_name: string;
  user_role: string;
  document_id: string;
  document_name: string;

  // Governance Context
  governance_context: {
    frameworks_active: string[];
    internal_policy: {
      fileName: string | null;
      rules_count: number;
    };
  };

  // AI Analysis
  ai_tool: string;
  ai_output: string;

  // Chat Transcript
  chat_transcript: ChatMessage[];
  chat_interactions_count: number;

  // Final Decision
  decision: 'APPROVE' | 'OVERRIDE' | 'ESCALATE';
  decision_note?: string;
  escalation_data?: {
    escalated_to: string;
    escalation_reason: string;
  };
}

/**
 * Generate complete HDR Payload for cryptographic sealing
 */
export function generateHDRPayload(
  documentId: string,
  documentName: string,
  aiOutput: string,
  decision: 'APPROVE' | 'OVERRIDE' | 'ESCALATE',
  note?: string,
  escalationData?: { escalated_to: string; escalation_reason: string }
): HDRPayload {
  const currentUser = getCurrentUser();
  const governance = getGovernanceConfig();
  const policy = getInternalPolicy();
  const chatHistory = getChatHistory(documentId);

  // Build active frameworks list
  const activeFrameworks: string[] = [];
  if (governance.euAiAct) activeFrameworks.push('EU AI Act');
  if (governance.lgpd) activeFrameworks.push('LGPD (Brazil)');
  if (governance.coloradoSB205) activeFrameworks.push('Colorado SB 205');

  const payload: HDRPayload = {
    // Metadata
    timestamp: new Date().toISOString(),
    user_id: currentUser.id,
    user_email: currentUser.email,
    user_name: currentUser.name,
    user_role: currentUser.role,
    document_id: documentId,
    document_name: documentName,

    // Governance Context
    governance_context: {
      frameworks_active: activeFrameworks,
      internal_policy: {
        fileName: policy.fileName,
        rules_count: policy.extractedRules.length
      }
    },

    // AI Analysis
    ai_tool: 'claude-3-5-sonnet-20241022',
    ai_output: aiOutput,

    // Chat Transcript
    chat_transcript: chatHistory,
    chat_interactions_count: chatHistory.length,

    // Final Decision
    decision,
    decision_note: note,
    ...(escalationData && { escalation_data: escalationData })
  };

  return payload;
}

/**
 * Generate SHA-256 hash of HDR Payload (Cryptographic Seal)
 */
export async function generateRecordHash(payload: HDRPayload): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Simulate WORM Ledger anchoring (2 second delay)
 * Returns enterprise ledger ID in format: QLDB-[first 8 chars of hash]...[last 8 chars]
 */
export async function anchorToLedger(hash: string): Promise<string> {
  // Simulate enterprise ledger write delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Generate enterprise ledger reference
  const ledgerId = `QLDB-${hash.slice(0, 8)}...${hash.slice(-8)}`;

  return ledgerId;
}

/**
 * Complete HDR sealing process with WORM Ledger anchoring
 */
export async function sealHDR(payload: HDRPayload): Promise<{
  record_hash: string;
  ledger_id: string;
  sealed_at: string;
}> {
  // Step 1: Generate cryptographic hash
  const record_hash = await generateRecordHash(payload);

  // Step 2: Anchor to Enterprise WORM Ledger (simulated)
  const ledger_id = await anchorToLedger(record_hash);

  return {
    record_hash,
    ledger_id,
    sealed_at: new Date().toISOString()
  };
}

/**
 * Verify HDR integrity by recomputing hash
 */
export async function verifyHDRIntegrity(
  payload: HDRPayload,
  expectedHash: string
): Promise<boolean> {
  const computedHash = await generateRecordHash(payload);
  return computedHash === expectedHash;
}
