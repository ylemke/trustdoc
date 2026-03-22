'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getCurrentUser, getPermittedDocumentTypes, getAvailableManagers, type User } from '@/lib/store';

export default function ProfilePage() {
  const currentUser = getCurrentUser();
  const permittedTypes = getPermittedDocumentTypes(currentUser.role);
  const managers = getAvailableManagers(currentUser.id);

  // MFA Status (simulated - always active for demo)
  const mfaStatus = {
    totp: true,
    webauthn: true,
  };

  return (
    <div className="pt-14">
      <div className="max-w-[1800px] mx-auto px-8 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900 mb-3 inline-block">
            ← Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2 tracking-tight">Workspace & Profile</h1>
            <p className="text-neutral-500 text-sm">
              Identity verification and access control settings
            </p>
          </div>
        </div>
        {/* 60/40 Split-Pane Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Pane (40%) - Identity & Security */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Identity Card */}
            <div className="fintech-card">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">{currentUser.name}</h2>
                  <p className="text-sm text-neutral-500">{currentUser.role}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">
                    Email Address
                  </label>
                  <div className="text-base text-neutral-900 font-mono">
                    {currentUser.email}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">
                    Department
                  </label>
                  <div className="text-base text-neutral-900">
                    {currentUser.department}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">
                    User ID
                  </label>
                  <div className="text-sm text-neutral-900 font-mono bg-neutral-100 px-3 py-2 rounded-lg">
                    {currentUser.id}
                  </div>
                </div>
              </div>
            </div>

            {/* MFA Security Status */}
            <div className="fintech-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                  Multi-Factor Authentication
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-600 animate-pulse shadow-[0_0_12px_rgba(5,150,105,0.4)]" />
                  <span className="text-sm font-semibold text-emerald-600">Active</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">TOTP Authenticator</div>
                      <div className="text-xs text-neutral-500">Time-based one-time password</div>
                    </div>
                  </div>
                  {mfaStatus.totp && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">WebAuthn</div>
                      <div className="text-xs text-neutral-500">Biometric / Security key</div>
                    </div>
                  </div>
                  {mfaStatus.webauthn && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Pane (60%) - Permissions & Chain of Command */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Access Permissions */}
            <div className="fintech-card">
              <h3 className="text-xl font-bold text-neutral-900 mb-6 tracking-tight">
                Document Access Permissions
              </h3>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">Authorized Document Types</div>
                    <div className="text-xs text-neutral-500">
                      You can review and approve the following document categories
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {permittedTypes.map((type) => (
                    <div
                      key={type}
                      className="px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between group hover:bg-emerald-100 transition-all"
                    >
                      <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">
                        {type}
                      </span>
                      <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-violet-50 border border-violet-200">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-neutral-900 font-semibold mb-1">Zero-Visibility Security</p>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Documents outside your authorization scope are filtered at the data layer. You will not see titles, metadata, or any information about restricted documents. This prevents information leakage and maintains strict role boundaries.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chain of Command */}
            <div className="fintech-card">
              <h3 className="text-xl font-bold text-neutral-900 mb-6 tracking-tight">
                Chain of Command
              </h3>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">Escalation Managers</div>
                    <div className="text-xs text-neutral-500">
                      You can escalate decisions to the following managers
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {managers.map((manager) => (
                    <div
                      key={manager.id}
                      className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                          {manager.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-neutral-900">{manager.name}</div>
                          <div className="text-xs text-neutral-500">{manager.role}</div>
                          <div className="text-xs text-neutral-500 font-mono">{manager.email}</div>
                        </div>
                        <div className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700 uppercase tracking-wider">
                          Manager
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="fintech-card">
              <h3 className="text-xl font-bold text-neutral-900 mb-6 tracking-tight">
                Session Activity
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                    Last Login
                  </div>
                  <div className="text-base text-neutral-900 font-mono">
                    Today, 09:42
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                    IP Address
                  </div>
                  <div className="text-base text-neutral-900 font-mono">
                    192.168.1.x
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                    Device
                  </div>
                  <div className="text-base text-neutral-900">
                    Windows
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
