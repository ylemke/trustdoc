/**
 * TrustDoc Email Notification Service
 * Phase 1C: Non-blocking email notifications via Resend
 */

import { Resend } from 'resend';

// Lazy-initialize Resend so module load doesn't throw at build time when env vars are absent
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM || 'noreply@trustdoc.dev';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'TrustDoc Compliance';
const EMAIL_FROM = `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`;
const COMPLIANCE_EMAIL = process.env.COMPLIANCE_EMAIL || '';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export interface DecisionEmailPayload {
  hdr_id: string;
  document_name: string;
  decision: 'APPROVE' | 'OVERRIDE' | 'ESCALATE';
  reviewer_name: string;
  reviewer_email: string;
  decision_note?: string;
  use_case_type?: string;
}

export interface SealedEmailPayload {
  hdr_id: string;
  document_name: string;
  decision: 'APPROVE' | 'OVERRIDE' | 'ESCALATE';
  reviewer_name: string;
  certificate_status: string;
  worm_hash: string;
  sealed_at: string;
}

/**
 * Send email notification when a new decision is created.
 * Fire-and-forget: does not block the API response.
 */
export function notifyNewDecision(payload: DecisionEmailPayload): void {
  if (!COMPLIANCE_EMAIL) {
    console.warn('[email] COMPLIANCE_EMAIL not configured, skipping notification');
    return;
  }

  const decisionLabel =
    payload.decision === 'APPROVE' ? 'Approved' :
    payload.decision === 'OVERRIDE' ? 'Overridden' :
    'Escalated';

  const resend = getResend();
  if (!resend) { console.warn('[email] RESEND_API_KEY not configured, skipping notification'); return; }

  resend.emails.send({
    from: EMAIL_FROM,
    to: COMPLIANCE_EMAIL,
    subject: `New Decision: ${payload.document_name} - ${decisionLabel}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0f172a; color: white; padding: 24px 32px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 600;">TrustDoc - New Decision Recorded</h1>
        </div>
        <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 140px;">Document:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 500;">${escapeHtml(payload.document_name)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Decision:</td>
              <td style="padding: 8px 0;">
                <span style="display: inline-block; padding: 2px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; ${
                  payload.decision === 'APPROVE'
                    ? 'background: #d1fae5; color: #065f46;'
                    : payload.decision === 'OVERRIDE'
                    ? 'background: #fef3c7; color: #92400e;'
                    : 'background: #ffe4e6; color: #9f1239;'
                }">${decisionLabel}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Reviewer:</td>
              <td style="padding: 8px 0; color: #0f172a;">${escapeHtml(payload.reviewer_name)} (${escapeHtml(payload.reviewer_email)})</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">HDR ID:</td>
              <td style="padding: 8px 0; color: #0f172a; font-family: monospace; font-size: 12px;">${escapeHtml(payload.hdr_id)}</td>
            </tr>
            ${payload.decision_note ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b; vertical-align: top;">Note:</td>
              <td style="padding: 8px 0; color: #0f172a;">${escapeHtml(payload.decision_note)}</td>
            </tr>
            ` : ''}
          </table>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <a href="${APP_URL}/dashboard" style="display: inline-block; padding: 10px 24px; background: #0f172a; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">
              View in Dashboard
            </a>
          </div>
          <p style="margin-top: 16px; font-size: 11px; color: #94a3b8;">
            This is an automated notification from TrustDoc compliance system.
          </p>
        </div>
      </div>
    `,
  }).catch(err => {
    console.error('[email] Failed to send new decision notification:', err);
  });
}

/**
 * Send email notification when a decision is sealed with certificate.
 * Fire-and-forget: does not block the API response.
 */
export function notifyDecisionSealed(payload: SealedEmailPayload): void {
  if (!COMPLIANCE_EMAIL) {
    console.warn('[email] COMPLIANCE_EMAIL not configured, skipping notification');
    return;
  }

  const decisionLabel =
    payload.decision === 'APPROVE' ? 'Approved' :
    payload.decision === 'OVERRIDE' ? 'Overridden' :
    'Escalated';

  const resend = getResend();
  if (!resend) { console.warn('[email] RESEND_API_KEY not configured, skipping notification'); return; }

  resend.emails.send({
    from: EMAIL_FROM,
    to: COMPLIANCE_EMAIL,
    subject: `Decision Sealed: ${payload.document_name} - ${payload.certificate_status}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0f172a; color: white; padding: 24px 32px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 600;">TrustDoc - Decision Sealed</h1>
        </div>
        <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px; color: #166534; font-weight: 600;">
              Record has been cryptographically sealed and anchored to the WORM Ledger.
            </p>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 140px;">Document:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 500;">${escapeHtml(payload.document_name)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Decision:</td>
              <td style="padding: 8px 0;">
                <span style="display: inline-block; padding: 2px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; ${
                  payload.decision === 'APPROVE'
                    ? 'background: #d1fae5; color: #065f46;'
                    : payload.decision === 'OVERRIDE'
                    ? 'background: #fef3c7; color: #92400e;'
                    : 'background: #ffe4e6; color: #9f1239;'
                }">${decisionLabel}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Certificate:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 500;">${escapeHtml(payload.certificate_status)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">WORM Hash:</td>
              <td style="padding: 8px 0; color: #0f172a; font-family: monospace; font-size: 11px; word-break: break-all;">${escapeHtml(payload.worm_hash)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Sealed At:</td>
              <td style="padding: 8px 0; color: #0f172a;">${escapeHtml(payload.sealed_at)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Reviewer:</td>
              <td style="padding: 8px 0; color: #0f172a;">${escapeHtml(payload.reviewer_name)}</td>
            </tr>
          </table>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <a href="${APP_URL}/dashboard" style="display: inline-block; padding: 10px 24px; background: #0f172a; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">
              View in Dashboard
            </a>
          </div>
          <p style="margin-top: 16px; font-size: 11px; color: #94a3b8;">
            This is an automated notification from TrustDoc compliance system.
          </p>
        </div>
      </div>
    `,
  }).catch(err => {
    console.error('[email] Failed to send sealed decision notification:', err);
  });
}

/**
 * Escape HTML special characters to prevent XSS in emails
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
