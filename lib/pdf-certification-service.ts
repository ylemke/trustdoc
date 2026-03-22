/**
 * PDF Certification Service
 * Generates "Documento de Fé Pública" - Official Certified Documents
 * Combines original PDF + certification overlay + Certificate of Authenticity
 */

import type { HDRRecord } from './store';

export interface CertifiedPDFOptions {
  hdrRecord: HDRRecord;
  originalDocumentUrl: string;
  reviewerName: string;
  reviewerRole: string;
  verificationUrl: string;
}

/**
 * Generate certified PDF metadata for watermarking
 * Returns the text to be overlaid on each page
 */
export function generateCertificationWatermark(ledgerId: string): string {
  return `TrustDoc Certified - ID: ${ledgerId} | Verification: trustdoc.dev/verify`;
}

/**
 * Generate Certificate of Authenticity page data
 * This will be the final page of the certified PDF
 */
export function generateCertificateOfAuthenticity(options: CertifiedPDFOptions) {
  const { hdrRecord, reviewerName, reviewerRole, verificationUrl } = options;

  return {
    title: 'Cryptographic Certificate of Authenticity',
    ledgerId: hdrRecord.ledger_id || '',
    documentName: hdrRecord.document_name,
    sealedDate: hdrRecord.sealed_at || hdrRecord.created_at,
    recordHash: hdrRecord.record_hash,
    reviewedBy: {
      name: reviewerName,
      role: reviewerRole,
      email: hdrRecord.reviewer_email,
    },
    decision: hdrRecord.decision,
    verificationUrl,
    frameworks: hdrRecord.governance_context?.frameworks || [],
    qrCodeData: verificationUrl,
  };
}

/**
 * Prepare certified PDF for DocuSign dispatch
 * In production, this would:
 * 1. Fetch original PDF from storage
 * 2. Use PDF manipulation library (pdf-lib) to overlay certification marks
 * 3. Append Certificate of Authenticity page
 * 4. Return base64 or blob for API upload
 */
export async function prepareCertifiedPDFForDocuSign(
  options: CertifiedPDFOptions
): Promise<{
  pdfBlob: Blob | null;
  certificationData: ReturnType<typeof generateCertificateOfAuthenticity>;
  watermarkText: string;
}> {
  const watermarkText = generateCertificationWatermark(options.hdrRecord.ledger_id || '');
  const certificationData = generateCertificateOfAuthenticity(options);

  // Simulate PDF generation (2 second delay)
  console.log('📄 Generating Certified PDF with:', {
    watermarkText,
    certificationData,
    originalUrl: options.originalDocumentUrl,
  });

  await new Promise((resolve) => setTimeout(resolve, 2000));

  // In production, this would return actual PDF blob
  // For demo, return null and metadata
  return {
    pdfBlob: null, // Would be actual PDF blob in production
    certificationData,
    watermarkText,
  };
}

/**
 * Get certification status badge styling
 */
export function getCertificationStatusBadge(status: HDRRecord['decision']) {
  switch (status) {
    case 'APPROVE':
      return {
        label: 'APPROVED',
        className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        icon: '✅',
      };
    case 'OVERRIDE':
      return {
        label: 'OVERRIDDEN',
        className: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        icon: '⚠️',
      };
    case 'ESCALATE':
      return {
        label: 'ESCALATED',
        className: 'bg-rose-50 text-rose-700 ring-rose-600/20',
        icon: '🚨',
      };
    default:
      return {
        label: 'PENDING',
        className: 'bg-neutral-50 text-neutral-700 ring-neutral-600/20',
        icon: '⏳',
      };
  }
}
