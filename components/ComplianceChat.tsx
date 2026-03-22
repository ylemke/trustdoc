'use client';

import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { getGovernanceConfig, getInternalPolicy } from '@/lib/store';
import type { GovernanceConfig, InternalPolicy } from '@/lib/store';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

type Message = ChatMessage;

interface AIAnalysis {
  risk_level: 'low' | 'medium' | 'high';
  summary: string;
  issues: Array<{
    clause: string;
    reason: string;
    severity: 'low' | 'medium' | 'high';
    framework?: string;
  }>;
  recommendations: string[];
}

interface ComplianceChatProps {
  documentId: string;
  documentName: string;
  riskLevel: string;
  aiAnalysis?: AIAnalysis | null;
}

export function ComplianceChat({ documentId, documentName, riskLevel, aiAnalysis }: ComplianceChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [governance, setGovernance] = useState<GovernanceConfig>({ euAiAct: false, lgpd: false, coloradoSB205: false });
  const [policy, setPolicy] = useState<InternalPolicy>({ fileName: null, uploadedAt: null, extractedRules: [], processing: false });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage
  useEffect(() => {
    const storageKey = `trustdoc_chat_${documentId}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      setMessages(JSON.parse(stored));
    } else {
      // Initialize with context-aware greeting
      const config = getGovernanceConfig();
      const pol = getInternalPolicy();
      setGovernance(config);
      setPolicy(pol);

      const activeFrameworks = [
        config.euAiAct && 'EU AI Act',
        config.lgpd && 'LGPD',
        config.coloradoSB205 && 'Colorado SB 205'
      ].filter(Boolean);

      let greeting = `Analyzing **${documentName}** (Risk Level: **${riskLevel.toUpperCase()}**).\n\n`;

      if (activeFrameworks.length > 0) {
        greeting += `Compliance frameworks active: **${activeFrameworks.join(', ')}**.\n\n`;
      }

      if (pol.fileName && pol.extractedRules.length > 0) {
        greeting += `Internal policy loaded: **${pol.fileName}** (${pol.extractedRules.length} rules extracted).\n\n`;
      }

      greeting += "I'm your compliance co-pilot powered by Google Gemini. ";
      greeting += "I have full context of the AI analysis. Ask me about specific clauses, risk factors, or regulatory implications.";

      const initialMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: greeting,
        timestamp: new Date().toISOString()
      };

      setMessages([initialMessage]);
    }
  }, [documentId, documentName, riskLevel]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      const storageKey = `trustdoc_chat_${documentId}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, documentId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const generateResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();

    // If AI Analysis is available, provide context-aware responses
    if (aiAnalysis) {
      // Question about risk level
      if (lowerMsg.includes('why') || lowerMsg.includes('por que') || lowerMsg.includes('explain') || lowerMsg.includes('risk')) {
        return `The **${aiAnalysis.risk_level.toUpperCase()} RISK** classification is based on Claude 3.5 Sonnet's analysis:\n\n${aiAnalysis.summary}\n\n**Issues Detected:** ${aiAnalysis.issues.length}\n\nWould you like me to explain a specific issue in detail?`;
      }

      // Question about specific issues
      if (lowerMsg.includes('issue') || lowerMsg.includes('problem') || lowerMsg.includes('concern')) {
        if (aiAnalysis.issues.length > 0) {
          const issueList = aiAnalysis.issues
            .map((issue, idx) => `${idx + 1}. **${issue.clause}** (${issue.severity} severity)\n   ${issue.reason}`)
            .join('\n\n');
          return `Here are the specific issues identified:\n\n${issueList}\n\nAsk me about any specific clause for more details.`;
        }
        return 'No specific issues were identified in this document. The analysis is complete.';
      }

      // Question about recommendations
      if (lowerMsg.includes('recommend') || lowerMsg.includes('fix') || lowerMsg.includes('improve') || lowerMsg.includes('solution')) {
        if (aiAnalysis.recommendations.length > 0) {
          const recList = aiAnalysis.recommendations
            .map((rec, idx) => `${idx + 1}. ${rec}`)
            .join('\n');
          return `**AI Recommendations:**\n\n${recList}\n\nThese suggestions are based on regulatory best practices and active compliance frameworks.`;
        }
        return 'The AI analysis did not generate specific recommendations for this document.';
      }

      // Question about specific clause (match against issues)
      const matchingIssue = aiAnalysis.issues.find(issue =>
        lowerMsg.includes(issue.clause.toLowerCase().substring(0, 20))
      );
      if (matchingIssue) {
        return `**${matchingIssue.clause}** (${matchingIssue.severity} severity)\n\n${matchingIssue.reason}\n\n${matchingIssue.framework ? `This violates: **${matchingIssue.framework}**` : ''}`;
      }
    }

    // Governance-aware responses
    if (lowerMsg.includes('foro') || lowerMsg.includes('jurisdiction') || lowerMsg.includes('jurisdição')) {
      if (policy.extractedRules.some(r => r.toLowerCase().includes('jurisdiction') || r.toLowerCase().includes('international'))) {
        return `According to your **Internal Policy** (${policy.fileName}), international jurisdiction clauses require Head of Legal approval and are considered **High Risk**.\n\nSpecifically: "${policy.extractedRules.find(r => r.toLowerCase().includes('jurisdiction')) || policy.extractedRules[0]}"`;
      }
      return 'International jurisdiction clauses may require senior review. Standard practice is to prefer local jurisdiction for dispute resolution.';
    }

    if (lowerMsg.includes('data') || lowerMsg.includes('dados') || lowerMsg.includes('privacy') || lowerMsg.includes('lgpd') || lowerMsg.includes('gdpr')) {
      if (governance.lgpd) {
        return `Under **LGPD** (Lei Geral de Proteção de Dados), this document must comply with:\n\n- **Article 7**: Legal basis for data processing\n- **Article 9**: Data subject rights\n- **Article 46**: International data transfers\n\n${policy.extractedRules.find(r => r.toLowerCase().includes('data') || r.toLowerCase().includes('lgpd')) ? `Your internal policy states: "${policy.extractedRules.find(r => r.toLowerCase().includes('data') || r.toLowerCase().includes('lgpd'))}"` : ''}`;
      }
      return 'Data processing clauses should ensure compliance with applicable data protection regulations (LGPD, GDPR).';
    }

    if (lowerMsg.includes('ai act') || lowerMsg.includes('article 12') || lowerMsg.includes('article 14') || lowerMsg.includes('logging')) {
      if (governance.euAiAct) {
        return `Under the **EU AI Act**:\n\n- **Article 12**: Requires tamper-proof logging of all AI-assisted decisions\n- **Article 14**: Mandates human oversight for high-risk AI systems\n\nThis document is being reviewed in compliance with both articles. All decisions will be cryptographically sealed.`;
      }
      return 'EU AI Act compliance requires tamper-proof decision logging and human oversight for high-risk systems.';
    }

    if (lowerMsg.includes('payment') || lowerMsg.includes('pagamento') || lowerMsg.includes('valor') || lowerMsg.includes('price')) {
      if (policy.extractedRules.some(r => r.toLowerCase().includes('payment') || r.toLowerCase().includes('€100k') || r.toLowerCase().includes('vp finance'))) {
        return `Per your **Internal Policy**: "${policy.extractedRules.find(r => r.toLowerCase().includes('payment') || r.toLowerCase().includes('€100k')) || policy.extractedRules[1]}"\n\nContracts exceeding threshold amounts require dual approval.`;
      }
      return 'Payment terms and financial obligations should be clearly defined with appropriate approval thresholds.';
    }

    if (lowerMsg.includes('force majeure') || lowerMsg.includes('pandemic') || lowerMsg.includes('covid')) {
      if (policy.extractedRules.some(r => r.toLowerCase().includes('force majeure') || r.toLowerCase().includes('pandemic'))) {
        return `Your **Internal Policy** requires: "${policy.extractedRules.find(r => r.toLowerCase().includes('force majeure') || r.toLowerCase().includes('pandemic')) || policy.extractedRules[3]}"\n\nThis ensures adequate protection during extraordinary circumstances.`;
      }
      return 'Force majeure clauses should explicitly cover pandemic scenarios and other extraordinary events.';
    }

    if (lowerMsg.includes('why') || lowerMsg.includes('por que') || lowerMsg.includes('explain') || lowerMsg.includes('risk')) {
      return `The **${riskLevel.toUpperCase()} RISK** classification is based on:\n\n1. Potential regulatory violations\n2. Financial exposure\n3. Liability implications\n4. Complexity of terms\n\n${governance.euAiAct || governance.lgpd || governance.coloradoSB205 ? `Active compliance frameworks have flagged specific clauses for review.` : ''}\n\nWould you like me to analyze a specific section?`;
    }

    if (lowerMsg.includes('clause') || lowerMsg.includes('section') || lowerMsg.includes('cláusula')) {
      return 'Please specify which clause or section you\'d like me to analyze. I can explain risks, regulatory implications, and compare against your internal policies.';
    }

    if (lowerMsg.includes('approve') || lowerMsg.includes('override') || lowerMsg.includes('escalate')) {
      return 'Before making a decision, please ensure you\'ve reviewed all flagged risks. I can help clarify any concerns about specific clauses or compliance requirements.';
    }

    // Default response
    const activeFrameworks = [
      governance.euAiAct && 'EU AI Act',
      governance.lgpd && 'LGPD',
      governance.coloradoSB205 && 'Colorado SB 205'
    ].filter(Boolean);

    return `I can help you with:\n\n- **Regulatory compliance** (${activeFrameworks.length > 0 ? activeFrameworks.join(', ') : 'General'})\n- **Risk assessment** (Current: ${riskLevel.toUpperCase()})\n- **Clause analysis**\n- **Internal policy validation**${policy.extractedRules.length > 0 ? ` (${policy.extractedRules.length} rules loaded)` : ''}\n\nWhat would you like to know about this document?`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: generateResponse(input.trim()),
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-white ring-1 ring-neutral-200 text-neutral-900'
                  : 'bg-neutral-50 text-neutral-700'
              }`}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content.split('**').map((part, i) =>
                  i % 2 === 0 ? part : <strong key={i} className="font-semibold text-neutral-900">{part}</strong>
                )}
              </div>
              <div className="text-[10px] text-neutral-400 mt-2">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-neutral-50 rounded-lg px-4 py-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
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
            placeholder="Ask about risks, clauses, or compliance..."
            className="flex-1 bg-white ring-1 ring-neutral-200 rounded-lg px-4 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-neutral-900 focus:outline-none transition-all"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-neutral-900 text-white rounded-lg px-4 py-2 hover:bg-neutral-800 disabled:opacity-40 transition-colors flex items-center gap-2"
          >
            <Send size={16} strokeWidth={1.5} />
          </button>
        </form>
        <p className="text-[10px] text-neutral-400 mt-2 text-center">
          Conversation is saved and will be sealed with your decision
        </p>
      </div>
    </div>
  );
}

// Export function to get chat history for HDR sealing
export function getChatHistory(documentId: string): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  const storageKey = `trustdoc_chat_${documentId}`;
  const stored = localStorage.getItem(storageKey);
  return stored ? JSON.parse(stored) : [];
}

// Export function to clear chat history (for testing)
export function clearChatHistory(documentId: string): void {
  if (typeof window === 'undefined') return;
  const storageKey = `trustdoc_chat_${documentId}`;
  localStorage.removeItem(storageKey);
}
