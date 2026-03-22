/**
 * TrustDoc AI Analysis API
 * Google Gemini Document Compliance Analysis
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface AnalyzeRequest {
  documentText: string;
  documentName: string;
  activeFrameworks: {
    euAiAct: boolean;
    lgpd: boolean;
    coloradoSB205: boolean;
  };
  internalPolicyRules?: string[];
}

export interface AnalyzeResponse {
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

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRequest = await req.json();
    const { documentText, documentName, activeFrameworks, internalPolicyRules } = body;

    // Validate input
    if (!documentText || !documentName) {
      return NextResponse.json(
        { error: 'Missing required fields: documentText, documentName' },
        { status: 400 }
      );
    }

    // DEBUG: Check API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found in environment variables!');
      return NextResponse.json(
        { error: 'API key not configured. Get free key at: https://aistudio.google.com/app/apikey' },
        { status: 500 }
      );
    }
    console.log('🔑 Gemini API Key detected:', apiKey.substring(0, 15) + '...' + apiKey.slice(-4));

    // Build system prompt based on active frameworks
    const systemPrompt = buildSystemPrompt(activeFrameworks, internalPolicyRules);

    console.log('🧠 Google Gemini analyzing document:', documentName);
    console.log('📋 Active frameworks:', Object.entries(activeFrameworks).filter(([_, v]) => v).map(([k]) => k).join(', '));

    // Call Google Gemini
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      }
    });

    const prompt = `${systemPrompt}\n\nAnalyze the following contract for compliance risks:\n\n---\nDocument: ${documentName}\n---\n\n${documentText}\n\n---\n\nProvide your analysis in valid JSON format only, with no markdown formatting.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Remove markdown code blocks if present
    const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let analysisResult: AnalyzeResponse;

    try {
      analysisResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response as JSON:', parseError);
      console.error('Raw response:', responseText);

      // Fallback: return error with partial data
      return NextResponse.json(
        {
          error: 'AI response parsing failed',
          raw_response: responseText,
        },
        { status: 500 }
      );
    }

    console.log('✅ Analysis complete. Risk level:', analysisResult.risk_level);
    console.log('📊 Issues found:', analysisResult.issues?.length || 0);

    return NextResponse.json(analysisResult);
  } catch (error: any) {
    console.error('❌ Gemini API Error:', error);
    console.error('❌ Error status:', error.status);
    console.error('❌ Error message:', error.message);
    console.error('❌ Full error object:', JSON.stringify(error, null, 2));

    // Handle specific Gemini errors
    if (error.status === 400) {
      const errorMessage = error.message || error.error?.message || 'Bad request';
      console.error('❌ 400 Error details:', errorMessage);

      return NextResponse.json(
        { error: 'Invalid request to Gemini API', details: errorMessage },
        { status: 400 }
      );
    }

    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key. Get free key at: https://aistudio.google.com/app/apikey' },
        { status: 401 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a moment.' },
        { status: 429 }
      );
    }

    if (error.status === 500) {
      return NextResponse.json(
        { error: 'Gemini API service error. Please try again later.' },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'AI analysis failed',
        details: error.message || 'Unknown error',
        status: error.status || 'unknown',
      },
      { status: 500 }
    );
  }
}

/**
 * Build system prompt based on active compliance frameworks
 */
function buildSystemPrompt(
  frameworks: { euAiAct: boolean; lgpd: boolean; coloradoSB205: boolean },
  internalPolicyRules?: string[]
): string {
  let prompt = `You are a Senior Compliance Director with expertise in contract law and regulatory compliance. Your mission is to analyze contracts for legal and regulatory risks.

**Your Analysis Methodology:**
1. Read the entire document carefully
2. Identify specific clauses that pose compliance risks
3. Cross-reference against active regulatory frameworks
4. Assess severity and potential impact
5. Provide actionable recommendations

**Active Regulatory Frameworks:**
`;

  if (frameworks.euAiAct) {
    prompt += `
- **EU AI Act (2024)**: Focus on Article 12 (logging requirements) and Article 14 (human oversight). Flag any AI-related decisions without proper audit trails.
`;
  }

  if (frameworks.lgpd) {
    prompt += `
- **LGPD (Lei Geral de Proteção de Dados)**: Focus on Article 7 (legal basis), Article 9 (data subject rights), Article 46 (international transfers). Flag any data processing without proper consent or legal basis.
`;
  }

  if (frameworks.coloradoSB205) {
    prompt += `
- **Colorado SB 205 (AI Transparency)**: Focus on algorithmic impact assessments and consumer rights. Flag any discriminatory AI use cases.
`;
  }

  if (!frameworks.euAiAct && !frameworks.lgpd && !frameworks.coloradoSB205) {
    prompt += `
- **General Best Practices**: Focus on standard contract law principles, liability clauses, payment terms, jurisdiction, and force majeure.
`;
  }

  if (internalPolicyRules && internalPolicyRules.length > 0) {
    prompt += `\n**Internal Company Policies:**\n`;
    internalPolicyRules.forEach((rule, index) => {
      prompt += `${index + 1}. ${rule}\n`;
    });
  }

  prompt += `\n**Output Format:**
Respond ONLY with valid JSON (no markdown formatting). Use this exact structure:

{
  "risk_level": "low" | "medium" | "high",
  "summary": "2-3 sentence executive summary of key risks",
  "issues": [
    {
      "clause": "Specific clause text or section reference",
      "reason": "Detailed explanation of why this is a risk",
      "severity": "low" | "medium" | "high",
      "framework": "Which framework/policy this violates (optional)"
    }
  ],
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2"
  ]
}

**Risk Level Guidelines:**
- **HIGH**: Clear regulatory violations, significant liability exposure, or major financial risk
- **MEDIUM**: Potential compliance issues, unclear terms, or moderate risk exposure
- **LOW**: Minor concerns, standard terms with room for improvement

Be specific, actionable, and professional. Focus on real risks, not theoretical concerns.`;

  return prompt;
}
