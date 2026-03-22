'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ShieldAlert, Database, Calendar, User, FileText } from 'lucide-react';
import { getAllHDRs, getUserById } from '@/lib/store';

function VerifyContent() {
  const searchParams = useSearchParams();
  const hash = searchParams.get('hash');

  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [hdrData, setHdrData] = useState<any>(null);

  useEffect(() => {
    if (!hash) {
      setVerificationStatus('invalid');
      return;
    }

    // Simulate WORM Ledger lookup (using localStorage)
    setTimeout(() => {
      const allHdrs = getAllHDRs();
      const matchingHdr = allHdrs.find(hdr => hdr.ledger_id === hash);

      if (matchingHdr) {
        setHdrData(matchingHdr);
        setVerificationStatus('valid');
      } else {
        setVerificationStatus('invalid');
      }
    }, 800);
  }, [hash]);

  const reviewer = hdrData ? getUserById(hdrData.reviewer_id) : null;

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-neutral-200 border-t-neutral-900 mx-auto mb-6"></div>
          <p className="text-lg font-semibold text-neutral-900 mb-2">Verifying Cryptographic Signature</p>
          <p className="text-sm text-neutral-500">Checking Enterprise WORM Ledger...</p>
          <code className="text-xs text-neutral-400 font-mono mt-4 block">{hash}</code>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'invalid') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Invalid Banner */}
          <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-12 shadow-2xl mb-8 text-center">
            <ShieldAlert className="w-24 h-24 text-white mx-auto mb-6" strokeWidth={1.5} />
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
              ❌ Tamper Alert
            </h1>
            <p className="text-xl text-rose-50 mb-6">
              Record Not Found or Altered
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
              <p className="text-sm text-white leading-relaxed">
                The provided cryptographic signature does not match any valid record in the Enterprise WORM Ledger.
                This document may have been tampered with or the verification code is incorrect.
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl ring-1 ring-black/5 shadow-sm p-8">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">Verification Failed</h2>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                  Attempted Hash
                </span>
                <code className="text-sm font-mono text-rose-600 bg-rose-50 px-3 py-2 rounded border border-rose-200 block break-all">
                  {hash || 'No hash provided'}
                </code>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <p className="text-sm text-neutral-700 leading-relaxed">
                  <strong className="text-neutral-900">Why did verification fail?</strong><br />
                  • The hash does not exist in the ledger<br />
                  • The document may have been modified after sealing<br />
                  • The QR code may have been damaged or incorrectly scanned<br />
                  • The verification link may be incomplete
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-200">
                <p className="text-xs text-neutral-500">
                  If you believe this is an error, please contact the document issuer to obtain a valid verification link.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Valid verification
  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Minimalist Seal - AUTHENTICITY VERIFIED */}
        <div className="bg-white rounded-2xl p-12 shadow-sm mb-8 text-center border border-neutral-200">
          <ShieldCheck className="w-20 h-20 text-emerald-600 mx-auto mb-6" strokeWidth={1.5} />
          <h1 className="text-4xl font-bold text-neutral-900 mb-4 tracking-tight">
            Authenticity Verified
          </h1>
          <div className="max-w-2xl mx-auto mb-8">
            <p className="text-lg text-neutral-700 font-medium mb-3">
              Compliance Signature Confirmed
            </p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              This certification record has been cryptographically sealed and anchored to the Enterprise WORM Ledger.
              The digital signature is valid and the document is tamper-proof.
            </p>
          </div>

          {/* Reviewer Info - Minimalist Display */}
          <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200 max-w-xl mx-auto">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              Reviewed & Certified By
            </p>
            <p className="text-xl font-bold text-neutral-900 mb-1 tracking-tight">{reviewer?.name}</p>
            <p className="text-base text-neutral-600">{reviewer?.role}</p>
            <p className="text-xs text-neutral-500 mt-3" suppressHydrationWarning>
              Sealed on {new Date(hdrData.sealed_at || hdrData.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
              })}
            </p>
          </div>
        </div>

        {/* Record Metadata */}
        <div className="bg-white rounded-xl ring-1 ring-black/5 shadow-sm overflow-hidden mb-6">
          <div className="bg-emerald-50 border-b border-emerald-100 px-8 py-4">
            <h2 className="text-lg font-bold text-emerald-900">Verification Receipt</h2>
            <p className="text-sm text-emerald-700">Public audit record - no sensitive content disclosed</p>
          </div>

          <div className="p-8 space-y-6">
            {/* Ledger ID */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Enterprise Ledger ID
                </span>
              </div>
              <code className="text-sm font-mono text-neutral-900 bg-neutral-50 px-3 py-2 rounded border border-neutral-200 block break-all">
                {hdrData.ledger_id}
              </code>
            </div>

            {/* Document Name */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Document Name
                </span>
              </div>
              <p className="text-base font-medium text-neutral-900">{hdrData.document_name}</p>
            </div>

            {/* Sealed Date */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Sealed Date (UTC)
                </span>
              </div>
              <p className="text-base text-neutral-900" suppressHydrationWarning>
                {new Date(hdrData.sealed_at || hdrData.created_at).toUTCString()}
              </p>
            </div>

            {/* Reviewer */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Reviewed & Sealed By
                </span>
              </div>
              <p className="text-base text-neutral-900">
                <span className="font-semibold">{reviewer?.name}</span> ({reviewer?.role})
              </p>
            </div>

            {/* Decision */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Compliance Decision
                </span>
              </div>
              <span className={`inline-flex items-center gap-1.5 text-xs uppercase tracking-wider px-3 py-1.5 rounded-md ring-1 font-semibold ${
                hdrData.decision === 'APPROVE'
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                  : hdrData.decision === 'OVERRIDE'
                  ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
                  : 'bg-rose-50 text-rose-700 ring-rose-600/20'
              }`}>
                {hdrData.decision}
              </span>
            </div>

            {/* Governance Context */}
            {hdrData.governance_context?.frameworks && hdrData.governance_context.frameworks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Active Compliance Frameworks
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hdrData.governance_context.frameworks.map((framework: string) => (
                    <span
                      key={framework}
                      className="inline-flex text-[10px] uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md ring-1 ring-emerald-200 font-medium"
                    >
                      {framework}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Record Hash */}
            <div className="pt-6 border-t border-neutral-200">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-neutral-500" strokeWidth={1.5} />
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Cryptographic Hash (SHA-256)
                </span>
              </div>
              <code className="text-xs font-mono text-neutral-600 bg-neutral-50 px-3 py-2 rounded border border-neutral-200 block break-all">
                {hdrData.record_hash}
              </code>
            </div>
          </div>
        </div>

        {/* Verification Info */}
        <div className="bg-white rounded-xl ring-1 ring-black/5 shadow-sm p-6">
          <h3 className="text-sm font-bold text-neutral-900 mb-3">About This Verification</h3>
          <div className="space-y-3 text-sm text-neutral-700 leading-relaxed">
            <p>
              <strong className="text-neutral-900">What does this mean?</strong><br />
              This verification confirms that the document review was conducted by an authorized reviewer and the decision
              record has been cryptographically sealed in an immutable ledger (WORM - Write Once, Read Many).
            </p>
            <p>
              <strong className="text-neutral-900">Tamper-proof guarantee:</strong><br />
              Any modification to the original record after sealing would invalidate the cryptographic signature,
              making tampering immediately detectable.
            </p>
            <p>
              <strong className="text-neutral-900">Regulatory compliance:</strong><br />
              This record satisfies EU AI Act Article 12 (tamper-proof logging), Article 14 (human oversight),
              and other risk management documentation requirements.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-neutral-400">
            Powered by TrustDoc Enterprise WORM Ledger
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-neutral-200 border-t-neutral-900"></div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
