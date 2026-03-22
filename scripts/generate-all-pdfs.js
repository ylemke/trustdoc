const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// All 15 documents from mock-documents.ts
const documents = [
  { id: 'doc_001', name: 'Master Service Agreement - TechCorp', type: 'agreement', risk: 'high' },
  { id: 'doc_002', name: 'Non-Disclosure Agreement - Vendor Due Diligence', type: 'nda', risk: 'medium' },
  { id: 'doc_003', name: 'Employment Contract - Senior Engineer (EU)', type: 'contract', risk: 'low' },
  { id: 'doc_004', name: 'Software License Agreement - Enterprise SaaS', type: 'agreement', risk: 'high' },
  { id: 'doc_005', name: 'Real Estate Lease - Office Space Downtown', type: 'agreement', risk: 'medium' },
  { id: 'doc_006', name: 'Partnership Agreement - Joint Venture Formation', type: 'agreement', risk: 'high' },
  { id: 'doc_007', name: 'Terms of Service - Consumer Platform (GDPR Update)', type: 'terms', risk: 'medium' },
  { id: 'doc_008', name: 'Settlement Agreement - Employment Dispute', type: 'agreement', risk: 'medium' },
  { id: 'doc_009', name: 'Acquisition Agreement - Asset Purchase (Tech Startup)', type: 'agreement', risk: 'high' },
  { id: 'doc_010', name: 'Consulting Agreement - Fractional CFO Services', type: 'agreement', risk: 'low' },
  { id: 'doc_011', name: 'API License Agreement - Third-Party Integration', type: 'agreement', risk: 'medium' },
  { id: 'doc_012', name: 'Franchise Agreement - Multi-Unit Development', type: 'agreement', risk: 'high' },
  { id: 'doc_013', name: 'Amendment No 3 - Cloud Services Agreement', type: 'amendment', risk: 'low' },
  { id: 'doc_014', name: 'Privacy Policy - Mobile App (California CCPA)', type: 'policy', risk: 'medium' },
  { id: 'doc_015', name: 'Supplier Agreement - Manufacturing Contract (Asia)', type: 'agreement', risk: 'high' }
];

