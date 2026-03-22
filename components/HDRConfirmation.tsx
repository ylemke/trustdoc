'use client';

interface HDRConfirmationProps {
  hdrId: string;
  recordHash: string;
  verifyUrl: string;
  decision: string;
}

export function HDRConfirmation({ hdrId, recordHash, verifyUrl, decision }: HDRConfirmationProps) {
  const decisionColors = {
    APPROVE: 'text-green-700 bg-green-50 border-green-200',
    OVERRIDE: 'text-amber-700 bg-amber-50 border-amber-200',
    ESCALATE: 'text-red-700 bg-red-50 border-red-200',
  }[decision] ?? 'text-gray-700 bg-gray-50 border-gray-200';

  return (
    <div className="bg-white border-2 border-green-300 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">✓</span>
        <div>
          <h3 className="font-bold text-gray-900">HDR Created Successfully</h3>
          <p className="text-sm text-gray-500">This decision is now permanently recorded.</p>
        </div>
      </div>

      <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${decisionColors}`}>
        {decision}
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">HDR ID</p>
        <p className="font-mono text-sm text-gray-800 break-all">{hdrId}</p>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          Record Hash (SHA-256)
        </p>
        <p className="font-mono text-xs text-gray-700 break-all bg-gray-50 border border-gray-200 rounded p-2">
          {recordHash}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          This 64-character hash uniquely identifies your decision. Store it for independent verification.
        </p>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Verify URL</p>
        <a
          href={verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline font-mono break-all"
        >
          {verifyUrl}
        </a>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <p className="text-xs text-blue-700">
          This record is sealed with SHA-256 cryptography and stored in immutable S3 Object Lock
          (COMPLIANCE mode, 10-year retention). It cannot be deleted or modified.
        </p>
      </div>
    </div>
  );
}
