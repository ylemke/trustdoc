'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Database, FileText, Download, Brain, MessageSquare, CheckCircle, ChevronDown, ChevronUp, PenTool, FileCheck } from 'lucide-react';
import { getHDRById, getUserById } from '@/lib/store';
import QRCode from 'react-qr-code';
import { generateCertifiedPDF, downloadCertifiedPDF } from '@/lib/pdf-seal-engine';

export default function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [hdr, setHdr] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [expandedEvent1, setExpandedEvent1] = useState(false);
  const [expandedEvent2, setExpandedEvent2] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [certificateOnlyMode, setCertificateOnlyMode] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState('');

  // Fetch HDR data on client side only
  useEffect(() => {
    const fetchedHdr = getHDRById(resolvedParams.id);
    setHdr(fetchedHdr);
    setLoading(false);
  }, [resolvedParams.id]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Set verification URL on client side only
  useEffect(() => {
    if (hdr?.ledger_id) {
      setVerificationUrl(`${window.location.origin}/verify?hash=${hdr.ledger_id}`);
    }
  }, [hdr?.ledger_id]);

  const handleExport = async () => {
    if (!hdr) return;

    setIsGeneratingPDF(true);
    setCertificateOnlyMode(false);

    try {
      const reviewer = getUserById(hdr.reviewer_id);

      const blob = await generateCertifiedPDF({
        hdr,
        reviewerName: reviewer?.name || 'Unknown',
        reviewerRole: reviewer?.role || 'Unknown',
        reviewerEmail: reviewer?.email || hdr.reviewer_email,
        verificationUrl,
        originalPdfUrl: hdr.document_url,
      });

      const filename = `AUDIT_${hdr.document_name.replace(/\.pdf$/i, '')}.pdf`;
      downloadCertifiedPDF(blob, filename);
    } catch (error) {
      console.error('Failed to generate certified PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleExportCertifiedPDF = async () => {
    if (!hdr) return;

    setIsGeneratingPDF(true);
    setCertificateOnlyMode(true);

    try {
      const reviewer = getUserById(hdr.reviewer_id);

      const blob = await generateCertifiedPDF({
        hdr,
        reviewerName: reviewer?.name || 'Unknown',
        reviewerRole: reviewer?.role || 'Unknown',
        reviewerEmail: reviewer?.email || hdr.reviewer_email,
        verificationUrl,
        originalPdfUrl: hdr.document_url,
      });

      const filename = `CERTIFIED_${hdr.document_name.replace(/\.pdf$/i, '')}.pdf`;
      downloadCertifiedPDF(blob, filename);
    } catch (error) {
      console.error('Failed to generate certified PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
      setCertificateOnlyMode(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-14 bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-neutral-200 border-t-neutral-900 mx-auto mb-6"></div>
          <p className="text-lg font-semibold text-neutral-900">Loading audit record...</p>
        </div>
      </div>
    );
  }

  if (!hdr) {
    return (
      <div className="min-h-screen pt-14 bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Audit Record Not Found</h1>
          <p className="text-neutral-500 mb-6">The requested audit record could not be found.</p>
          <Link href="/audit" className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors">
            ← Back to Audit Trail
          </Link>
        </div>
      </div>
    );
  }

  const reviewer = getUserById(hdr.reviewer_id);
  const decisionColors = {
    APPROVE: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
    OVERRIDE: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', ring: 'ring-amber-600/20' },
    ESCALATE: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', ring: 'ring-rose-600/20' },
  };

  const colors = decisionColors[hdr.decision as keyof typeof decisionColors];

  return (
    <div className="min-h-screen pt-14 bg-[#FAFAFA]">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm 20mm 20mm 28mm; /* Left margin slightly wider for watermark simulation */
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          .print-full-width {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-show { display: block !important; }
          .print-certificate-only { display: ${certificateOnlyMode ? 'none' : 'block'} !important; }
          .expandable-content {
            max-height: none !important;
            overflow: visible !important;
          }
          /* Ensure QR code prints */
          svg {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          /* Watermark banner */
          .certification-watermark {
            display: ${certificateOnlyMode ? 'block' : 'none'} !important;
            page-break-after: avoid;
          }
        }
      `}</style>

      {/* Header */}
      <div className="border-b border-neutral-100 bg-white no-print">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/audit" className="text-sm text-neutral-500 hover:text-neutral-900 mb-3 inline-block">
                ← Back to Audit Trail
              </Link>
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Compliance Audit Record</h1>
              <p className="text-sm text-neutral-500 mt-1">{hdr.document_name}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2 px-4 py-2 bg-white text-neutral-700 ring-1 ring-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                {isGeneratingPDF && !certificateOnlyMode ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-neutral-300 border-t-neutral-900" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download size={16} strokeWidth={1.5} />
                    Full Audit Trail
                  </>
                )}
              </button>
              <button
                onClick={handleExportCertifiedPDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                {isGeneratingPDF && certificateOnlyMode ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileCheck size={16} strokeWidth={1.5} />
                    Certified PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 print-full-width">
        {/* Certification Watermark (visible only in certificate-only print mode) */}
        <div className="certification-watermark hidden bg-violet-50 border-2 border-violet-300 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-3">
            <FileCheck className="w-6 h-6 text-violet-700" strokeWidth={2} />
            <div className="flex-1">
              <p className="text-xs font-bold text-violet-900 uppercase tracking-wider">TrustDoc Certified Document</p>
              <p className="text-[10px] text-violet-700 font-mono">
                ID: {hdr?.ledger_id} | Verification: {typeof window !== 'undefined' ? window.location.origin : 'trustdoc.dev'}/verify
              </p>
            </div>
          </div>
        </div>

        {/* Compliance Header - WORM Ledger Seal */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] print-certificate-only">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-600" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-emerald-900 mb-1">Immutably Archived in WORM Ledger</h2>
              <p className="text-sm text-emerald-700">
                This Human Decision Record has been cryptographically sealed and permanently archived in the Enterprise Write-Once-Read-Many registry for regulatory compliance.
              </p>
            </div>
          </div>

          {/* Ledger ID */}
          {hdr.ledger_id && (
            <div className="bg-white border border-emerald-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Enterprise Ledger ID</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-sm text-neutral-900 bg-neutral-50 px-3 py-2 rounded border border-neutral-200">
                  {hdr.ledger_id}
                </code>
                <button
                  onClick={() => copyToClipboard(hdr.ledger_id!)}
                  className="px-3 py-2 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 transition-colors"
                >
                  {copied ? '✓' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 block mb-1">Sealed At</span>
              <p className="text-neutral-900 font-medium" suppressHydrationWarning>
                {new Date(hdr.sealed_at || hdr.created_at).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'long'
                })}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 block mb-1">Reviewed By</span>
              <p className="text-neutral-900 font-medium">{reviewer?.name || 'Unknown'}</p>
              <p className="text-xs text-neutral-500">{reviewer?.role}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 block mb-1">Record Hash</span>
              <code className="text-xs text-neutral-700 font-mono block truncate">
                {hdr.record_hash.slice(0, 16)}...
              </code>
            </div>
          </div>
        </div>

        {/* Narrative Timeline */}
        <div className="bg-white rounded-xl ring-1 ring-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8 print-certificate-only">
          <div className="flex items-center gap-3 mb-8">
            <FileText className="w-5 h-5 text-neutral-500" strokeWidth={1.5} />
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Decision Timeline</h2>
          </div>

          {/* Timeline Container */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-neutral-200" />

            {/* Event 1: AI Risk Detection */}
            <div className="relative pb-12">
              <div className="flex items-start gap-6">
                {/* Icon */}
                <div className="relative z-10 w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 ring-4 ring-white">
                  <Brain className="w-6 h-6 text-violet-600" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-neutral-900">Event 1: AI Risk Detection</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-400" suppressHydrationWarning>
                        {new Date(hdr.created_at).toLocaleTimeString()}
                      </span>
                      <button
                        onClick={() => setExpandedEvent1(!expandedEvent1)}
                        className="no-print flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                      >
                        {expandedEvent1 ? (
                          <>
                            <ChevronUp size={14} />
                            Collapse
                          </>
                        ) : (
                          <>
                            <ChevronDown size={14} />
                            View Full Analysis
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 space-y-3">
                    {/* AI Tool */}
                    <div>
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">AI System</span>
                      <p className="text-sm text-neutral-900">{hdr.ai_tool}</p>
                    </div>

                    {/* Active Frameworks */}
                    <div>
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2">Active Compliance Frameworks</span>
                      {hdr.governance_context?.frameworks && hdr.governance_context.frameworks.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {hdr.governance_context.frameworks.map((framework: string) => (
                            <span
                              key={framework}
                              className="inline-flex text-[10px] uppercase tracking-wider text-violet-700 bg-violet-50 px-2 py-1 rounded-md ring-1 ring-violet-200"
                            >
                              {framework}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-neutral-600 bg-neutral-50 px-3 py-2 rounded-md border border-neutral-200">
                          Standard Enterprise Governance (Internal Policy Only)
                        </div>
                      )}
                    </div>

                    {/* Internal Policy */}
                    {hdr.governance_context?.internal_policy && (
                      <div>
                        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">Internal Policy</span>
                        <p className="text-sm text-neutral-700">
                          {hdr.governance_context.internal_policy.fileName} ({hdr.governance_context.internal_policy.rulesCount} rules active)
                        </p>
                      </div>
                    )}

                    {/* Risk Summary */}
                    <div>
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">Initial Assessment</span>
                      <div
                        className={`expandable-content text-sm text-neutral-700 leading-relaxed overflow-hidden transition-all duration-300 ${
                          expandedEvent1 ? 'max-h-none' : 'max-h-20'
                        }`}
                        style={{ whiteSpace: 'pre-wrap' }}
                      >
                        {expandedEvent1 ? hdr.ai_output : `${hdr.ai_output.substring(0, 200)}...`}
                      </div>
                      {!expandedEvent1 && (
                        <button
                          onClick={() => setExpandedEvent1(true)}
                          className="no-print text-xs text-violet-600 hover:text-violet-700 mt-2 font-medium"
                        >
                          Read more →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Event 2: Human-AI Deliberation (Chat Transcript) */}
            {hdr.chat_transcript && hdr.chat_transcript.length > 0 && (
              <div className="relative pb-12">
                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className="relative z-10 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 ring-4 ring-white">
                    <MessageSquare className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-bold text-neutral-900">Event 2: Human-AI Deliberation</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-neutral-400">
                          {hdr.chat_transcript.length} interaction{hdr.chat_transcript.length === 1 ? '' : 's'}
                        </span>
                        <button
                          onClick={() => setExpandedEvent2(!expandedEvent2)}
                          className="no-print flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                        >
                          {expandedEvent2 ? (
                            <>
                              <ChevronUp size={14} />
                              Collapse
                            </>
                          ) : (
                            <>
                              <ChevronDown size={14} />
                              View Full Transcript
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-5 space-y-4">
                      <p className="text-xs text-neutral-500 italic mb-4">
                        Official transcript of compliance review dialogue between human reviewer and AI co-pilot system.
                      </p>

                      {/* Transcript Entries */}
                      <div className={`expandable-content space-y-4 overflow-hidden transition-all duration-300 ${
                        expandedEvent2 ? 'max-h-none' : 'max-h-96'
                      }`}>
                        {(expandedEvent2 ? hdr.chat_transcript : hdr.chat_transcript.slice(0, 4)).map((message: { id: string; role: string; content: string; timestamp: string }, idx: number) => (
                          <div key={`${message.id || message.timestamp}-${idx}`} className={message.role === 'user' ? 'pl-0' : 'pl-6'}>
                            {message.role === 'user' ? (
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Q{Math.floor(idx / 2) + 1}:</span>
                                  <span className="text-xs text-neutral-600">[{reviewer?.name}]</span>
                                  <span className="text-[10px] text-neutral-400" suppressHydrationWarning>
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-sm text-neutral-900 leading-relaxed bg-white border border-neutral-200 rounded px-3 py-2">
                                  {message.content || (message as any).parts || 'No content'}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">A{Math.floor(idx / 2) + 1}:</span>
                                  <span className="text-xs text-neutral-600">[AI Co-Pilot]</span>
                                  <span className="text-[10px] text-neutral-400" suppressHydrationWarning>
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                <div className="text-sm text-neutral-700" style={{ lineHeight: '1.6' }}>
                                  {(() => {
                                    // ✅ FIX: Defensive rendering with fallback + Pristine formatting
                                    const content = message.content || (message as any).parts || '';
                                    if (typeof content !== 'string') {
                                      console.warn('⚠️ Invalid message content type:', typeof content, message);
                                      return <span className="text-rose-600">Invalid message format</span>;
                                    }

                                    // Split by ### headers
                                    const lines = content.split('\n');
                                    return lines.map((line, lineIdx) => {
                                      // ### Headers - Pristine style
                                      if (line.match(/^###\s+(.+)/)) {
                                        const headerText = line.replace(/^###\s+/, '');
                                        return (
                                          <h4 key={lineIdx} className="text-sm font-bold uppercase tracking-wider text-neutral-500 mt-6 mb-2 first:mt-0">
                                            {headerText}
                                          </h4>
                                        );
                                      }

                                      // Inline bold rendering for **text**
                                      if (line.trim()) {
                                        const parts = line.split(/(\*\*[^*]+\*\*)/g);
                                        return (
                                          <p key={lineIdx} className="mb-2">
                                            {parts.map((part, partIdx) => {
                                              if (part.startsWith('**') && part.endsWith('**')) {
                                                return <strong key={partIdx} className="font-semibold text-neutral-900">{part.slice(2, -2)}</strong>;
                                              }
                                              return part;
                                            })}
                                          </p>
                                        );
                                      }

                                      return null;
                                    });
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {!expandedEvent2 && hdr.chat_transcript.length > 4 && (
                        <button
                          onClick={() => setExpandedEvent2(true)}
                          className="no-print text-xs text-blue-600 hover:text-blue-700 font-medium w-full text-center py-2 border-t border-neutral-200"
                        >
                          View {hdr.chat_transcript.length - 4} more interaction{hdr.chat_transcript.length - 4 === 1 ? '' : 's'} →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Event 3: Final Decision */}
            <div className="relative">
              <div className="flex items-start gap-6">
                {/* Icon */}
                <div className="relative z-10 w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 ring-4 ring-white">
                  <CheckCircle className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-neutral-900">Event 3: Final Decision</h3>
                    <span className="text-xs text-neutral-400" suppressHydrationWarning>
                      {new Date(hdr.sealed_at || hdr.created_at).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className={`${colors.bg} border ${colors.border} rounded-lg p-5`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Decision Type</span>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-1 rounded-md ring-1 ${colors.bg} ${colors.text} ${colors.ring}`}>
                        {hdr.decision}
                      </span>
                    </div>

                    {/* Decision Note */}
                    {hdr.decision_note && (
                      <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2">Justification</span>
                        <p className="text-sm text-neutral-900 leading-relaxed">
                          {hdr.decision_note}
                        </p>
                      </div>
                    )}

                    {/* Escalation Details */}
                    {hdr.decision === 'ESCALATE' && hdr.escalated_to && (
                      <div className="bg-white border border-rose-200 rounded-lg p-4 mt-3">
                        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2">Escalation Transfer</span>
                        <p className="text-sm text-neutral-700">
                          Escalated to <span className="font-semibold text-neutral-900">{getUserById(hdr.escalated_to)?.name}</span>
                        </p>
                        {hdr.escalation_reason && (
                          <p className="text-sm text-neutral-600 mt-2 italic">"{hdr.escalation_reason}"</p>
                        )}
                      </div>
                    )}

                    {/* Accountability */}
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                      <p className="text-xs text-neutral-600">
                        <strong className="text-neutral-900">Legally Binding Decision:</strong> This decision was made by {reviewer?.name} ({reviewer?.role}) and is cryptographically sealed in the Enterprise WORM Ledger. This record cannot be altered or deleted and serves as tamper-proof evidence for regulatory audits.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Event 4: Routed for Execution (E-Sign) */}
            {hdr.esign_status && hdr.esign_envelope_id && (
              <div className="relative pb-0">
                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className="relative z-10 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 ring-4 ring-white">
                    <PenTool className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-bold text-neutral-900">Event 4: Routed for Execution</h3>
                      <span className="text-xs text-neutral-400" suppressHydrationWarning>
                        {hdr.esign_sent_at && new Date(hdr.esign_sent_at).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                      <div className="flex items-center gap-3 mb-4">
                        {hdr.esign_provider === 'DOCUSIGN' ? (
                          <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-xs">DS</span>
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-xs">AS</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-blue-900 mb-1">
                            Envelope successfully dispatched via {hdr.esign_provider === 'DOCUSIGN' ? 'DocuSign' : 'Adobe Sign'} API
                          </p>
                          <p className="text-xs text-blue-700">
                            Waiting for counterparty signature
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-1 rounded-md ring-1 font-semibold ${
                          hdr.esign_status === 'SIGNED'
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                            : hdr.esign_status === 'SENT'
                            ? 'bg-blue-50 text-blue-700 ring-blue-600/20'
                            : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                        }`}>
                          {hdr.esign_status}
                        </span>
                      </div>

                      <div className="bg-white border border-blue-200 rounded-lg p-4 space-y-3">
                        <div>
                          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">Envelope ID</span>
                          <code className="text-sm font-mono text-blue-900">{hdr.esign_envelope_id}</code>
                        </div>

                        <div>
                          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">Attached Ledger Hash</span>
                          <code className="text-xs font-mono text-neutral-600 block break-all">
                            {hdr.ledger_id}
                          </code>
                          <p className="text-[10px] text-neutral-500 mt-1">
                            The WORM Ledger ID is embedded in the envelope's custom fields for full traceability
                          </p>
                        </div>

                        {hdr.esign_signed_at && (
                          <div>
                            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">Signed At</span>
                            <p className="text-sm text-neutral-700" suppressHydrationWarning>
                              {new Date(hdr.esign_signed_at).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <p className="text-xs text-blue-800">
                          <strong>End-to-End Compliance:</strong> This document has completed the full compliance lifecycle:
                          AI Risk Detection → Human Review → Cryptographic Sealing → E-Signature Routing.
                          The entire audit trail is preserved and verifiable.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compliance Footer */}
        <div className="mt-8 bg-white rounded-xl ring-1 ring-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 print-certificate-only">
          <h3 className="text-sm font-bold text-neutral-900 mb-3">Regulatory Compliance</h3>
          <div className="space-y-2 text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>EU AI Act Article 12 - Tamper-proof logging of high-risk AI decisions</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>EU AI Act Article 14 - Human oversight and review records</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Colorado SB 205 - Risk management documentation requirements</span>
            </div>
          </div>
        </div>

        {/* Cryptographic Certificate of Authenticity */}
        <div className="mt-8 bg-gradient-to-br from-violet-50 to-blue-50 border-2 border-violet-200 rounded-xl p-8 print-show">
          <div className="flex items-start gap-8">
            {/* QR Code */}
            <div className="flex-shrink-0">
              <div className="bg-white p-4 rounded-lg border-2 border-violet-300 shadow-sm">
                {verificationUrl ? (
                  <QRCode
                    value={verificationUrl}
                    size={140}
                    level="H"
                    style={{ height: "auto", maxWidth: "100%", width: "140px" }}
                  />
                ) : (
                  <div className="w-[140px] h-[140px] bg-neutral-100 animate-pulse" />
                )}
              </div>
              <p className="text-[10px] text-center text-violet-600 mt-2 font-medium">Scan to Verify</p>
            </div>

            {/* Certificate Details */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-7 h-7 text-violet-600" strokeWidth={2} />
                <h3 className="text-lg font-bold text-violet-900">Cryptographic Certificate of Authenticity</h3>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-violet-700 uppercase tracking-wider block mb-1">Enterprise Ledger ID</span>
                    <code className="text-sm font-mono text-violet-900 bg-white px-3 py-1.5 rounded border border-violet-200 block">
                      {hdr?.ledger_id}
                    </code>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-violet-700 uppercase tracking-wider block mb-1">Sealed (UTC)</span>
                    <p className="text-sm font-mono text-violet-900 bg-white px-3 py-1.5 rounded border border-violet-200" suppressHydrationWarning>
                      {hdr?.sealed_at && new Date(hdr.sealed_at).toUTCString()}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-violet-700 uppercase tracking-wider block mb-1">Digital Signature</span>
                  <div className="bg-white px-3 py-2 rounded border border-violet-200">
                    <p className="text-sm text-violet-900">
                      <span className="font-semibold">{reviewer?.name}</span> ({reviewer?.role})
                    </p>
                    <p className="text-xs text-violet-600 mt-0.5">{reviewer?.email}</p>
                  </div>
                </div>

                <div className="bg-white/80 rounded-lg p-3 border border-violet-200">
                  <p className="text-xs text-violet-800 leading-relaxed">
                    <strong>Verification:</strong> This record is cryptographically sealed and immutably stored in the Enterprise WORM Ledger.
                    {verificationUrl ? (
                      <>
                        {' '}Scan the QR code or visit <span className="font-mono text-violet-900">{verificationUrl}</span> to verify authenticity.
                      </>
                    ) : (
                      <> Scan the QR code to verify authenticity.</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
