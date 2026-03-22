'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getAllHDRs, getHDRStats, subscribeToHDRs, getCurrentUser, getUserById, canViewDocumentType } from '@/lib/store';
import { MOCK_DOCUMENTS, type MockDocument } from '@/lib/mock-documents';
import { NotificationBell } from '@/components/NotificationBell';

export default function DashboardPage() {
  const [hdrs, setHdrs] = useState(getAllHDRs());
  const [stats, setStats] = useState(getHDRStats());
  const currentUser = getCurrentUser();

  // STRICT RBAC: Filter documents based on user role (zero-visibility security)
  const authorizedDocuments = MOCK_DOCUMENTS.filter(doc =>
    canViewDocumentType(currentUser.role, doc.type)
  );

  // Subscribe to HDR changes
  useEffect(() => {
    const unsubscribe = subscribeToHDRs((newHdrs) => {
      setHdrs(newHdrs);
      setStats(getHDRStats());
    });
    return unsubscribe;
  }, []);

  // Separate documents by status
  const completedDocIds = new Set(
    hdrs
      .filter(h => h.decision !== null && h.status !== 'ESCALATED')
      .map(h => h.document_id)
  );

  const escalatedHdrs = hdrs.filter(h => h.status === 'ESCALATED' && h.escalated_to === currentUser.id);
  const escalatedDocIds = new Set(escalatedHdrs.map(h => h.document_id));

  const pendingDocs = authorizedDocuments.filter(doc => !completedDocIds.has(doc.id) && !escalatedDocIds.has(doc.id));
  const completedDocs = authorizedDocuments.filter(doc => completedDocIds.has(doc.id));
  const escalatedDocs = authorizedDocuments.filter(doc => escalatedDocIds.has(doc.id));

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white tracking-tight">TrustDoc</h1>
              <p className="text-xs text-white/40 mt-0.5">
                AI accountability infrastructure
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="px-3 py-1.5 text-sm text-white/70 hover:text-white transition-colors"
              >
                {currentUser.name}
              </Link>
              <NotificationBell />
              <Link
                href="/audit"
                className="px-3 py-1.5 text-sm text-white/70 hover:text-white transition-colors"
              >
                Audit Trail
              </Link>
              <Link
                href="/"
                className="px-3 py-1.5 text-sm text-rose-400/70 hover:text-rose-400 transition-colors"
              >
                Log Out
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Pending */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, duration: 0.3 }}
            className="metric-card"
          >
            <div className="metric-label">Pending Review</div>
            <div className="flex items-end justify-between">
              <div className="metric-value">{pendingDocs.length}</div>
              <svg className="w-16 h-8 opacity-30" viewBox="0 0 64 32">
                <path
                  d="M0 24 L16 20 L32 16 L48 12 L64 8"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="text-xs text-white/40">{authorizedDocuments.length} total authorized</div>
          </motion.div>

          {/* Approved */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.3 }}
            className="metric-card"
          >
            <div className="metric-label">Approved</div>
            <div className="flex items-end justify-between">
              <div className="metric-value text-emerald-400">{stats.approved}</div>
              <div className="relative w-12 h-12">
                <svg className="transform -rotate-90" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="rgba(16, 185, 129, 0.1)"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#10b981"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${(stats.approved / Math.max(stats.total, 1)) * 125.6} 125.6`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <div className="text-xs text-white/40">
              {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}% of reviewed
            </div>
          </motion.div>

          {/* Escalated */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="metric-card"
          >
            <div className="metric-label">Escalated</div>
            <div className="flex items-end justify-between">
              <div className="metric-value text-rose-400">{stats.escalated}</div>
              <div className="relative w-12 h-12">
                <svg className="transform -rotate-90" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="rgba(244, 63, 94, 0.1)"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#f43f5e"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${(stats.escalated / Math.max(stats.total, 1)) * 125.6} 125.6`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <div className="text-xs text-white/40">Requires senior review</div>
          </motion.div>
        </div>

        {/* Document Feed */}
        <div className="fintech-card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Document Queue
            </h2>
          </div>

          {pendingDocs.length > 0 ? (
            <table className="fintech-table">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="fintech-table-cell text-left">
                    <span className="metric-label">Document</span>
                  </th>
                  <th className="fintech-table-cell text-left">
                    <span className="metric-label">Type</span>
                  </th>
                  <th className="fintech-table-cell text-left">
                    <span className="metric-label">Risk</span>
                  </th>
                  <th className="fintech-table-cell text-left">
                    <span className="metric-label">Issues</span>
                  </th>
                  <th className="fintech-table-cell text-left">
                    <span className="metric-label">Pages</span>
                  </th>
                  <th className="fintech-table-cell"></th>
                </tr>
              </thead>
              <tbody>
                {pendingDocs.map((doc, idx) => (
                  <motion.tr
                    key={doc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03, duration: 0.2 }}
                    className="fintech-table-row"
                  >
                    <td className="fintech-table-cell">
                      <div className="text-sm font-medium text-white max-w-md truncate">
                        {doc.name}
                      </div>
                    </td>
                    <td className="fintech-table-cell">
                      <div className="text-xs text-white/50 uppercase tracking-wider font-mono">
                        {doc.type}
                      </div>
                    </td>
                    <td className="fintech-table-cell">
                      <div className="status-badge">
                        <div className={`status-dot-${
                          doc.risk_level === 'high' ? 'rose' :
                          doc.risk_level === 'medium' ? 'amber' : 'mint'
                        }`} />
                        <span className="text-white/70 text-xs capitalize">{doc.risk_level}</span>
                      </div>
                    </td>
                    <td className="fintech-table-cell">
                      <div className="text-sm text-white/70">{doc.key_issues}</div>
                    </td>
                    <td className="fintech-table-cell">
                      <div className="text-sm text-white/50">{doc.pages}</div>
                    </td>
                    <td className="fintech-table-cell text-right">
                      <Link
                        href={`/review/${doc.id}`}
                        className="text-xs text-white/50 hover:text-white transition-colors font-medium"
                      >
                        Review →
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <div className="text-white/20 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-white/40">No pending documents</p>
            </div>
          )}
        </div>

        {/* Escalated Documents */}
        {escalatedDocs.length > 0 && (
          <div className="fintech-card p-0 overflow-hidden mt-8">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                Escalated to You
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs text-rose-400">{escalatedDocs.length}</span>
              </div>
            </div>

            <table className="fintech-table">
              <tbody>
                {escalatedDocs.map((doc) => {
                  const hdr = escalatedHdrs.find(h => h.document_id === doc.id);
                  const escalatedBy = hdr?.escalated_by ? getUserById(hdr.escalated_by) : null;

                  return (
                    <tr key={doc.id} className="fintech-table-row">
                      <td className="fintech-table-cell">
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-white mb-1">{doc.name}</div>
                            {hdr?.escalation_reason && (
                              <div className="text-xs text-white/50 italic">"{hdr.escalation_reason}"</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="fintech-table-cell">
                        <div className="text-xs text-white/50">From {escalatedBy?.name}</div>
                      </td>
                      <td className="fintech-table-cell text-right">
                        <Link
                          href={`/review/${doc.id}`}
                          className="text-xs text-rose-400/70 hover:text-rose-400 transition-colors font-medium"
                        >
                          Resolve →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
