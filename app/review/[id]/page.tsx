'use client';

import { useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { PDFViewer } from '@/components/PDFViewer';
import { MFAGate } from '@/components/MFAGate';
import { DecisionButtons, type EscalationData } from '@/components/DecisionButtons';
import { GeminiPanel, getGeminiChatHistory } from '@/components/GeminiPanel';
import { getDocumentById } from '@/lib/mock-documents';
import { saveHDR, getAllHDRs, getCurrentUser, getUserById, resolveEscalation } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { generateHDRPayload, sealHDR } from '@/lib/hdr-protocol';
import { dispatchToESign, ESignProvider } from '@/lib/esign-service';

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const doc = getDocumentById(resolvedParams.id);
  const { showToast } = useToast();

  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Check if already reviewed or escalated
  const currentUser = getCurrentUser();
  const allHDRs = doc ? getAllHDRs().filter(h => h.document_id === doc.id) : [];
  const existingHDR = allHDRs.find(h => h.status !== 'ESCALATED');
  const escalatedHDR = allHDRs.find(h => h.status === 'ESCALATED' && h.escalated_to === currentUser.id);


  if (!doc) {
    return (
      <div className="min-h-screen pt-14 bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Document Not Found</h1>
          <p className="text-neutral-500 mb-6">The requested document could not be found.</p>
          <a href="/dashboard" className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const handleMfaVerified = useCallback((token: string) => {
    setMfaToken(token);
  }, []);

  async function handleDecision(decision: 'APPROVE' | 'OVERRIDE' | 'ESCALATE', note?: string, escalationData?: EscalationData) {
    if (!mfaToken || !doc) return;

    setCreating(true);
    setError('');

    try {
      const currentUser = getCurrentUser();

      // Check if this is resolving an escalation
      if (escalatedHDR && (decision === 'APPROVE' || decision === 'OVERRIDE')) {
        // Manager is resolving an escalated document
        resolveEscalation(escalatedHDR.hdr_id, currentUser.id, decision, note);
        showToast(
          `Escalation ${decision.toLowerCase()}d. Original reviewer has been notified.`,
          'success',
          4000
        );
        setTimeout(() => router.push('/dashboard'), 1000);
        return;
      }

      // Generate HDR Payload
      const payload = generateHDRPayload(
        doc.id,
        doc.name,
        doc.ai_analysis,
        decision,
        note,
        escalationData ? {
          escalated_to: escalationData.escalated_to,
          escalation_reason: escalationData.escalation_reason
        } : undefined
      );

      // Show "Anchoring to Enterprise Ledger..." toast
      showToast('🔐 Anchoring to Enterprise Ledger...', 'info', 2000);

      // Seal HDR with cryptographic hash and WORM Ledger anchoring (2s delay)
      const { record_hash, ledger_id, sealed_at } = await sealHDR(payload);

      // Generate HDR ID
      const hdr_id = `hdr_${doc.id}_${Date.now()}`;

      // Save to store with complete HDR data (including unified Gemini chat)
      // Map GeminiMessage format ({ role, parts: [{text}] }) → HDR ChatMessage format ({ id, role, content, timestamp })
      const chatHistory = getGeminiChatHistory(doc.id).map((msg: any) => ({
        id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.content || (Array.isArray(msg.parts) ? (msg.parts[0]?.text ?? '') : '') || '',
        timestamp: msg.timestamp || new Date().toISOString(),
      }));

      // If escalating, inject system event into chat transcript for audit trail
      const finalChatTranscript = decision === 'ESCALATE' && escalationData
        ? [
            ...chatHistory,
            {
              id: `system_${Date.now()}`,
              role: 'user' as const,
              content: `### ⚠️ ESCALATION EVENT\n\n**Initiated by:** ${currentUser.name} (${currentUser.role})\n**Assigned to:** ${getUserById(escalationData.escalated_to)?.name || 'Unknown'}\n**Reason:** ${escalationData.escalation_reason}\n**Status:** Awaiting Senior Review\n**Timestamp:** ${new Date().toISOString()}`,
              timestamp: new Date().toISOString(),
            },
          ]
        : chatHistory;

      const hdrData = {
        hdr_id,
        document_id: doc.id,
        document_name: doc.name,
        document_url: doc.url,
        ai_tool: 'gemini-2.5-pro',
        ai_output: doc.ai_analysis,
        decision,
        decision_note: note,
        record_hash,
        ledger_id,
        sealed_at,
        created_at: new Date().toISOString(),
        reviewer_id: currentUser.id,
        reviewer_email: currentUser.email,
        // Enhanced HDR Protocol data (unified Gemini analysis + chat + escalation event)
        chat_transcript: finalChatTranscript,
        governance_context: {
          frameworks: payload.governance_context.frameworks_active,
          internal_policy: payload.governance_context.internal_policy.fileName ? {
            fileName: payload.governance_context.internal_policy.fileName,
            rulesCount: payload.governance_context.internal_policy.rules_count
          } : undefined
        },
        // Phase 1B: QES deferred to Phase 1.5 — default SHA256_ONLY
        certificateStatus: 'SHA256_ONLY' as const,
        // Escalation metadata
        ...(decision === 'ESCALATE' && escalationData ? {
          escalated_by: currentUser.id,
          escalated_to: escalationData.escalated_to,
          escalation_reason: escalationData.escalation_reason,
          status: 'ESCALATED' as const
        } : {}),
      };

      saveHDR(hdrData);

      // Fire-and-forget email notifications via Resend (Phase 1C)
      fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hdr_id,
          document_name: doc.name,
          decision,
          reviewer_name: currentUser.name,
          reviewer_email: currentUser.email,
          decision_note: note,
        }),
      }).catch(err => console.error('[email] Decision notification failed:', err));

      if (sealed_at && record_hash) {
        fetch(`/api/decisions/${hdr_id}/review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            document_name: doc.name,
            decision,
            reviewer_name: currentUser.name,
            certificate_status: 'SHA256_ONLY',
            worm_hash: record_hash,
            sealed_at,
          }),
        }).catch(err => console.error('[email] Sealed notification failed:', err));
      }

      // Show appropriate toast based on decision
      if (decision === 'ESCALATE' && escalationData) {
        const manager = getUserById(escalationData.escalated_to);
        showToast(
          `Document escalated to ${manager?.name}. They will be notified.`,
          'warning',
          4000
        );
      } else if (decision === 'APPROVE') {
        showToast('✓ Decision sealed and archived in WORM Ledger.', 'success', 3000);
      } else if (decision === 'OVERRIDE') {
        showToast('⚠ Override sealed and archived in WORM Ledger.', 'warning', 3000);
      }

      // Redirect to confirmation
      setTimeout(() => router.push(`/confirmation/${hdr_id}`), decision === 'ESCALATE' ? 1000 : 500);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create HDR';
      setError(msg);
      showToast(`Error: ${msg}`, 'error', 4000);
    } finally {
      setCreating(false);
    }
  }

  // If already reviewed, show summary
  if (existingHDR) {
    return (
      <div className="min-h-screen pt-14 bg-[#FAFAFA]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <a href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900 mb-6 inline-block">
            ← Back to Dashboard
          </a>
          <div className="bg-white rounded-xl ring-1 ring-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8">
            <div className="mb-6">
              <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-1 rounded-md ring-1 ${
                existingHDR.decision === 'APPROVE'
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                  : existingHDR.decision === 'OVERRIDE'
                  ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
                  : 'bg-rose-50 text-rose-700 ring-rose-600/20'
              }`}>
                {existingHDR.decision}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">{doc.name}</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-neutral-500">Record Hash:</span>
                <code className="ml-3 font-mono text-neutral-900 bg-neutral-100 px-2 py-1 rounded">{existingHDR.record_hash.slice(0, 16)}...</code>
              </div>
              <div>
                <span className="text-neutral-500">Reviewed:</span>
                <span className="text-neutral-900 ml-3">
                  {new Date(existingHDR.created_at).toLocaleString()}
                </span>
              </div>
              {existingHDR.decision_note && (
                <div>
                  <span className="text-neutral-500">Note:</span>
                  <p className="text-neutral-900 mt-1 ml-3">{existingHDR.decision_note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14 bg-[#FAFAFA]">
      {/* Header */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <a href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900 mb-3 inline-block">
            ← Back to Dashboard
          </a>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">{doc.name}</h1>
              <div className="flex items-center gap-4 text-sm text-neutral-500">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 bg-neutral-50 px-2 py-1 rounded-md ring-1 ring-neutral-200/50">
                  {doc.type}
                </span>
                <span>{doc.pages} pages</span>
                <span>•</span>
                <span>{doc.size}</span>
                <span>•</span>
                <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-1 rounded-md ring-1 ${
                  doc.risk_level === 'high'
                    ? 'bg-rose-50 text-rose-700 ring-rose-600/20'
                    : doc.risk_level === 'medium'
                    ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
                    : 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    doc.risk_level === 'high' ? 'bg-rose-500' :
                    doc.risk_level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  {doc.risk_level} risk
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-neutral-500 mb-1">Uploaded</div>
              <div className="text-sm text-neutral-900" suppressHydrationWarning>
                {new Date(doc.uploaded_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Split View */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* PDF Viewer - 60% */}
          <div className="col-span-12 lg:col-span-7">
            <PDFViewer url={doc.url} documentName={doc.name} />
          </div>

          {/* Analysis & Decision Panel - 40% */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            {/* Escalation Banner */}
            {escalatedHDR && escalatedHDR.escalated_by && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-rose-700 mb-1">⚠️ ESCALATED BY {getUserById(escalatedHDR.escalated_by)?.name.toUpperCase() || 'UNKNOWN'}</h3>
                    <p className="text-sm text-neutral-700 mb-2">{escalatedHDR.escalation_reason}</p>
                    <p className="text-xs text-neutral-500">
                      This document requires your senior review and decision.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Unified Gemini Insights & Chat Panel */}
            <section className="bg-white rounded-xl ring-1 ring-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden h-[800px]">
              <GeminiPanel
                documentId={doc.id}
                documentName={doc.name}
                documentText={doc.ai_analysis}
              />
            </section>

            {/* MFA Gate */}
            <section>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Step 1 — Verify Identity
              </h3>
              <MFAGate onVerified={handleMfaVerified} />
            </section>

            {/* Decision Panel */}
            <section className="sticky top-6">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Step 2 — Record Decision
              </h3>
              <div className="bg-white rounded-xl ring-1 ring-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
                <DecisionButtons
                  disabled={!mfaToken}
                  documentId={doc.id}
                  documentName={doc.name}
                  onDecide={handleDecision}
                  loading={creating}
                  hideEscalate={!!escalatedHDR}
                />
                {error && (
                  <p className="text-sm text-rose-600 mt-3">{error}</p>
                )}
              </div>

              {/* Warning */}
              <p className="text-xs text-neutral-500 text-center mt-4">
                Your decision will be cryptographically sealed and archived in the Enterprise WORM Ledger.
                This action is irreversible and cannot be modified after submission.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
