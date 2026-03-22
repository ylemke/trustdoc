'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { Lock, ShieldCheck, Send, FileCheck } from 'lucide-react';
import { getHDRById, getUserById, getCurrentUser, saveHDR } from '@/lib/store';
import { dispatchToESign, ESignProvider } from '@/lib/esign-service';
import { prepareForSign } from '@/lib/pdf-seal-engine';

export default function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [hdrState, setHdrState] = useState(() => getHDRById(resolvedParams.id));
  const hdr = hdrState;
  const [copied, setCopied] = useState(false);
  const [sendingToDocuSign, setSendingToDocuSign] = useState(false);
  const [docuSignStatus, setDocuSignStatus] = useState<'idle' | 'generating' | 'dispatching' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSendToDocuSign = async () => {
    if (!hdr || !hdr.ledger_id) return;

    setSendingToDocuSign(true);
    setErrorMessage('');
    setDocuSignStatus('generating');

    try {
      const currentUser = getCurrentUser();
      const reviewer = getUserById(hdr.reviewer_id);
      const verificationUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/verify?hash=${hdr.ledger_id}`
        : '';

      // Step 1: Generate Certified PDF with Official Seal Engine
      console.log('📄 Generating Certified PDF with sidebar stamps and certificate page...');
      console.log('📋 HDR data:', {
        hdr_id: hdr.hdr_id,
        ledger_id: hdr.ledger_id,
        document_name: hdr.document_name,
        document_url: hdr.document_url,
      });

      try {
        const { blob, filename } = await prepareForSign({
          hdr,
          reviewerName: reviewer?.name || currentUser.name,
          reviewerRole: reviewer?.role || currentUser.role,
          reviewerEmail: reviewer?.email || hdr.reviewer_email,
          verificationUrl,
          originalPdfUrl: hdr.document_url,
        });

        console.log('✅ Certified PDF prepared:', filename, `(${(blob.size / 1024).toFixed(2)} KB)`);
        console.log('✅ Blob details:', { size: blob.size, type: blob.type });

        // Step 2: Dispatch to DocuSign
        setDocuSignStatus('dispatching');
        console.log('📧 Dispatching to DocuSign API...');

        const envelope = await dispatchToESign(
          hdr.document_id,
          hdr.document_name,
          hdr.ledger_id,
          reviewer?.name || currentUser.name,
          ESignProvider.DOCUSIGN
        );

        console.log('✅ Successfully dispatched to DocuSign:', envelope.envelope_id);

        // Step 3: Update HDR with e-sign metadata
        const updatedHdr = {
          ...hdr,
          esign_status: 'SENT' as const,
          esign_envelope_id: envelope.envelope_id,
          esign_provider: envelope.provider,
          esign_sent_at: envelope.sent_at,
        };

        saveHDR(updatedHdr);
        setHdrState(updatedHdr);
        setDocuSignStatus('sent');

        console.log('✅ HDR updated with e-signature metadata');
      } catch (pdfError) {
        console.error('❌ PDF generation failed:', pdfError);
        console.error('❌ PDF error details:', {
          name: (pdfError as Error).name,
          message: (pdfError as Error).message,
          stack: (pdfError as Error).stack,
        });
        throw new Error(`PDF generation failed: ${(pdfError as Error).message}`);
      }
    } catch (error) {
      console.error('❌ DocuSign dispatch failed:', error);
      console.error('❌ Full error object:', error);
      console.error('❌ Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack,
      });

      const errorMsg = error instanceof Error ? error.message : 'Failed to send to DocuSign. Check console for details.';
      setErrorMessage(errorMsg);
      setDocuSignStatus('error');

      // Show user-friendly error alert
      if (typeof window !== 'undefined') {
        alert(`❌ Error: ${errorMsg}\n\nPlease check the browser console for detailed error information.`);
      }
    } finally {
      setSendingToDocuSign(false);
    }
  };

  if (!hdr) {
    return (
      <div className="min-h-screen pt-14 bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">HDR Not Found</h1>
          <p className="text-neutral-500 mb-6">The requested record could not be found.</p>
          <Link href="/dashboard" className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const decisionColors = {
    APPROVE: 'inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md ring-1 ring-emerald-600/20',
    OVERRIDE: 'inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-1 rounded-md ring-1 ring-amber-600/20',
    ESCALATE: 'inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider bg-rose-50 text-rose-700 px-2 py-1 rounded-md ring-1 ring-rose-600/20',
  };

  const decisionIcons = {
    APPROVE: (
      <svg className="w-16 h-16 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    OVERRIDE: (
      <svg className="w-16 h-16 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    ESCALATE: (
      <svg className="w-16 h-16 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  };

  return (
    <div className="min-h-screen pt-14 bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8 animate-fade-in">
          {decisionIcons[hdr.decision as keyof typeof decisionIcons]}
          <h1 className="text-3xl font-bold text-neutral-900 mt-6 mb-2">
            Decision Sealed & Archived
          </h1>
          <p className="text-neutral-500">
            Your Human Decision Record has been cryptographically sealed and archived in the Enterprise WORM Ledger
          </p>
        </div>

        {/* HDR Details Card */}
        <div className="bg-white rounded-xl ring-1 ring-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8 space-y-6 animate-slide-up">
          {/* Decision Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500">Decision Type</span>
            <span className={decisionColors[hdr.decision as keyof typeof decisionColors]}>
              {hdr.decision}
            </span>
          </div>

          {/* Document Name */}
          <div>
            <span className="text-sm font-medium text-neutral-500 block mb-2">Document</span>
            <p className="text-base text-neutral-900 font-medium">{hdr.document_name}</p>
          </div>

          {/* HDR ID */}
          <div>
            <span className="text-sm font-medium text-neutral-500 block mb-2">HDR ID</span>
            <code className="block font-mono text-sm text-neutral-900 bg-neutral-100 px-3 py-2 rounded-lg">{hdr.hdr_id}</code>
          </div>

          {/* Record Hash */}
          <div>
            <span className="text-sm font-medium text-neutral-500 block mb-2">Record Hash (SHA-256)</span>
            <code className="block font-mono text-xs text-neutral-900 bg-neutral-100 px-3 py-2 rounded-lg break-all">{hdr.record_hash}</code>
          </div>

          {/* Enterprise Ledger ID */}
          {hdr.ledger_id && (
            <div>
              <span className="text-sm font-medium text-neutral-500 block mb-2">Enterprise Ledger ID</span>
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="w-6 h-6 text-violet-600" strokeWidth={1.5} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-violet-900">Verified in WORM Ledger</p>
                    <p className="text-xs text-violet-700 mt-0.5">Immutably archived in Enterprise WORM Registry (Write Once, Read Many)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-sm text-violet-900 bg-white px-3 py-2 rounded border border-violet-200">{hdr.ledger_id}</code>
                  <button
                    onClick={() => copyToClipboard(hdr.ledger_id!)}
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700 transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Copied
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Chat Transcript Info */}
          {hdr.chat_transcript && hdr.chat_transcript.length > 0 && (
            <div>
              <span className="text-sm font-medium text-neutral-500 block mb-2">Chat Transcript</span>
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                  <div>
                    <p className="text-sm text-neutral-700">{hdr.chat_transcript.length} AI interactions recorded and sealed</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Complete conversation transcript included in audit trail</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Governance Context */}
          {hdr.governance_context && (
            <div>
              <span className="text-sm font-medium text-neutral-500 block mb-2">Governance Context</span>
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 space-y-3">
                {hdr.governance_context.frameworks && hdr.governance_context.frameworks.length > 0 && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-2">Active Frameworks:</p>
                    <div className="flex flex-wrap gap-2">
                      {hdr.governance_context.frameworks.map((framework: string) => (
                        <span key={framework} className="inline-flex text-[10px] uppercase tracking-wider text-neutral-700 bg-white px-2 py-1 rounded-md ring-1 ring-neutral-200">
                          {framework}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {hdr.governance_context.internal_policy && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Internal Policy:</p>
                    <p className="text-sm text-neutral-700">{hdr.governance_context.internal_policy.fileName} ({hdr.governance_context.internal_policy.rulesCount} rules)</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div>
            <span className="text-sm font-medium text-neutral-500 block mb-2">Created At</span>
            <p className="text-sm text-neutral-700" suppressHydrationWarning>
              {new Date(hdr.created_at).toLocaleString()}
            </p>
          </div>

          {/* Sealed Status */}
          {hdr.sealed_at && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600" strokeWidth={2} />
                <div>
                  <p className="text-sm font-medium text-emerald-700">Sealed & Archived</p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    Record is cryptographically sealed and stored in immutable WORM registry
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* DocuSign Gateway - The Handover */}
          {hdr.decision === 'APPROVE' && hdr.ledger_id && (
            <div className="border-t border-neutral-200 pt-6">
              <span className="text-sm font-medium text-neutral-500 block mb-3">Document Execution</span>

              {/* Not sent yet - Show send button */}
              {!hdr.esign_status && docuSignStatus === 'idle' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <FileCheck className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-blue-900 mb-1">
                        Ready for Legal Execution
                      </h3>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        This document has been approved and sealed. You can now dispatch it to DocuSign for counterparty signature.
                        The certified PDF will include the cryptographic certificate and verification QR code.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSendToDocuSign}
                    disabled={sendingToDocuSign}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" strokeWidth={2} />
                    Send to DocuSign
                  </button>
                </div>
              )}

              {/* Generating/Dispatching states */}
              {(docuSignStatus === 'generating' || docuSignStatus === 'dispatching') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <div className="flex items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900">
                        {docuSignStatus === 'generating' ? '📄 Generating Certified PDF...' : '📧 Dispatching to DocuSign API...'}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {docuSignStatus === 'generating'
                          ? 'Adding certification watermarks and Certificate of Authenticity'
                          : 'Uploading document and creating signature envelope'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error state */}
              {docuSignStatus === 'error' && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <svg className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-rose-900 mb-1">Failed to Send to DocuSign</p>
                      <p className="text-xs text-rose-700">{errorMessage}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDocuSignStatus('idle')}
                    className="text-xs text-rose-700 hover:text-rose-900 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Successfully sent - Show status */}
              {(hdr.esign_status === 'SENT' || docuSignStatus === 'sent') && hdr.esign_envelope_id && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Send className="w-5 h-5 text-blue-600" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
                        Out for Signature
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          {hdr.esign_status}
                        </span>
                      </h3>
                      <p className="text-xs text-blue-700 mb-3">
                        Document successfully dispatched via {hdr.esign_provider === 'DOCUSIGN' ? 'DocuSign' : 'Adobe Sign'} API
                      </p>
                      <div className="space-y-2">
                        <div>
                          <span className="text-[10px] text-blue-600 uppercase tracking-wider font-semibold">Envelope ID</span>
                          <code className="block text-xs font-mono text-blue-900 bg-white px-2 py-1.5 rounded border border-blue-200 mt-1">
                            {hdr.esign_envelope_id}
                          </code>
                        </div>
                        <div>
                          <span className="text-[10px] text-blue-600 uppercase tracking-wider font-semibold">Certification Anchor</span>
                          <code className="block text-xs font-mono text-blue-900 bg-white px-2 py-1.5 rounded border border-blue-200 mt-1">
                            {hdr.ledger_id}
                          </code>
                        </div>
                        <div className="pt-2 border-t border-blue-200">
                          <p className="text-[10px] text-blue-600">
                            📧 Sent {hdr.esign_sent_at ? new Date(hdr.esign_sent_at).toLocaleString() : 'just now'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Escalation Details */}
          {hdr.decision === 'ESCALATE' && hdr.escalated_by && hdr.escalated_to && (
            <div>
              <span className="text-sm font-medium text-neutral-500 block mb-2">Escalation Details</span>
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-3">
                  <svg className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-rose-700 mb-2">Transfer of Accountability</p>
                    <p className="text-sm text-neutral-700">
                      Escalated by <span className="font-semibold text-neutral-900">{getUserById(hdr.escalated_by)?.name || 'Unknown'}</span> to{' '}
                      <span className="font-semibold text-neutral-900">{getUserById(hdr.escalated_to)?.name || 'Unknown'}</span>
                    </p>
                    {hdr.escalation_reason && (
                      <div className="mt-3 pt-3 border-t border-rose-200">
                        <p className="text-xs text-neutral-500 mb-1">Reason:</p>
                        <p className="text-sm text-neutral-700">{hdr.escalation_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Decision Note (for non-escalation) */}
          {hdr.decision_note && hdr.decision !== 'ESCALATE' && (
            <div>
              <span className="text-sm font-medium text-neutral-500 block mb-2">Decision Note</span>
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <p className="text-sm text-neutral-700">{hdr.decision_note}</p>
              </div>
            </div>
          )}

          {/* Compliance Info */}
          <div className="pt-6 border-t border-neutral-100">
            <p className="text-xs text-neutral-500 mb-3">This record satisfies:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-neutral-700">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                EU AI Act Article 12 (Tamper-proof Logging)
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-700">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                EU AI Act Article 14 (Human Oversight)
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-700">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Colorado SB 205 (Risk Management Records)
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8 justify-center">
          <Link href="/dashboard" className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors">
            Back to Dashboard
          </Link>
          <Link href={`/audit/${hdr.hdr_id}`} className="px-4 py-2 bg-white text-neutral-700 ring-1 ring-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
            View Full Audit Record
          </Link>
        </div>
      </div>
    </div>
  );
}
