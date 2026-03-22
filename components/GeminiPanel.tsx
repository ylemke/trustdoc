'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { getGovernanceConfig, getInternalPolicy } from '@/lib/store';

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: string;
  timestamp: string;
}

interface GeminiPanelProps {
  documentId: string;
  documentName: string;
  documentText: string;
}

export function GeminiPanel({ documentId, documentName, documentText }: GeminiPanelProps) {
  const [messages, setMessages] = useState<GeminiMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse]);

  // Load chat history from localStorage
  useEffect(() => {
    const storageKey = `trustdoc_gemini_${documentId}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      setMessages(JSON.parse(stored));
    } else {
      // Auto-trigger initial compliance analysis
      startInitialAnalysis();
    }
  }, [documentId]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      const storageKey = `trustdoc_gemini_${documentId}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, documentId]);

  const startInitialAnalysis = async () => {
    setIsStreaming(true);
    setCurrentResponse('');

    const governance = getGovernanceConfig();
    const policy = getInternalPolicy();

    // Timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText,
          documentName,
          activeFrameworks: governance,
          internalPolicyRules: policy.extractedRules,
          chatHistory: [],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'content') {
              accumulatedText += data.text;
              setCurrentResponse(accumulatedText);
            } else if (data.type === 'done') {
              const newMessage: GeminiMessage = {
                role: 'model',
                parts: accumulatedText,
                timestamp: new Date().toISOString(),
              };
              setMessages([newMessage]);
              setCurrentResponse('');
              setIsStreaming(false);
            } else if (data.type === 'error') {
              console.error('Streaming error:', data.message);
              setIsStreaming(false);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Initial analysis failed:', error);
      setIsStreaming(false);

      // Show user-friendly error message
      const errorMsg = error.name === 'AbortError'
        ? '⏱️ Connection timed out. The AI service took too long to respond. Please refresh and try again.'
        : `❌ Analysis failed: ${error.message}. Please check your connection and try again.`;

      const errorMessage: GeminiMessage = {
        role: 'model',
        parts: errorMsg,
        timestamp: new Date().toISOString(),
      };
      setMessages([errorMessage]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage: GeminiMessage = {
      role: 'user',
      parts: input.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message immediately to UI
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    setCurrentResponse('');

    const governance = getGovernanceConfig();
    const policy = getInternalPolicy();

    // Timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      console.log('💬 Sending message to Gemini API...');
      console.log('📝 Chat history length:', messages.length);
      console.log('✏️ User message:', userMessage.parts);

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText,
          documentName,
          activeFrameworks: governance,
          internalPolicyRules: policy.extractedRules,
          chatHistory: [...messages, userMessage], // ✅ FIX: Include current user message
          userMessage: input.trim(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API responded with error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ API response received, starting stream...');

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('✅ Stream complete');
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'content') {
                accumulatedText += data.text;
                setCurrentResponse(accumulatedText);
              } else if (data.type === 'done') {
                const newMessage: GeminiMessage = {
                  role: 'model',
                  parts: accumulatedText,
                  timestamp: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, newMessage]); // ✅ FIX: Don't add userMessage again
                setCurrentResponse('');
                setIsStreaming(false);
                console.log('✅ Gemini response complete:', accumulatedText.length, 'characters');
              } else if (data.type === 'error') {
                console.error('❌ Streaming error from API:', data.message);
                setIsStreaming(false);

                // Check if it's a quota error (429)
                if (data.message.includes('429') || data.message.includes('quota') || data.message.includes('Too Many Requests')) {
                  throw new Error('QUOTA_EXCEEDED');
                }

                throw new Error(data.message);
              }
            } catch (parseError) {
              console.error('❌ Failed to parse SSE data:', parseError, 'Line:', line);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('❌ Chat failed:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      setIsStreaming(false);

      // Show user-friendly error message
      let errorMsg: string;

      if (error.message === 'QUOTA_EXCEEDED') {
        errorMsg = `🚫 **Gemini API Quota Exceeded**

Unfortunately, the free tier quota for Google Gemini API has been reached (20 requests/day).

**What you can do:**
1. **Wait**: The quota resets in 24 hours
2. **Upgrade**: Get a paid API key at https://ai.google.dev
3. **Demo Mode**: Continue reviewing documents without AI assistance (manual review only)

**For demo purposes**, you can still:
- ✅ Upload and view documents
- ✅ Record decisions manually
- ✅ Generate certified PDFs
- ✅ View audit trails

**Note**: This is expected behavior for free tier usage during development/testing.`;
      } else if (error.name === 'AbortError') {
        errorMsg = '⏱️ Connection timed out. Retrying... Please wait or refresh the page.';
      } else {
        errorMsg = `❌ Sorry, I encountered an error: ${error.message}. Please try again.`;
      }

      const errorMessage: GeminiMessage = {
        role: 'model',
        parts: errorMsg,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-neutral-100 px-6 py-4">
        <h2 className="text-lg font-semibold text-neutral-900">AI Compliance Insights & Chat</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Powered by Google Gemini • Cross-referenced with WORM Ledger policies
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ overflowAnchor: 'none' }}>
        {messages.length === 0 && !currentResponse && isStreaming && (
          <div className="flex items-center gap-3 text-neutral-500 bg-neutral-50 px-4 py-3 rounded-lg min-h-[60px]">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm">Gemini is cross-referencing contract with WORM Ledger policies...</span>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index}>
            {message.role === 'user' ? (
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-neutral-900 text-white rounded-lg px-4 py-3">
                  <div className="text-sm leading-relaxed">{message.parts}</div>
                  <div className="text-[10px] text-neutral-400 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-start">
                <div className="max-w-full w-full">
                  <ComplianceAnalysisCard content={message.parts} timestamp={message.timestamp} />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Streaming response */}
        {currentResponse && (
          <div className="flex justify-start">
            <div className="max-w-full w-full">
              <ComplianceAnalysisCard content={currentResponse} timestamp={new Date().toISOString()} isStreaming />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-neutral-100 p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about specific clauses, risks, or compliance requirements..."
            style={{ color: '#000000 !important', backgroundColor: '#ffffff !important', caretColor: '#000000 !important' }}
            className="flex-1 ring-1 ring-neutral-200 rounded-lg px-4 py-3 text-sm placeholder-neutral-400 focus:ring-neutral-900 focus:outline-none transition-all"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="bg-neutral-900 text-white rounded-lg px-6 py-3 hover:bg-neutral-800 disabled:opacity-40 transition-colors flex items-center gap-2"
          >
            <Send size={16} strokeWidth={1.5} />
          </button>
        </form>
        <p className="text-[10px] text-neutral-400 mt-2 text-center">
          Entire conversation is sealed with your decision for cryptographic verification
        </p>
      </div>
    </div>
  );
}

/**
 * Professional card component with advanced markdown rendering
 */
function ComplianceAnalysisCard({
  content,
  timestamp,
  isStreaming = false,
}: {
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}) {
  // Advanced markdown parser with section cards
  const parseContent = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let currentSection: { type: string; lines: string[] } | null = null;
    let keyCounter = 0;

    const flushList = () => {
      if (listItems.length > 0) {
        const listKey = `list-${keyCounter++}`;
        elements.push(
          <ul key={listKey} className="space-y-2 mb-4 ml-2" style={{ lineHeight: '1.6' }}>
            {listItems.map((item, idx) => (
              <li key={`${listKey}-item-${idx}`} className="flex items-start gap-2 text-sm text-neutral-700">
                <span className="text-neutral-400">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    const flushSection = () => {
      if (currentSection) {
        const sectionKey = `section-${keyCounter++}`;
        const isHighRisk = currentSection.lines.some(l => l.match(/HIGH|ALTO|CRITICAL|CRÍTICO/i));
        const isRegulatory = currentSection.type.includes('Regulatory') || currentSection.type.includes('Compliance');

        const bgColor = isHighRisk ? 'bg-rose-50' : isRegulatory ? 'bg-violet-50' : 'bg-neutral-50';
        const borderColor = isHighRisk ? 'border-rose-500' : isRegulatory ? 'border-violet-500' : 'border-neutral-300';

        elements.push(
          <div key={sectionKey} className={`${bgColor} border-l-4 ${borderColor} p-4 my-3 rounded-r-md`}>
            <h4 className="font-bold text-sm text-neutral-900 mb-2">
              {currentSection.type}
            </h4>
            <div className="space-y-1 text-sm text-neutral-700">
              {currentSection.lines.map((line, idx) => (
                <p key={`${sectionKey}-line-${idx}`}>{line}</p>
              ))}
            </div>
          </div>
        );
        currentSection = null;
      }
    };

    lines.forEach((line) => {
      // ### Headers (Markdown H3) - Pristine Style
      if (line.match(/^###\s+(.+)/)) {
        flushList();
        flushSection();
        const headerText = line.replace(/^###\s+/, '');
        elements.push(
          <h3 key={`h3-${keyCounter++}`} className="text-sm font-bold uppercase tracking-wider text-neutral-500 mt-6 mb-2">
            {headerText}
          </h3>
        );
        // Start a new section for content after this header
        currentSection = { type: headerText, lines: [] };
      }
      // Bold text (**text**)
      else if (line.match(/^\*\*(.+)\*\*$/)) {
        flushList();
        elements.push(
          <h4 key={`bold-${keyCounter++}`} className="font-semibold text-neutral-900 text-base mb-2 mt-3">
            {line.replace(/\*\*/g, '')}
          </h4>
        );
      }
      // Numbered or bullet lists
      else if (line.match(/^[0-9]+\.\s/) || line.match(/^-\s/)) {
        listItems.push(line.replace(/^[0-9]+\.\s|-\s/, ''));
      }
      // Risk level detection with colored badges
      else if (line.match(/RISK LEVEL|RISCO:/i)) {
        flushList();
        flushSection();
        const isHigh = line.match(/HIGH|ALTO/i);
        const isMedium = line.match(/MEDIUM|MÉDIO/i);
        const isLow = line.match(/LOW|BAIXO/i);

        const badgeColor = isHigh ? 'bg-red-100 text-red-700 ring-red-600/20' :
                           isMedium ? 'bg-amber-100 text-amber-700 ring-amber-600/20' :
                           'bg-emerald-100 text-emerald-700 ring-emerald-600/20';

        elements.push(
          <div key={`risk-${keyCounter++}`} className="flex items-center gap-3 my-4">
            {isHigh && <AlertTriangle size={20} className="text-red-500" strokeWidth={2} />}
            {isMedium && <Info size={20} className="text-amber-500" strokeWidth={2} />}
            {isLow && <CheckCircle size={20} className="text-emerald-500" strokeWidth={2} />}
            <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-bold ring-1 ${badgeColor}`}>
              {line}
            </span>
          </div>
        );
      }
      // Regular text
      else if (line.trim()) {
        flushList();

        // If we're in a section, add to section lines
        if (currentSection) {
          currentSection.lines.push(line);
        } else {
          // Inline bold rendering for **text**
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          elements.push(
            <p key={`text-${keyCounter++}`} className="text-sm text-neutral-700 mb-2" style={{ lineHeight: '1.6' }}>
              {parts.map((part, idx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={idx} className="font-semibold text-neutral-900">{part.slice(2, -2)}</strong>;
                }
                return part;
              })}
            </p>
          );
        }
      }
    });

    flushList();
    flushSection();
    return elements;
  };

  return (
    <div className="bg-gradient-to-br from-neutral-50 to-white rounded-xl p-6 ring-1 ring-neutral-200 shadow-sm">
      {parseContent(content)}
      {isStreaming && (
        <div className="flex items-center gap-1 mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
          <span className="text-xs text-neutral-500">AI is analyzing...</span>
        </div>
      )}
      <div className="text-[10px] text-neutral-400 mt-4 border-t border-neutral-100 pt-3">
        {new Date(timestamp).toLocaleString()}
      </div>
    </div>
  );
}

// Export function to get chat history for HDR sealing
export function getGeminiChatHistory(documentId: string): GeminiMessage[] {
  if (typeof window === 'undefined') return [];
  const storageKey = `trustdoc_gemini_${documentId}`;
  const stored = localStorage.getItem(storageKey);
  return stored ? JSON.parse(stored) : [];
}

// Export function to clear chat history
export function clearGeminiChatHistory(documentId: string): void {
  if (typeof window === 'undefined') return;
  const storageKey = `trustdoc_gemini_${documentId}`;
  localStorage.removeItem(storageKey);
}
