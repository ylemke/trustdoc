'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getAllHDRs, getHDRStats, subscribeToHDRs, getCurrentUser, getUserById, canViewDocumentType } from '@/lib/store';
import { MOCK_DOCUMENTS, type MockDocument } from '@/lib/mock-documents';

export default function DashboardPage() {
  const [hdrs, setHdrs] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, overridden: 0, escalated: 0, pending: 0 });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authorizedDocuments, setAuthorizedDocuments] = useState<MockDocument[]>([]);
  const [pendingDocs, setPendingDocs] = useState<MockDocument[]>([]);
  const [completedDocs, setCompletedDocs] = useState<MockDocument[]>([]);
  const [escalatedDocs, setEscalatedDocs] = useState<MockDocument[]>([]);
  const [escalatedHdrs, setEscalatedHdrs] = useState<any[]>([]);

  // Initialize on client side only
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    const authorized = MOCK_DOCUMENTS.filter(doc =>
      canViewDocumentType(user.role, doc.type)
    );
    setAuthorizedDocuments(authorized);

    const allHdrs = getAllHDRs();
    setHdrs(allHdrs);
    setStats(getHDRStats());

    // Separate documents by status
    const completedDocIds = new Set(
      allHdrs
        .filter(h => h.decision !== null && h.status !== 'ESCALATED')
        .map(h => h.document_id)
    );

    const escalated = allHdrs.filter(h => h.status === 'ESCALATED' && h.escalated_to === user.id);
    setEscalatedHdrs(escalated);
    const escalatedDocIds = new Set(escalated.map(h => h.document_id));

    setPendingDocs(authorized.filter(doc => !completedDocIds.has(doc.id) && !escalatedDocIds.has(doc.id)));
    setCompletedDocs(authorized.filter(doc => completedDocIds.has(doc.id)));
    setEscalatedDocs(authorized.filter(doc => escalatedDocIds.has(doc.id)));
  }, []);

  // Subscribe to HDR changes
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToHDRs((newHdrs) => {
      setHdrs(newHdrs);
      setStats(getHDRStats());

      const completedDocIds = new Set(
        newHdrs
          .filter(h => h.decision !== null && h.status !== 'ESCALATED')
          .map(h => h.document_id)
      );

      const escalated = newHdrs.filter(h => h.status === 'ESCALATED' && h.escalated_to === currentUser.id);
      setEscalatedHdrs(escalated);
      const escalatedDocIds = new Set(escalated.map(h => h.document_id));

      setPendingDocs(authorizedDocuments.filter(doc => !completedDocIds.has(doc.id) && !escalatedDocIds.has(doc.id)));
      setCompletedDocs(authorizedDocuments.filter(doc => completedDocIds.has(doc.id)));
      setEscalatedDocs(authorizedDocuments.filter(doc => escalatedDocIds.has(doc.id)));
    });
    return unsubscribe;
  }, [currentUser, authorizedDocuments]);

  return (
    <div className="pt-14">
      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Pending */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, duration: 0.3 }}
            className="bg-white rounded-xl p-6 ring-1 ring-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          >
            <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-3">
              Pending Review
            </div>
            <div className="flex items-end justify-between">
              <div className="text-4xl font-bold text-neutral-900">{pendingDocs.length}</div>
              <svg className="w-16 h-8 opacity-20" viewBox="0 0 64 32">
                <path
                  d="M0 24 L16 20 L32 16 L48 12 L64 8"
                  stroke="rgb(251, 191, 36)"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="text-xs text-neutral-500 mt-2">{authorizedDocuments.length} total authorized</div>
          </motion.div>

          {/* Approved */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.3 }}
            className="bg-white rounded-xl p-6 ring-1 ring-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          >
            <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-3">
              Approved
            </div>
            <div className="flex items-end justify-between">
              <div className="text-4xl font-bold text-emerald-600">{stats.approved}</div>
              <div className="relative w-12 h-12">
                <svg className="transform -rotate-90" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="rgba(0, 0, 0, 0.05)"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="rgb(5, 150, 105)"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${(stats.approved / Math.max(stats.total, 1)) * 125.6} 125.6`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <div className="text-xs text-neutral-500 mt-2">
              {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}% of reviewed
            </div>
          </motion.div>

          {/* Escalated */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="bg-white rounded-xl p-6 ring-1 ring-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          >
            <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-3">
              Escalated
            </div>
            <div className="flex items-end justify-between">
              <div className="text-4xl font-bold text-rose-600">{stats.escalated}</div>
              <div className="relative w-12 h-12">
                <svg className="transform -rotate-90" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="rgba(0, 0, 0, 0.05)"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="rgb(220, 38, 38)"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${(stats.escalated / Math.max(stats.total, 1)) * 125.6} 125.6`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <div className="text-xs text-neutral-500 mt-2">Requires senior review</div>
          </motion.div>
        </div>

        {/* Document Queue - High-Density Table */}
        <div className="bg-white rounded-xl ring-1 ring-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
              Document Queue
            </h2>
          </div>

          {pendingDocs.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="px-6 py-3 text-left">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Document</span>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Type</span>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Risk</span>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Issues</span>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Pages</span>
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {pendingDocs.map((doc, idx) => (
                  <motion.tr
                    key={doc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03, duration: 0.2 }}
                    className="h-16 border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6">
                      <div className="text-sm font-medium text-neutral-900 max-w-md truncate">
                        {doc.name}
                      </div>
                    </td>
                    <td className="px-6">
                      <span className="inline-flex text-[10px] uppercase tracking-wider text-neutral-400 bg-neutral-50 px-2 py-1 rounded-md ring-1 ring-neutral-200/50">
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-6">
                      <div className="flex items-center gap-2">
                        {doc.risk_level === 'high' && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider bg-rose-50 text-rose-700 px-2 py-1 rounded-md ring-1 ring-rose-600/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            High
                          </span>
                        )}
                        {doc.risk_level === 'medium' && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-1 rounded-md ring-1 ring-amber-600/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Medium
                          </span>
                        )}
                        {doc.risk_level === 'low' && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md ring-1 ring-emerald-600/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Low
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6">
                      <div className="text-sm text-neutral-500">{doc.key_issues}</div>
                    </td>
                    <td className="px-6">
                      <div className="text-sm text-neutral-500">{doc.pages}</div>
                    </td>
                    <td className="px-6 text-right">
                      <Link
                        href={`/review/${doc.id}`}
                        className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors font-medium"
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
              <div className="text-neutral-300 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-neutral-500">No pending documents</p>
            </div>
          )}
        </div>

        {/* Escalated Documents */}
        {escalatedDocs.length > 0 && (
          <div className="bg-white rounded-xl ring-1 ring-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden mt-8">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
                Escalated to You
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs text-rose-600">{escalatedDocs.length}</span>
              </div>
            </div>

            <table className="w-full">
              <tbody>
                {escalatedDocs.map((doc) => {
                  const hdr = escalatedHdrs.find(h => h.document_id === doc.id);
                  const escalatedBy = hdr ? getUserById(hdr.escalated_by) : null;

                  return (
                    <tr key={doc.id} className="h-16 border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                      <td className="px-6">
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-neutral-900 mb-1">{doc.name}</div>
                            {hdr?.escalation_reason && (
                              <div className="text-xs text-neutral-500 italic">"{hdr.escalation_reason}"</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6">
                        <div className="text-xs text-neutral-500">From {escalatedBy?.name}</div>
                      </td>
                      <td className="px-6 text-right">
                        <Link
                          href={`/review/${doc.id}`}
                          className="text-xs text-rose-600 hover:text-rose-700 transition-colors font-medium"
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
