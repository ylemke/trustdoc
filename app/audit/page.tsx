'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllHDRs, subscribeToHDRs, getUserById, type HDRRecord } from '@/lib/store';
import { getDocumentById } from '@/lib/mock-documents';

export default function AuditTrailPage() {
  const [hdrs, setHdrs] = useState<HDRRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'APPROVE' | 'OVERRIDE' | 'ESCALATE'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setHdrs(getAllHDRs());
    const unsubscribe = subscribeToHDRs(setHdrs);
    return unsubscribe;
  }, []);

  // Filter HDRs
  const filteredHdrs = hdrs
    .filter(hdr => {
      if (filter === 'all') return true;
      return hdr.decision === filter;
    })
    .filter(hdr => {
      if (searchQuery === '') return true;
      const query = searchQuery.toLowerCase();
      return hdr.document_name.toLowerCase().includes(query) ||
             hdr.hdr_id.toLowerCase().includes(query);
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  console.log('Audit Trail Debug:', {
    totalHdrs: hdrs.length,
    filteredHdrs: filteredHdrs.length,
    currentFilter: filter,
    searchQuery,
    decisions: hdrs.map(h => h.decision)
  });

  // Export to CSV
  function exportToCSV() {
    const headers = ['HDR ID', 'Document', 'Decision', 'Created At', 'Record Hash', 'Reviewer'];
    const rows = filteredHdrs.map(hdr => [
      hdr.hdr_id,
      hdr.document_name,
      hdr.decision,
      new Date(hdr.created_at).toISOString(),
      hdr.record_hash,
      hdr.reviewer_email,
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trustdoc-audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const stats = {
    total: hdrs.length,
    approved: hdrs.filter(h => h.decision === 'APPROVE').length,
    overridden: hdrs.filter(h => h.decision === 'OVERRIDE').length,
    escalated: hdrs.filter(h => h.decision === 'ESCALATE').length,
  };

  return (
    <div className="pt-14">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900 mb-3 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Audit Trail</h1>
              <p className="text-neutral-500">
                Complete tamper-proof record of all AI-assisted decisions
              </p>
            </div>
            <button
              onClick={exportToCSV}
              disabled={hdrs.length === 0}
              className="px-4 py-2 rounded-lg bg-white text-neutral-700 ring-1 ring-neutral-200 text-sm font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 ring-1 ring-black/5 shadow-sm">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">Total Records</div>
            <div className="text-4xl font-bold text-neutral-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl p-6 ring-1 ring-black/5 shadow-sm">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">Approved</div>
            <div className="text-4xl font-bold text-emerald-600">{stats.approved}</div>
          </div>
          <div className="bg-white rounded-xl p-6 ring-1 ring-black/5 shadow-sm">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">Overridden</div>
            <div className="text-4xl font-bold text-amber-600">{stats.overridden}</div>
          </div>
          <div className="bg-white rounded-xl p-6 ring-1 ring-black/5 shadow-sm">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">Escalated</div>
            <div className="text-4xl font-bold text-rose-600">{stats.escalated}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by document name or HDR ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white ring-1 ring-neutral-200 rounded-lg px-4 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-neutral-900 focus:outline-none transition-all"
            />
          </div>

          {/* Decision Filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-500 hover:bg-neutral-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('APPROVE')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'APPROVE'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-500 hover:bg-neutral-100'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('OVERRIDE')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'OVERRIDE'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-500 hover:bg-neutral-100'
              }`}
            >
              Overridden
            </button>
            <button
              onClick={() => setFilter('ESCALATE')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'ESCALATE'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-500 hover:bg-neutral-100'
              }`}
            >
              Escalated
            </button>
          </div>
        </div>

        {/* Timeline */}
        {filteredHdrs.length > 0 ? (
          <div className="space-y-4">
            {filteredHdrs.map((hdr, index) => {
              const doc = getDocumentById(hdr.document_id);
              return (
                <AuditRecordCard key={hdr.hdr_id} hdr={hdr} doc={doc} index={index} />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Records Found</h3>
            <p className="text-sm text-neutral-500">
              {searchQuery || filter !== 'all'
                ? 'Try adjusting your filters'
                : 'Review documents to create audit trail records'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Audit Record Card Component
function AuditRecordCard({ hdr, doc, index }: { hdr: HDRRecord; doc: any; index: number }) {
  const decisionColors = {
    APPROVE: 'inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md ring-1 ring-emerald-600/20',
    OVERRIDE: 'inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-1 rounded-md ring-1 ring-amber-600/20',
    ESCALATE: 'inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider bg-rose-50 text-rose-700 px-2 py-1 rounded-md ring-1 ring-rose-600/20',
  };

  const riskColors = {
    low: 'text-emerald-600',
    medium: 'text-amber-600',
    high: 'text-rose-600',
  };

  return (
    <Link
      href={`/audit/${hdr.hdr_id}`}
      className="block bg-white rounded-xl ring-1 ring-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 hover:ring-neutral-300 transition-all cursor-pointer animate-stagger"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex items-start gap-6">
        {/* Timeline Indicator */}
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            hdr.decision === 'APPROVE' ? 'bg-emerald-50' :
            hdr.decision === 'OVERRIDE' ? 'bg-amber-50' :
            'bg-rose-50'
          }`}>
            {hdr.decision === 'APPROVE' && (
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {hdr.decision === 'OVERRIDE' && (
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
              </svg>
            )}
            {hdr.decision === 'ESCALATE' && (
              <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            )}
          </div>
          {index !== 0 && <div className="w-px h-full bg-neutral-100 mt-2"></div>}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-base font-semibold text-neutral-900 truncate">
                  {hdr.document_name}
                </h3>
                <span className={decisionColors[hdr.decision as keyof typeof decisionColors]}>
                  {hdr.decision}
                </span>
                {doc && (
                  <span className={`text-xs ${riskColors[doc.risk_level as keyof typeof riskColors]}`}>
                    {doc.risk_level.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400" suppressHydrationWarning>
                {new Date(hdr.created_at).toLocaleString()} • {hdr.reviewer_email}
              </p>
            </div>
          </div>

          {/* HDR ID and Hash */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-400">HDR ID:</span>
              <code className="font-mono text-neutral-500">{hdr.hdr_id}</code>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-400">Hash:</span>
              <code className="font-mono text-neutral-500 truncate">{hdr.record_hash}</code>
            </div>
          </div>

          {/* Escalation Chain of Custody */}
          {hdr.decision === 'ESCALATE' && hdr.escalated_by && hdr.escalated_to && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-3">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-xs font-medium text-rose-700 mb-1">Chain of Custody</p>
                  <p className="text-sm text-neutral-700">
                    ⚠️ Escalated by <span className="font-semibold text-neutral-900">{getUserById(hdr.escalated_by)?.name || 'Unknown'}</span> to{' '}
                    <span className="font-semibold text-neutral-900">{getUserById(hdr.escalated_to)?.name || 'Unknown'}</span>
                  </p>
                  {hdr.escalation_reason && (
                    <p className="text-xs text-neutral-500 mt-2">
                      <span className="font-semibold">Reason:</span> {hdr.escalation_reason}
                    </p>
                  )}

                  {/* Resolution Status */}
                  {hdr.status === 'RESOLVED' && hdr.resolved_by && (
                    <div className="mt-3 pt-3 border-t border-rose-200">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-semibold text-emerald-600">RESOLVED</span>
                      </div>
                      <p className="text-sm text-neutral-700">
                        ✓ Manager <span className="font-semibold text-neutral-900">{getUserById(hdr.resolved_by)?.name || 'Unknown'}</span> {hdr.resolution_decision?.toLowerCase()}d this escalation
                      </p>
                      {hdr.resolved_at && (
                        <p className="text-xs text-neutral-500 mt-1" suppressHydrationWarning>
                          Resolved {new Date(hdr.resolved_at).toLocaleString()}
                        </p>
                      )}
                      {hdr.resolution_note && (
                        <p className="text-xs text-neutral-500 mt-2">
                          <span className="font-semibold">Manager Note:</span> {hdr.resolution_note}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Decision Note */}
          {hdr.decision_note && hdr.decision !== 'ESCALATE' && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 mb-3">
              <p className="text-xs text-neutral-500 mb-1">Decision Note:</p>
              <p className="text-sm text-neutral-700">{hdr.decision_note}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
            {/* Sealed Status */}
            {hdr.sealed_at && (
              <div className="flex items-center gap-2 text-xs">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-emerald-600">Sealed in WORM Ledger</span>
              </div>
            )}

            {/* View Details Link */}
            <div className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors font-medium">
              <span>View Full Audit Trail</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
