'use client';

import { useState } from 'react';
import { getCurrentUser, getAvailableManagers, type User } from '@/lib/store';
import { DecisionModal } from './DecisionModal';
import { getGeminiChatHistory } from './GeminiPanel';

type Decision = 'APPROVE' | 'OVERRIDE' | 'ESCALATE';

export interface EscalationData {
  escalated_to: string;
  escalation_reason: string;
  manager_name: string;
}

interface DecisionButtonsProps {
  disabled: boolean;
  documentId: string;
  documentName: string;
  onDecide: (decision: Decision, note?: string, escalationData?: EscalationData) => void;
  loading?: boolean;
  hideEscalate?: boolean;
}

export function DecisionButtons({ disabled, documentId, documentName, onDecide, loading, hideEscalate }: DecisionButtonsProps) {
  const [selected, setSelected] = useState<Decision | null>(null);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');

  // Escalation state
  const [selectedManager, setSelectedManager] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [escalationError, setEscalationError] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<{
    decision: Decision;
    note?: string;
    escalationData?: EscalationData;
  } | null>(null);

  const currentUser = getCurrentUser();
  const availableManagers = getAvailableManagers(currentUser.id);
  const chatHistory = getGeminiChatHistory(documentId);
  const chatMessageCount = chatHistory.length;

  function handleDecide(decision: Decision) {
    if (decision === 'OVERRIDE' && !note.trim()) {
      setNoteError('A note is required when overriding an AI recommendation.');
      return;
    }

    if (decision === 'ESCALATE') {
      if (!selectedManager) {
        setEscalationError('Please select a manager to escalate to.');
        return;
      }
      if (!escalationReason.trim()) {
        setEscalationError('Please provide a reason for escalation.');
        return;
      }
      setEscalationError('');

      const manager = availableManagers.find(m => m.id === selectedManager);
      const escalationData: EscalationData = {
        escalated_to: selectedManager,
        escalation_reason: escalationReason.trim(),
        manager_name: manager?.name || 'Unknown'
      };

      // Show confirmation modal
      setPendingDecision({ decision, note: escalationReason.trim(), escalationData });
      setShowModal(true);
      return;
    }

    setNoteError('');

    // Show confirmation modal
    setPendingDecision({ decision, note: note.trim() || undefined });
    setShowModal(true);
  }

  function handleModalConfirm() {
    if (!pendingDecision) return;

    setShowModal(false);
    onDecide(pendingDecision.decision, pendingDecision.note, pendingDecision.escalationData);

    // Reset state
    setSelected(null);
    setNote('');
    setSelectedManager('');
    setEscalationReason('');
    setPendingDecision(null);
  }

  function handleModalClose() {
    setShowModal(false);
    setPendingDecision(null);
  }

  return (
    <div className="space-y-4">
      {disabled && (
        <p className="text-sm text-neutral-500 italic">
          Verify your identity above to enable decision buttons.
        </p>
      )}

      <div className={`flex gap-3 ${hideEscalate ? 'grid grid-cols-2' : ''}`}>
        <button
          onClick={() => handleDecide('APPROVE')}
          disabled={disabled || loading}
          className="flex-1 bg-neutral-900 text-white rounded-xl py-3 font-bold hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ✓ Approve
        </button>
        <button
          onClick={() => { setSelected('OVERRIDE'); }}
          disabled={disabled || loading}
          className="flex-1 bg-white text-amber-700 ring-1 ring-amber-200 rounded-xl py-3 font-bold hover:bg-amber-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ↩ Override
        </button>
        {!hideEscalate && (
          <button
            onClick={() => { setSelected('ESCALATE'); setEscalationError(''); }}
            disabled={disabled || loading}
            className="flex-1 bg-white text-rose-600 ring-1 ring-rose-200 rounded-xl py-3 font-bold hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ↑ Escalate
          </button>
        )}
      </div>

      {selected === 'OVERRIDE' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
          <label className="block text-sm font-medium text-amber-700 mb-2">
            Override reason <span className="text-rose-600">*</span>
          </label>
          <textarea
            value={note}
            onChange={e => { setNote(e.target.value); setNoteError(''); }}
            placeholder="Explain why you are overriding the AI recommendation…"
            rows={3}
            style={{ color: '#000000 !important', backgroundColor: '#ffffff !important', caretColor: '#000000 !important' }}
            className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          />
          {noteError && <p className="text-xs text-rose-600">{noteError}</p>}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleDecide('OVERRIDE')}
              disabled={loading}
              className="bg-amber-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-amber-700 disabled:opacity-50 transition-all"
            >
              Confirm Override
            </button>
            <button
              onClick={() => setSelected(null)}
              className="text-sm text-neutral-500 hover:text-neutral-900 px-3 py-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {selected === 'ESCALATE' && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-sm font-semibold text-rose-700">Transfer Accountability</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-rose-700 mb-2">
              Escalate to <span className="text-rose-600">*</span>
            </label>
            <select
              value={selectedManager}
              onChange={e => { setSelectedManager(e.target.value); setEscalationError(''); }}
              style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}
              className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
            >
              <option value="">Select a manager...</option>
              {availableManagers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} - {manager.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-rose-700 mb-2">
              Escalation reason <span className="text-rose-600">*</span>
            </label>
            <textarea
              value={escalationReason}
              onChange={e => { setEscalationReason(e.target.value); setEscalationError(''); }}
              placeholder="Explain why this requires senior review (e.g., high-risk liability clause, unusual terms, potential compliance issue)…"
              rows={3}
              style={{ color: '#000000 !important', backgroundColor: '#ffffff !important', caretColor: '#000000 !important' }}
              className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
            />
          </div>

          {escalationError && <p className="text-xs text-rose-600">{escalationError}</p>}

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleDecide('ESCALATE')}
              disabled={loading}
              className="bg-rose-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-rose-700 disabled:opacity-50 transition-all"
            >
              Confirm Escalation
            </button>
            <button
              onClick={() => { setSelected(null); setSelectedManager(''); setEscalationReason(''); }}
              className="text-sm text-neutral-500 hover:text-neutral-900 px-3 py-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Decision Confirmation Modal */}
      {pendingDecision && (
        <DecisionModal
          isOpen={showModal}
          onClose={handleModalClose}
          onConfirm={handleModalConfirm}
          decision={pendingDecision.decision}
          documentName={documentName}
          chatMessageCount={chatMessageCount}
          note={pendingDecision.note}
          escalationData={pendingDecision.escalationData}
        />
      )}
    </div>
  );
}
