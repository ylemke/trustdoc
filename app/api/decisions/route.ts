/**
 * TrustDoc Decisions API
 *
 * GET  /api/decisions — Returns all webhook-created decision records.
 *   ?source=feedzai|sumsub|generic
 *   ?limit=N (default 100)
 *
 * POST /api/decisions — Create a new decision record.
 *   Phase 1C: Triggers non-blocking email notification via Resend.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllDecisions, getAllAuditLogs } from '../../../lib/webhook-store';
import { notifyNewDecision } from '@/lib/email.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get('source');
  const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10) || 100, 500);

  let decisions = getAllDecisions();

  if (source) {
    decisions = decisions.filter(d => d.source === source);
  }

  decisions = decisions.slice(0, limit);

  return NextResponse.json({
    count: decisions.length,
    decisions,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      hdr_id,
      document_name,
      decision,
      reviewer_name,
      reviewer_email,
      decision_note,
      use_case_type,
    } = body;

    // Validate required fields
    if (!hdr_id || !document_name || !decision || !reviewer_name || !reviewer_email) {
      return NextResponse.json(
        { error: 'Missing required fields: hdr_id, document_name, decision, reviewer_name, reviewer_email' },
        { status: 400 }
      );
    }

    if (!['APPROVE', 'OVERRIDE', 'ESCALATE'].includes(decision)) {
      return NextResponse.json(
        { error: 'Invalid decision. Must be APPROVE, OVERRIDE, or ESCALATE' },
        { status: 400 }
      );
    }

    // Fire-and-forget email notification (non-blocking)
    notifyNewDecision({
      hdr_id,
      document_name,
      decision,
      reviewer_name,
      reviewer_email,
      decision_note,
      use_case_type,
    });

    return NextResponse.json({
      success: true,
      hdr_id,
      decision,
      email_notification: 'queued',
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[api/decisions] POST error:', message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
