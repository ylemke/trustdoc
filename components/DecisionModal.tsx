'use client';

import { useEffect, useState } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  decision: 'APPROVE' | 'OVERRIDE' | 'ESCALATE';
  documentName: string;
  chatMessageCount: number;
  note?: string;
  escalationData?: {
    escalated_to: string;
    escalation_reason: string;
    manager_name: string;
  };
}

export function DecisionModal({
  isOpen,
  onClose,
  onConfirm,
  decision,
  documentName,
  chatMessageCount,
  note,
  escalationData
}: DecisionModalProps) {
  const [sealing, setSealing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setSealing(true);
    // Give visual feedback before executing
    await new Promise(resolve => setTimeout(resolve, 500));
    onConfirm();
  };

  const decisionLabels = {
    APPROVE: { label: 'Approve', color: 'emerald', icon: '✓' },
    OVERRIDE: { label: 'Override AI Recommendation', color: 'amber', icon: '⚠' },
    ESCALATE: { label: 'Escalate to Manager', color: 'rose', icon: '↑' }
  };

  const { label, color, icon } = decisionLabels[decision];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={sealing ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className={`p-6 border-b border-neutral-100 bg-${color}-50`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
              <span className="text-2xl">{icon}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-neutral-900 mb-1">Seal & Archive Decision</h2>
              <p className="text-sm text-neutral-600">
                {decision === 'ESCALATE' ? `Escalating` : `Recording`} decision for <strong>{documentName}</strong>
              </p>
              {chatMessageCount > 0 && (
                <p className="text-xs text-neutral-500 mt-1">
                  Session summary: {label.toLowerCase()} after {chatMessageCount} AI Co-Pilot interaction{chatMessageCount === 1 ? '' : 's'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Decision Summary */}
          <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-neutral-900">Decision Summary</span>
              <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-1 rounded-md ring-1 bg-${color}-50 text-${color}-700 ring-${color}-600/20`}>
                {label}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Chat interactions:</span>
                <span className="font-semibold text-neutral-900">{chatMessageCount} messages</span>
              </div>

              {note && (
                <div className="pt-2 border-t border-neutral-200">
                  <span className="text-neutral-500 block mb-1">Note:</span>
                  <p className="text-neutral-900 text-xs bg-white p-2 rounded border border-neutral-200">{note}</p>
                </div>
              )}

              {escalationData && (
                <div className="pt-2 border-t border-neutral-200">
                  <span className="text-neutral-500 block mb-1">Escalating to:</span>
                  <p className="text-neutral-900 font-semibold">{escalationData.manager_name}</p>
                  <p className="text-neutral-600 text-xs mt-1">{escalationData.escalation_reason}</p>
                </div>
              )}
            </div>
          </div>

          {/* WORM Ledger Warning */}
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold text-violet-900 mb-1">Enterprise Immutable Registry</p>
                <p className="text-xs text-violet-700 leading-relaxed">
                  This record will be cryptographically sealed (SHA-256) and anchored to the Enterprise WORM Ledger (Write Once, Read Many).
                  The complete chat transcript and governance context will be archived in the immutable corporate registry for legal audit purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Irreversibility Warning */}
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-1">Irreversible Action</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Once sealed, this decision cannot be modified or deleted. It will be permanently recorded
                  for audit and compliance purposes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-neutral-50 border-t border-neutral-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={sealing}
            className="flex-1 px-4 py-2.5 bg-white text-neutral-700 ring-1 ring-neutral-200 rounded-lg font-medium hover:bg-neutral-100 disabled:opacity-40 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={sealing}
            className={`flex-1 px-4 py-2.5 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 disabled:opacity-40 transition-colors flex items-center justify-center gap-2`}
          >
            {sealing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Archiving...
              </>
            ) : (
              <>
                <Shield size={16} strokeWidth={1.5} />
                Seal & Archive Decision
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
