'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  getGovernanceConfig,
  setGovernanceConfig,
  getInternalPolicy,
  uploadInternalPolicy,
  subscribeToGovernanceConfig,
  subscribeToInternalPolicy,
  type GovernanceConfig,
  type InternalPolicy
} from '@/lib/store';

export default function GovernancePage() {
  const [config, setConfig] = useState<GovernanceConfig>({
    euAiAct: false,
    lgpd: false,
    coloradoSB205: false
  });
  const [policy, setPolicy] = useState<InternalPolicy>({
    fileName: null,
    uploadedAt: null,
    extractedRules: [],
    processing: false
  });
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    setConfig(getGovernanceConfig());
    setPolicy(getInternalPolicy());

    const unsubConfig = subscribeToGovernanceConfig(setConfig);
    const unsubPolicy = subscribeToInternalPolicy(setPolicy);

    return () => {
      unsubConfig();
      unsubPolicy();
    };
  }, []);

  const handleToggle = useCallback((framework: keyof GovernanceConfig) => {
    const newConfig = { ...config, [framework]: !config[framework] };
    setConfig(newConfig);
    setGovernanceConfig(newConfig);
  }, [config]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (file.type === 'application/pdf') {
      uploadInternalPolicy(file.name);
    }
  };

  const activeFrameworks = [
    config.euAiAct && 'EU AI Act',
    config.lgpd && 'LGPD',
    config.coloradoSB205 && 'Colorado SB 205'
  ].filter(Boolean) as string[];

  return (
    <div className="pt-14 bg-[#FAFAFA] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900 mb-3 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2 tracking-tight" style={{ letterSpacing: '-0.02em' }}>Governance Engine</h1>
              <p className="text-neutral-500">
                Configure compliance frameworks and internal policies
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg ring-1 ring-black/5">
              <div className={`w-2 h-2 rounded-full ${activeFrameworks.length > 0 || policy.fileName ? 'bg-emerald-600 animate-pulse' : 'bg-neutral-300'}`} />
              <span className="text-sm font-medium text-neutral-700">
                {activeFrameworks.length > 0 || policy.fileName ? `${activeFrameworks.length + (policy.fileName ? 1 : 0)} Active` : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Public Frameworks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white rounded-xl ring-1 ring-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 tracking-tight" style={{ letterSpacing: '-0.02em' }}>Public Frameworks</h2>
                  <p className="text-xs text-neutral-500">Activate regulatory compliance standards</p>
                </div>
              </div>

              <div className="space-y-4">
                <FrameworkToggle
                  label="EU AI Act"
                  description="Article 12 (Tamper-proof logging) & Article 14 (Human oversight)"
                  enabled={config.euAiAct}
                  onToggle={() => handleToggle('euAiAct')}
                />
                <FrameworkToggle
                  label="LGPD (Brazil)"
                  description="Lei Geral de Proteção de Dados - Brazilian data protection law"
                  enabled={config.lgpd}
                  onToggle={() => handleToggle('lgpd')}
                />
                <FrameworkToggle
                  label="Colorado SB 205"
                  description="AI bias & discrimination prevention requirements"
                  enabled={config.coloradoSB205}
                  onToggle={() => handleToggle('coloradoSB205')}
                />
              </div>

              {activeFrameworks.length > 0 && (
                <div className="mt-6 pt-6 border-t border-neutral-100">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-neutral-900">Active Frameworks</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeFrameworks.map((framework) => (
                      <span
                        key={framework}
                        className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md ring-1 ring-emerald-600/20"
                      >
                        {framework}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Internal Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="bg-white rounded-xl ring-1 ring-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 tracking-tight" style={{ letterSpacing: '-0.02em' }}>Internal Policy</h2>
                  <p className="text-xs text-neutral-500">Upload your company&apos;s governance manual (PDF)</p>
                </div>
              </div>

              {!policy.fileName ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                    dragActive
                      ? 'border-amber-600 bg-amber-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-sm font-medium text-neutral-900 mb-1">Drop your PDF here</p>
                    <p className="text-xs text-neutral-500">or click to browse</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <svg className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{policy.fileName}</p>
                      <p className="text-xs text-neutral-500">
                        Uploaded {policy.uploadedAt && new Date(policy.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!policy.processing && (
                      <button
                        onClick={() => {
                          setPolicy({ fileName: null, uploadedAt: null, extractedRules: [], processing: false });
                          localStorage.removeItem('trustdoc_internal_policy');
                        }}
                        className="text-neutral-400 hover:text-rose-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {policy.processing ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-amber-600 border-t-transparent" />
                        <span className="text-sm font-medium text-amber-700">AI Processing Rules...</span>
                      </div>
                      <div className="w-full bg-amber-200 rounded-full h-1.5">
                        <div className="bg-amber-600 h-1.5 rounded-full animate-pulse" style={{ width: '65%' }} />
                      </div>
                    </div>
                  ) : policy.extractedRules.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-semibold text-neutral-900">Extracted Rules ({policy.extractedRules.length})</span>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {policy.extractedRules.map((rule, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-neutral-600 p-2 bg-neutral-50 rounded-lg">
                            <span className="text-neutral-400 flex-shrink-0">{i + 1}.</span>
                            <span>{rule}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Active Status Summary */}
        {(activeFrameworks.length > 0 || policy.fileName) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-6"
          >
            <div className="bg-white rounded-xl ring-1 ring-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 mb-1">Governance Active</p>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    The AI will now analyze documents based on {activeFrameworks.length} public framework{activeFrameworks.length !== 1 ? 's' : ''}
                    {policy.fileName && ` and ${policy.extractedRules.length} internal policy rule${policy.extractedRules.length !== 1 ? 's' : ''}`}.
                    Documents violating these rules will be automatically flagged for human review.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function FrameworkToggle({
  label,
  description,
  enabled,
  onToggle
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-all">
      <div className="flex-1 pr-4">
        <h3 className="text-sm font-semibold text-neutral-900 mb-1">{label}</h3>
        <p className="text-xs text-neutral-500 leading-relaxed">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 ${
          enabled ? 'bg-emerald-600' : 'bg-neutral-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
