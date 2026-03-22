/**
 * TrustDoc Unified Gemini API
 * Handles both initial compliance analysis and continuous chat interaction
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: string;
}

export interface GeminiRequest {
  documentText: string;
  documentName: string;
  activeFrameworks: {
    euAiAct: boolean;
    lgpd: boolean;
    coloradoSB205: boolean;
  };
  internalPolicyRules?: string[];
  chatHistory: GeminiMessage[];
  userMessage?: string;
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const body: GeminiRequest = await req.json();
    const {
      documentText,
      documentName,
      activeFrameworks,
      internalPolicyRules,
      chatHistory,
      userMessage,
    } = body;

    // Validate API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build system instruction based on active frameworks
    const systemInstruction = buildSystemInstruction(
      activeFrameworks,
      internalPolicyRules
    );

    // Initialize Gemini with system instruction
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096,
      },
    });

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // First turn (empty history) = Automatic Compliance Assessment
          if (chatHistory.length === 0 && !userMessage) {
            const analysisPrompt = `Analyze the following contract for compliance risks:

---
Document: ${documentName}
---

${documentText}

---

Provide a comprehensive compliance assessment with:

1. **RISK LEVEL** (LOW/MEDIUM/HIGH)
2. **EXECUTIVE SUMMARY** (2-3 sentences)
3. **CRITICAL CLAUSES** - List specific clause numbers with violations
4. **RECOMMENDATIONS** - Actionable next steps

Always cite specific clause numbers (e.g., "Conforme a Cláusula 10.3...") for easy human verification.`;

            const result = await model.generateContentStream(analysisPrompt);

            for await (const chunk of result.stream) {
              const text = chunk.text();
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'content', text })}\n\n`)
              );
            }

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
            );
          }
          // Continuous chat with context
          else {
            // ✅ VALIDATION: Filter out empty messages
            const validHistory = chatHistory.filter(
              (msg) => msg.parts && typeof msg.parts === 'string' && msg.parts.trim().length > 0
            );

            // ✅ OPTIMIZATION: Limit history to last 20 messages to avoid token limits
            const recentHistory = validHistory.slice(-20);

            // ✅ CRITICAL FIX: Sanitize history to prevent role: "model" at start
            let sanitizedHistory = recentHistory.map((msg) => ({
              role: msg.role,
              parts: [{ text: msg.parts }],
            }));

            // Gemini API crashes if history starts with role: "model"
            if (sanitizedHistory.length > 0 && sanitizedHistory[0].role === 'model') {
              console.log('⚠️ Fixing invalid history: prepending synthetic user message');
              sanitizedHistory.unshift({
                role: 'user',
                parts: [{ text: 'Please provide the initial compliance analysis.' }],
              });
            }

            console.log('📋 Chat history sanitized:', {
              length: sanitizedHistory.length,
              firstRole: sanitizedHistory[0]?.role,
              lastRole: sanitizedHistory[sanitizedHistory.length - 1]?.role,
            });

            // Start chat session with sanitized history
            const chat = model.startChat({
              history: sanitizedHistory,
            });

            // ✅ VALIDATION: Ensure userMessage is not empty
            if (!userMessage || userMessage.trim().length === 0) {
              throw new Error('Empty message received');
            }

            // Add document context to first user message if needed
            const messageWithContext =
              chatHistory.length === 0 && userMessage
                ? `Document being analyzed: ${documentName}\n\n${documentText.slice(0, 5000)}\n\n---\n\nUser question: ${userMessage}`
                : userMessage;

            const result = await chat.sendMessageStream(messageWithContext);

            for await (const chunk of result.stream) {
              const text = chunk.text();
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'content', text })}\n\n`)
              );
            }

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
            );
          }

          controller.close();
        } catch (error: any) {
          console.error('Gemini streaming error:', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return new Response(
      JSON.stringify({
        error: 'AI analysis failed',
        details: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Build system instruction based on active compliance frameworks
 */
function buildSystemInstruction(
  frameworks: { euAiAct: boolean; lgpd: boolean; coloradoSB205: boolean },
  internalPolicyRules?: string[]
): string {
  let instruction = `You are a Senior Compliance Director with expertise in contract law and regulatory compliance.

**Your Core Mission:**
- Provide rigorous legal analysis with specific clause references
- Cross-reference against active regulatory frameworks
- Cite exact clause numbers (e.g., "Conforme a Cláusula 10.3...")
- Flag compliance violations and liability risks
- Provide actionable, specific recommendations

**Active Regulatory Frameworks:**
`;

  if (frameworks.euAiAct) {
    instruction += `
- **EU AI Act (2024)**: Focus on Article 12 (tamper-proof logging), Article 14 (human oversight), Article 52 (transparency). Flag AI decisions without audit trails.
`;
  }

  if (frameworks.lgpd) {
    instruction += `
- **LGPD (Lei Geral de Proteção de Dados)**: Focus on Article 7 (legal basis), Article 9 (data subject rights), Article 46 (international transfers). Flag data processing without proper consent.
`;
  }

  if (frameworks.coloradoSB205) {
    instruction += `
- **Colorado SB 205**: Focus on algorithmic impact assessments, consumer rights, discriminatory AI use cases.
`;
  }

  if (!frameworks.euAiAct && !frameworks.lgpd && !frameworks.coloradoSB205) {
    instruction += `
- **General Best Practices**: Contract law principles, liability clauses, payment terms, jurisdiction, force majeure.
`;
  }

  if (internalPolicyRules && internalPolicyRules.length > 0) {
    instruction += `\n**Internal Company Policies (WORM Ledger):**\n`;
    internalPolicyRules.forEach((rule, index) => {
      instruction += `${index + 1}. ${rule}\n`;
    });
  }

  instruction += `\n**Communication Style:**
- Be direct, specific, and professional
- Always cite clause numbers for verification
- Focus on real risks, not theoretical concerns
- Provide step-by-step recommendations
- Use clear formatting (bold for emphasis)

**MANDATORY OUTPUT FORMAT:**
- Start responses with clear section headers using ### markdown
- For regulatory compliance issues, ALWAYS use: ### ⚖️ Regulatory Compliance
- For recommendations, use: ### 💡 Recommendations
- For risk analysis, use: ### ⚠️ Risk Assessment
- Use numbered lists (1., 2., 3.) for actionable items
- Use bold (**text**) for key terms and clause references
- Example: "**Cláusula 10.3** violates **LGPD Article 7** due to..."
`;

  return instruction;
}
