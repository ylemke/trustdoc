'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpCircle, Clock, User, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { getAllHDRs, getCurrentUser, getUserById, resolveEscalation, subscribeToHDRs } from '@/lib/store';

export default function WorklistPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [escalatedToMe, setEscalatedToMe] = useState<any[]>([]);
  const [myEscalations, setMyEscalations] = useState<any[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    loadWorklist(user);

    // Subscribe to changes
    const unsubscribe = subscribeToHDRs(() => {
      loadWorklist(user);
    });

    return () => unsubscribe();
  }, []);

  const loadWorklist = (user: any) => {
    const allHdrs = getAllHDRs();

    // Documents escalated TO me
    const toMe = allHdrs.filter(
      h => h.status === 'ESCALATED' && h.escalated_to === user.id
    );
    setEscalatedToMe(toMe);

    // Documents I escalated (and their status)
    const byMe = allHdrs.filter(
      h => h.escalated_by === user.id
    );
    setMyEscalations(byMe);
  };

  const getRiskBadge = (riskLevel: string) => {
    const colors = {
      high: 'bg-red-100 text-red-700 ring-red-600/20',
      medium: 'bg-amber-100 text-amber-700 ring-amber-600/20',
      low: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
    };
    return colors[riskLevel as keyof typeof colors] || colors.medium;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ESCALATED') {
      return 'bg-rose-100 text-rose-700 ring-rose-600/20';
    }
    if (status === 'RESOLVED') {
      return 'bg-emerald-100 text-emerald-700 ring-emerald-600/20';
    }
    return 'bg-neutral-100 text-neutral-700 ring-neutral-600/20';
  };

  if (!currentUser) return null;

  const isManager = currentUser.role.includes('Head');

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Worklist</h1>
          <p className="text-neutral-600">
            {isManager ? 'Review escalated documents and make final decisions' : 'Track your escalations and pending decisions'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 ring-1 ring-black/5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                <ArrowUpCircle className="w-6 h-6 text-rose-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Escalated to Me</p>
                <p className="text-2xl font-bold text-neutral-900">{escalatedToMe.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 ring-1 ring-black/5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-neutral-500">My Escalations</p>
                <p className="text-2xl font-bold text-neutral-900">{myEscalations.filter(h => h.status === 'ESCALATED').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 ring-1 ring-black/5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Resolved</p>
                <p className="text-2xl font-bold text-neutral-900">{myEscalations.filter(h => h.status === 'RESOLVED').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {isManager && (
          <>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Escalations Requiring Your Review</h2>
            {escalatedToMe.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center ring-1 ring-black/5">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" strokeWidth={1.5} />
                <p className="text-lg font-semibold text-neutral-900 mb-2">All Clear!</p>
                <p className="text-neutral-600">No escalations pending your review.</p>
              </div>
            ) : (
              <div className="space-y-4 mb-12">
                {escalatedToMe.map((hdr) => {
                  const escalator = getUserById(hdr.escalated_by || '');
                  const escalatedDate = new Date(hdr.created_at);

                  return (
                    <Link
                      key={hdr.hdr_id}
                      href={`/review/${hdr.document_id}`}
                      className="block bg-white rounded-xl p-6 ring-1 ring-black/5 hover:ring-violet-300 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-5 h-5 text-neutral-400" strokeWidth={1.5} />
                            <h3 className="text-lg font-semibold text-neutral-900">{hdr.document_name}</h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-neutral-600">
                            <div className="flex items-center gap-2">
                              <User size={14} />
                              <span>Escalated by {escalator?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={14} />
                              <span suppressHydrationWarning>{escalatedDate.toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-md ring-1 font-semibold ${getRiskBadge('high')}`}>
                          <AlertTriangle size={12} />
                          Priority
                        </span>
                      </div>

                      {hdr.escalation_reason && (
                        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-md mb-4">
                          <p className="text-sm font-semibold text-rose-900 mb-1">Escalation Reason:</p>
                          <p className="text-sm text-rose-700">{hdr.escalation_reason}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <span>Chat Transcript: {hdr.chat_transcript?.length || 0} messages</span>
                        </div>
                        <button className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700 transition-colors">
                          Review Now →
                        </button>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* My Escalations */}
        <h2 className="text-xl font-bold text-neutral-900 mb-4">My Escalations</h2>
        {myEscalations.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center ring-1 ring-black/5">
            <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-lg font-semibold text-neutral-900 mb-2">No Escalations Yet</p>
            <p className="text-neutral-600">Documents you escalate will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myEscalations.map((hdr) => {
              const manager = getUserById(hdr.escalated_to || '');
              const isResolved = hdr.status === 'RESOLVED';

              return (
                <div
                  key={hdr.hdr_id}
                  className="bg-white rounded-xl p-6 ring-1 ring-black/5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-neutral-400" strokeWidth={1.5} />
                        <h3 className="text-lg font-semibold text-neutral-900">{hdr.document_name}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-600">
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          <span>Escalated to {manager?.name}</span>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-1 rounded-md ring-1 font-semibold ${getStatusBadge(hdr.status || 'PENDING')}`}>
                          {hdr.status || 'PENDING'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {hdr.escalation_reason && (
                    <div className="bg-neutral-50 border-l-4 border-neutral-300 p-4 rounded-r-md mb-4">
                      <p className="text-sm font-semibold text-neutral-700 mb-1">Your Reason:</p>
                      <p className="text-sm text-neutral-600">{hdr.escalation_reason}</p>
                    </div>
                  )}

                  {isResolved && (
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-md">
                      <p className="text-sm font-semibold text-emerald-900 mb-1">✓ Resolved</p>
                      <p className="text-sm text-emerald-700">
                        {manager?.name} {hdr.resolution_decision?.toLowerCase()}d this escalation
                      </p>
                      {hdr.resolution_note && (
                        <p className="text-sm text-emerald-600 mt-2 italic">"{hdr.resolution_note}"</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
