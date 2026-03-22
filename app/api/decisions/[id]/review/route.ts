/**
 * TrustDoc Decision Review (Seal) API
 * POST /api/decisions/:id/review — Seal a decision with certificate and WORM hash
 * Phase 1C: Triggers non-blocking email notification via Resend
 */

import { NextRequest, NextResponse } from 'next/server';
import { notifyDecisionSealed } from '@/lib/email.service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const {
      document_name,
      decision,
      reviewer_name,
      certificate_status,
      worm_hash,
      sealed_at,
    } = body;

    // Validate required fields
    if (!document_name || !decision || !reviewer_name || !certificate_status || !worm_hash) {
      return NextResponse.json(
        { error: 'Missing required fields: document_name, decision, reviewer_name, certificate_status, worm_hash' },
        { status: 400 }
      );
    }

    if (!['APPROVE', 'OVERRIDE', 'ESCALATE'].includes(decision)) {
      return NextResponse.json(
        { error: 'Invalid decision. Must be APPROVE, OVERRIDE, or ESCALATE' },
        { status: 400 }
      );
    }

    const sealedTimestamp = sealed_at || new Date().toISOString();

    // Fire-and-forget email notification (non-blocking)
    notifyDecisionSealed({
      hdr_id: id,
      document_name,
      decision,
      reviewer_name,
      certificate_status,
      worm_hash,
      sealed_at: sealedTimestamp,
    });

    return NextResponse.json({
      success: true,
      hdr_id: id,
      certificate_status,
      worm_hash,
      sealed_at: sealedTimestamp,
      email_notification: 'queued',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[api/decisions/review] POST error:', message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