// Sample legal content by type
const contentTemplates = {
  agreement: {
    sections: [
      { title: '1. PARTIES AND EFFECTIVE DATE', text: 'This Agreement is entered into as of the Effective Date by and between the parties identified above. Each party represents that it has full authority to enter into this Agreement and perform its obligations hereunder.' },
      { title: '2. SCOPE OF SERVICES', text: 'The service provider agrees to provide the services as described in Exhibit A attached hereto and incorporated by reference. Services shall be performed in a professional and workmanlike manner consistent with industry standards.' },
      { title: '3. TERM AND TERMINATION', text: 'This Agreement shall commence on the Effective Date and continue for an initial term as specified. Either party may terminate this Agreement upon written notice in accordance with the terms set forth herein. Upon termination, all accrued obligations shall survive.' },
      { title: '4. COMPENSATION AND PAYMENT', text: 'In consideration for the services provided, Client shall pay Service Provider the fees set forth in the attached fee schedule. Payment shall be made within thirty (30) days of invoice date. Late payments shall accrue interest at the maximum rate permitted by law.' },
      { title: '5. CONFIDENTIALITY', text: 'Each party acknowledges that it may receive confidential and proprietary information from the other party. Such information shall be held in strict confidence and not disclosed to third parties without prior written consent.' },
      { title: '6. INTELLECTUAL PROPERTY', text: 'All intellectual property created in connection with this Agreement shall be owned as specified herein. Each party retains ownership of its pre-existing intellectual property and grants licenses only as expressly stated.' },
      { title: '7. WARRANTIES AND REPRESENTATIONS', text: 'Each party represents and warrants that it has the full right, power, and authority to enter into this Agreement and perform its obligations. Service Provider warrants that services will be performed in a professional manner.' },
      { title: '8. LIMITATION OF LIABILITY', text: 'IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. The total liability of either party shall not exceed the amounts paid under this Agreement in the twelve months preceding the claim.' },
      { title: '9. INDEMNIFICATION', text: 'Each party agrees to indemnify, defend, and hold harmless the other party from and against any claims, damages, losses, and expenses arising from its breach of this Agreement or violation of applicable law.' },
      { title: '10. GENERAL PROVISIONS', text: 'This Agreement constitutes the entire agreement between the parties and supersedes all prior agreements. This Agreement may only be amended in writing signed by both parties. If any provision is found unenforceable, the remainder shall continue in full force and effect.' }
    ]
  },
  nda: {
    sections: [
      { title: '1. PURPOSE', text: 'The parties wish to explore a potential business relationship and in connection therewith, may disclose certain confidential and proprietary information to each other.' },
      { title: '2. DEFINITION OF CONFIDENTIAL INFORMATION', text: 'Confidential Information means any information disclosed by one party to the other, whether orally, in writing, or by any other means, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and circumstances of disclosure.' },
      { title: '3. OBLIGATIONS', text: 'The Receiving Party agrees to: (a) hold all Confidential Information in strict confidence; (b) not disclose such information to third parties without prior written consent; (c) use such information solely for the purposes contemplated; and (d) protect such information with at least the same degree of care used to protect its own confidential information.' },
      { title: '4. EXCLUSIONS', text: 'Confidential Information does not include information that: (a) is or becomes publicly available through no breach of this Agreement; (b) was rightfully in the possession of the Receiving Party prior to disclosure; (c) is received from a third party without breach of any confidentiality obligation; or (d) is independently developed without use of the Confidential Information.' },
      { title: '5. TERM', text: 'This Agreement shall remain in effect for a period of two (2) years from the Effective Date. The obligations of confidentiality shall survive for a period of five (5) years from the date of disclosure of any Confidential Information.' },
      { title: '6. RETURN OF MATERIALS', text: 'Upon termination of this Agreement or upon request, the Receiving Party shall promptly return or destroy all documents and materials containing Confidential Information and certify in writing that it has done so.' }
    ]
  },
  contract: {
    sections: [
      { title: '1. POSITION AND DUTIES', text: 'Employee is employed in the position specified and shall perform the duties assigned by the Employer. Employee agrees to devote their full business time and best efforts to the performance of such duties.' },
      { title: '2. COMPENSATION', text: 'As compensation for services rendered, Employee shall receive a base salary as set forth herein, payable in accordance with Employer\'s standard payroll practices. Salary will be reviewed annually and may be adjusted at Employer\'s discretion.' },
      { title: '3. BENEFITS', text: 'Employee shall be entitled to participate in all employee benefit plans and programs made available by Employer to its employees, subject to the terms and conditions of such plans.' },
      { title: '4. TERM AND TERMINATION', text: 'Employment under this Agreement shall commence on the Start Date and continue until terminated by either party in accordance with the provisions herein. Either party may terminate employment with appropriate notice as specified.' },
      { title: '5. CONFIDENTIAL INFORMATION', text: 'Employee acknowledges that during employment they will have access to and become acquainted with confidential information. Employee agrees to keep such information confidential both during and after employment.' },
      { title: '6. INTELLECTUAL PROPERTY', text: 'All inventions, discoveries, and creative works conceived or developed by Employee during employment that relate to Employer\'s business shall be the exclusive property of Employer.' },
      { title: '7. NON-COMPETITION', text: 'During employment and for a reasonable period thereafter, Employee agrees not to engage in any business activity that directly competes with Employer\'s business in the geographic areas where Employer operates.' },
      { title: '8. GOVERNING LAW', text: 'This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction specified, without regard to its conflict of law provisions.' }
    ]
  },
  terms: {
    sections: [
      { title: '1. ACCEPTANCE OF TERMS', text: 'By accessing or using our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the services.' },
      { title: '2. DESCRIPTION OF SERVICES', text: 'We provide online services as described on our platform. We reserve the right to modify, suspend, or discontinue any aspect of the services at any time without notice.' },
      { title: '3. USER ACCOUNTS', text: 'To access certain features, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.' },
      { title: '4. USER CONDUCT', text: 'You agree not to use the services for any unlawful purpose or in any way that could damage, disable, or impair the services. Prohibited activities include but are not limited to unauthorized access, data mining, and distribution of malicious code.' },
      { title: '5. INTELLECTUAL PROPERTY', text: 'All content and materials available through the services are protected by intellectual property rights. You may not copy, reproduce, distribute, or create derivative works without our express written permission.' },
      { title: '6. PRIVACY AND DATA PROTECTION', text: 'Your use of the services is subject to our Privacy Policy, which describes how we collect, use, and protect your personal information. We comply with applicable data protection laws including GDPR and CCPA.' },
      { title: '7. DISCLAIMERS', text: 'THE SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.' },
      { title: '8. LIMITATION OF LIABILITY', text: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICES.' },
      { title: '9. CHANGES TO TERMS', text: 'We reserve the right to modify these Terms of Service at any time. We will notify you of material changes by posting the updated terms on our platform. Your continued use constitutes acceptance of the modified terms.' }
    ]
  },
  policy: {
    sections: [
      { title: '1. INTRODUCTION', text: 'This Policy describes how we collect, use, disclose, and protect your personal information. We are committed to protecting your privacy and handling your data in an open and transparent manner.' },
      { title: '2. INFORMATION WE COLLECT', text: 'We collect information you provide directly to us, information collected automatically through your use of our services, and information from third-party sources. This may include personal identifiers, usage data, device information, and location data.' },
      { title: '3. HOW WE USE INFORMATION', text: 'We use the information we collect to provide, maintain, and improve our services; to communicate with you; to personalize your experience; to analyze usage patterns; and to protect against fraud and abuse.' },
      { title: '4. INFORMATION SHARING', text: 'We do not sell your personal information. We may share information with service providers, business partners, and when required by law. We require third parties to protect your information and use it only for specified purposes.' },
      { title: '5. YOUR RIGHTS', text: 'You have the right to access, correct, delete, or port your personal information. You may object to certain processing and withdraw consent where applicable. To exercise these rights, contact us using the information provided below.' },
      { title: '6. DATA SECURITY', text: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.' },
      { title: '7. DATA RETENTION', text: 'We retain your personal information for as long as necessary to fulfill the purposes outlined in this Policy, unless a longer retention period is required or permitted by law.' },
      { title: '8. INTERNATIONAL TRANSFERS', text: 'Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers.' },
      { title: '9. CHILDREN\'S PRIVACY', text: 'Our services are not directed to children under the age of 13 (or 16 in the EU). We do not knowingly collect personal information from children. If we learn we have collected such information, we will delete it.' },
      { title: '10. CONTACT US', text: 'If you have questions or concerns about this Policy or our privacy practices, please contact our Data Protection Officer using the contact information provided on our website.' }
    ]
  },
  amendment: {
    sections: [
      { title: '1. RECITALS', text: 'WHEREAS, the parties entered into an Agreement dated as specified (the "Original Agreement"); and WHEREAS, the parties now desire to amend the Original Agreement as set forth herein; NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:' },
      { title: '2. AMENDMENTS', text: 'The Original Agreement is hereby amended as follows: [Specific amendments listed]. All other terms and conditions of the Original Agreement shall remain in full force and effect and are hereby ratified and confirmed.' },
      { title: '3. EFFECTIVE DATE', text: 'This Amendment shall be effective as of the date first written above. To the extent of any conflict between this Amendment and the Original Agreement, the terms of this Amendment shall control.' },
      { title: '4. COUNTERPARTS', text: 'This Amendment may be executed in one or more counterparts, each of which shall be deemed an original and all of which together shall constitute one and the same instrument. Electronic signatures shall be deemed original signatures for all purposes.' }
    ]
  }
};

// Ensure public/docs directory exists
const publicDir = path.join(__dirname, '..', 'public', 'docs');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PDFs
documents.forEach(doc => {
  console.log(`Generating ${doc.id}.pdf...`);

  const pdf = new PDFDocument({
    size: 'A4',
    margins: { top: 72, bottom: 72, left: 72, right: 72 }
  });

  const outputPath = path.join(publicDir, `${doc.id}.pdf`);
  const stream = fs.createWriteStream(outputPath);
  pdf.pipe(stream);

  // Title page
  pdf.fontSize(20).font('Helvetica-Bold').text(doc.name.toUpperCase(), { align: 'center' });
  pdf.moveDown(0.5);
  pdf.fontSize(12).font('Helvetica').text(`Document Type: ${doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}`, { align: 'center' });
  pdf.text(`Risk Level: ${doc.risk.toUpperCase()}`, { align: 'center' });
  pdf.moveDown(2);

  // Parties
  pdf.fontSize(12).font('Helvetica-Bold').text('PARTIES', { underline: true });
  pdf.moveDown(0.5);
  pdf.fontSize(10).font('Helvetica');
  pdf.text('Party A: [Company Name]');
  pdf.text('Party B: [Counterparty Name]');
  pdf.moveDown(1);

  // Effective date
  pdf.text(`Effective Date: March 15, 2026`);
  pdf.moveDown(2);

  // Add page break
  pdf.addPage();

  // Get template sections
  const template = contentTemplates[doc.type] || contentTemplates.agreement;

  // Content sections
  template.sections.forEach((section, index) => {
    // Check if we need a new page
    if (pdf.y > 650) {
      pdf.addPage();
    }

    pdf.fontSize(11).font('Helvetica-Bold').text(section.title);
    pdf.moveDown(0.3);
    pdf.fontSize(9).font('Helvetica').text(section.text, {
      align: 'justify',
      lineGap: 2
    });
    pdf.moveDown(1);
  });

  // Add signature page
  pdf.addPage();
  pdf.fontSize(12).font('Helvetica-Bold').text('SIGNATURES', { align: 'center' });
  pdf.moveDown(2);

  pdf.fontSize(9).font('Helvetica');
  const signatureY = pdf.y;

  // Left signature block
  pdf.text('_________________________', 72, signatureY);
  pdf.text('Party A Signature', 72, signatureY + 20);
  pdf.text('Date: _______________', 72, signatureY + 35);

  // Right signature block
  pdf.text('_________________________', 350, signatureY);
  pdf.text('Party B Signature', 350, signatureY + 20);
  pdf.text('Date: _______________', 350, signatureY + 35);

  pdf.end();

  stream.on('finish', () => {
    const size = fs.statSync(outputPath).size;
    console.log(`✓ Generated ${doc.id}.pdf (${(size / 1024).toFixed(1)} KB)`);
  });
});

console.log('\nGenerating all 15 PDFs...');
