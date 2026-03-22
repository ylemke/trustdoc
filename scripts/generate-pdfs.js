const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Mock documents data
const documents = [
  {
    id: 'doc_001',
    name: 'Software License Agreement - Enterprise',
    type: 'contract',
    pages: 24,
    content: {
      title: 'ENTERPRISE SOFTWARE LICENSE AGREEMENT',
      parties: {
        licensor: 'TechCorp Solutions Inc.',
        licensee: 'Global Industries Ltd.'
      },
      sections: [
        {
          title: '1. GRANT OF LICENSE',
          text: 'Subject to the terms and conditions of this Agreement, Licensor hereby grants to Licensee a non-exclusive, non-transferable, perpetual license to use the Software for internal business purposes only.\n\nThe license includes the right to install and use the Software on up to 500 concurrent user devices within Licensee\'s organization. Licensee may create backup copies of the Software for archival purposes.'
        },
        {
          title: '2. RESTRICTIONS',
          text: 'Licensee shall not:\n(a) Modify, adapt, translate, reverse engineer, decompile, disassemble or create derivative works based on the Software;\n(b) Sublicense, rent, lease, loan, or distribute the Software to third parties;\n(c) Remove or alter any proprietary notices or labels on the Software;\n(d) Use the Software for service bureau purposes or to provide hosting services to third parties.'
        },
        {
          title: '3. FEES AND PAYMENT',
          text: 'Licensee shall pay to Licensor a one-time license fee of $250,000 (two hundred fifty thousand US dollars) within 30 days of the Effective Date.\n\nAn annual maintenance fee of $50,000 shall be payable on each anniversary of the Effective Date for continued support and updates.'
        },
        {
          title: '4. INTELLECTUAL PROPERTY',
          text: 'The Software and all intellectual property rights therein are and shall remain the exclusive property of Licensor. This Agreement does not convey to Licensee any rights of ownership in or to the Software.\n\nAll modifications, enhancements, and derivative works created by Licensor shall be the sole property of Licensor.'
        },
        {
          title: '5. WARRANTY AND DISCLAIMER',
          text: 'Licensor warrants that the Software will substantially conform to the documentation for a period of 90 days from delivery.\n\nEXCEPT AS EXPRESSLY SET FORTH ABOVE, THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. LICENSOR DISCLAIMS ALL OTHER WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.'
        },
        {
          title: '6. LIMITATION OF LIABILITY',
          text: 'IN NO EVENT SHALL LICENSOR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR DATA USE.\n\nLicensor\'s total liability under this Agreement shall not exceed the amount of fees paid by Licensee in the twelve months preceding the claim.'
        },
        {
          title: '7. TERM AND TERMINATION',
          text: 'This Agreement commences on the Effective Date and continues in perpetuity unless terminated as provided herein.\n\nEither party may terminate this Agreement upon 30 days written notice if the other party materially breaches any term and fails to cure such breach within the notice period.'
        },
        {
          title: '8. CONFIDENTIALITY',
          text: 'Each party agrees to maintain the confidentiality of the other party\'s Confidential Information and use it only for purposes of this Agreement.\n\nConfidential Information does not include information that: (a) is publicly available through no breach of this Agreement; (b) was rightfully in the receiving party\'s possession prior to disclosure; or (c) was independently developed without use of the Confidential Information.'
        }
      ]
    }
  },
  {
    id: 'doc_002',
    name: 'NDA - Strategic Partnership (TechStart)',
    type: 'nda',
    pages: 8,
    content: {
      title: 'MUTUAL NON-DISCLOSURE AGREEMENT',
      parties: {
        party1: 'TechStart Innovations LLC',
        party2: 'Venture Partners Group'
      },
      sections: [
        {
          title: '1. PURPOSE',
          text: 'The parties wish to explore a potential strategic partnership involving the development and commercialization of innovative technology solutions (the "Purpose").\n\nIn connection with the Purpose, each party may disclose Confidential Information to the other party.'
        },
        {
          title: '2. DEFINITION OF CONFIDENTIAL INFORMATION',
          text: 'Confidential Information means any technical, business, financial, or other information disclosed by one party to the other, whether orally, in writing, or in any other form, that:\n(a) Is marked as "Confidential" or with a similar designation; or\n(b) Should reasonably be understood to be confidential given the nature of the information and circumstances of disclosure.\n\nConfidential Information includes, but is not limited to, trade secrets, know-how, inventions, techniques, processes, algorithms, software programs, source code, technical drawings, prototypes, business plans, financial information, customer lists, and marketing strategies.'
        },
        {
          title: '3. OBLIGATIONS',
          text: 'Each party (the "Receiving Party") agrees to:\n(a) Hold the Disclosing Party\'s Confidential Information in strict confidence;\n(b) Not disclose such Confidential Information to any third parties without prior written consent;\n(c) Use the Confidential Information solely for the Purpose;\n(d) Protect the Confidential Information using at least the same degree of care used to protect its own confidential information, but no less than reasonable care;\n(e) Limit disclosure to employees, consultants, and advisors who have a legitimate need to know and who are bound by confidentiality obligations.'
        },
        {
          title: '4. EXCLUSIONS',
          text: 'The obligations set forth in Section 3 shall not apply to information that:\n(a) Was known to the Receiving Party prior to disclosure by the Disclosing Party;\n(b) Is or becomes publicly available through no breach of this Agreement;\n(c) Is rightfully received by the Receiving Party from a third party without breach of any confidentiality obligation;\n(d) Is independently developed by the Receiving Party without use of the Confidential Information;\n(e) Is required to be disclosed by law, regulation, or court order, provided the Receiving Party gives prompt notice to allow the Disclosing Party to seek protective measures.'
        },
        {
          title: '5. TERM',
          text: 'This Agreement shall commence on the Effective Date and continue for a period of three (3) years.\n\nThe obligations of confidentiality shall survive termination and continue for a period of five (5) years from the date of disclosure of the Confidential Information.'
        },
        {
          title: '6. RETURN OF MATERIALS',
          text: 'Upon termination of this Agreement or upon request by the Disclosing Party, the Receiving Party shall promptly:\n(a) Return all documents, materials, and other tangible items containing Confidential Information;\n(b) Delete or destroy all electronic copies of Confidential Information;\n(c) Certify in writing that it has complied with the requirements of this Section.'
        }
      ]
    }
  },
  {
    id: 'doc_003',
    name: 'Employment Contract - Senior Engineer (EU)',
    type: 'contract',
    pages: 18,
    content: {
      title: 'EMPLOYMENT CONTRACT',
      subtitle: 'Senior Software Engineer Position',
      parties: {
        employer: 'Digital Solutions Europe GmbH',
        employee: 'Alex Mueller'
      },
      sections: [
        {
          title: '1. POSITION AND DUTIES',
          text: 'The Employee is employed as a Senior Software Engineer, reporting to the Chief Technology Officer.\n\nThe Employee shall perform duties including:\n- Design and development of scalable software systems\n- Technical leadership and mentoring of junior engineers\n- Code review and quality assurance\n- Participation in architecture and technology decisions\n- Collaboration with product and design teams\n\nThe Employee agrees to devote their full working time and attention to the business of the Employer.'
        },
        {
          title: '2. PLACE OF WORK',
          text: 'The Employee\'s primary place of work shall be the Employer\'s office located at:\nTech Campus, Building 5\nBerlin, Germany 10115\n\nThe Employer may require the Employee to work at other locations as business needs require. Remote work arrangements may be permitted at the Employer\'s discretion, subject to applicable policies.'
        },
        {
          title: '3. COMMENCEMENT AND TERM',
          text: 'This Contract commences on April 1, 2026 (the "Commencement Date").\n\nThis is a permanent contract of employment, subject to a probationary period of six (6) months from the Commencement Date.\n\nDuring the probationary period, either party may terminate this Contract with two (2) weeks\' notice. After successful completion of the probationary period, the notice periods set forth in Section 10 shall apply.'
        },
        {
          title: '4. WORKING HOURS',
          text: 'The Employee\'s normal working hours are 40 hours per week, typically Monday through Friday, 9:00 AM to 5:30 PM, with a 30-minute lunch break.\n\nThe Employer operates a flexible working hours policy, allowing employees to adjust their start and end times within core hours (10:00 AM to 4:00 PM).\n\nThe Employee may be required to work reasonable additional hours as necessary to fulfill their duties. Senior positions are not eligible for overtime compensation.'
        },
        {
          title: '5. REMUNERATION',
          text: 'The Employee\'s gross annual salary is €95,000 (ninety-five thousand Euros), payable in twelve equal monthly installments on the last working day of each month.\n\nThe salary will be reviewed annually, with any adjustments at the sole discretion of the Employer based on performance and market conditions.\n\nAll payments shall be subject to applicable tax and social security deductions as required by German law.'
        },
        {
          title: '6. BONUS AND BENEFITS',
          text: 'The Employee is eligible to participate in the Employer\'s annual bonus scheme, with a target bonus of 15% of base salary, subject to company and individual performance.\n\nThe Employee is entitled to the following benefits:\n- Company pension scheme with 5% employer contribution\n- Private health insurance\n- 30 days of annual leave (plus German public holidays)\n- Equipment allowance for home office setup\n- Professional development budget of €2,000 per year\n- Gym membership subsidy\n- Stock option plan (subject to separate agreement)'
        },
        {
          title: '7. HOLIDAYS',
          text: 'The Employee is entitled to 30 working days of paid annual leave per calendar year, in addition to German public holidays.\n\nHoliday entitlement accrues proportionally throughout the year. In the first and final years of employment, entitlement will be calculated pro rata.\n\nHolidays must be requested in advance and approved by the Employee\'s line manager. The Employer may require the Employee to take holidays at specific times for operational reasons.'
        },
        {
          title: '8. SICKNESS',
          text: 'If the Employee is unable to work due to illness or injury, they must notify their manager as soon as possible and no later than 10:00 AM on the first day of absence.\n\nA medical certificate must be provided for any absence exceeding three consecutive working days.\n\nThe Employee is entitled to continued payment of salary during sickness absence in accordance with the German Continued Remuneration Act (Entgeltfortzahlungsgesetz).'
        },
        {
          title: '9. INTELLECTUAL PROPERTY',
          text: 'All inventions, discoveries, developments, and works created by the Employee in the course of employment shall be the exclusive property of the Employer.\n\nThe Employee hereby assigns to the Employer all present and future intellectual property rights in any work product created during employment.\n\nThe Employee shall promptly disclose to the Employer all inventions and developments, and shall execute all documents necessary to vest ownership in the Employer.'
        },
        {
          title: '10. TERMINATION',
          text: 'After completion of the probationary period, either party may terminate this Contract by giving three (3) months\' written notice to the end of a calendar month.\n\nThe Employer may terminate this Contract immediately without notice for gross misconduct or material breach of contract.\n\nUpon termination, the Employee must return all company property and confidential information, and shall have no further claims against the Employer except for accrued salary and benefits.'
        },
        {
          title: '11. CONFIDENTIALITY',
          text: 'The Employee acknowledges that during employment they will have access to confidential and proprietary information of the Employer.\n\nThe Employee agrees to keep such information strictly confidential and not to disclose it to any third party without authorization, both during and after employment.\n\nThis obligation shall survive termination of employment indefinitely.'
        },
        {
          title: '12. DATA PROTECTION',
          text: 'The Employee consents to the processing of their personal data by the Employer for employment-related purposes in accordance with the EU General Data Protection Regulation (GDPR) and German Federal Data Protection Act.\n\nThe Employer\'s Privacy Notice provides further information on data processing and the Employee\'s rights.'
        },
        {
          title: '13. GOVERNING LAW',
          text: 'This Contract shall be governed by and construed in accordance with the laws of Germany.\n\nAny disputes arising from this Contract shall be subject to the exclusive jurisdiction of the German labor courts.'
        }
      ]
    }
  }
];

// Ensure public directory exists
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
  pdf.fontSize(24).font('Helvetica-Bold').text(doc.content.title, { align: 'center' });
  pdf.moveDown(0.5);

  if (doc.content.subtitle) {
    pdf.fontSize(16).font('Helvetica').text(doc.content.subtitle, { align: 'center' });
    pdf.moveDown(2);
  } else {
    pdf.moveDown(1);
  }

  // Parties
  pdf.fontSize(14).font('Helvetica-Bold').text('PARTIES', { underline: true });
  pdf.moveDown(0.5);
  pdf.fontSize(11).font('Helvetica');

  Object.entries(doc.content.parties).forEach(([role, name]) => {
    const roleLabel = role.charAt(0).toUpperCase() + role.slice(1).replace(/([A-Z])/g, ' $1');
    pdf.text(`${roleLabel}: ${name}`);
  });

  pdf.moveDown(1.5);

  // Effective date
  pdf.fontSize(11).text(`Effective Date: March 15, 2026`);
  pdf.moveDown(2);

  // Add page break
  pdf.addPage();

  // Content sections
  doc.content.sections.forEach((section, index) => {
    // Check if we need a new page (if less than 150 points remaining)
    if (pdf.y > 650) {
      pdf.addPage();
    }

    pdf.fontSize(12).font('Helvetica-Bold').text(section.title);
    pdf.moveDown(0.3);
    pdf.fontSize(10).font('Helvetica').text(section.text, {
      align: 'justify',
      lineGap: 3
    });
    pdf.moveDown(1);
  });

  // Add signature page
  pdf.addPage();
  pdf.fontSize(12).font('Helvetica-Bold').text('SIGNATURES', { align: 'center' });
  pdf.moveDown(2);

  pdf.fontSize(10).font('Helvetica');
  const signatureY = pdf.y;

  // Left signature block
  pdf.text('_________________________', 72, signatureY);
  pdf.text(Object.values(doc.content.parties)[0], 72, signatureY + 25);
  pdf.text('Date: _______________', 72, signatureY + 40);

  // Right signature block
  pdf.text('_________________________', 350, signatureY);
  pdf.text(Object.values(doc.content.parties)[1], 350, signatureY + 25);
  pdf.text('Date: _______________', 350, signatureY + 40);

  pdf.end();

  stream.on('finish', () => {
    console.log(`✓ Generated ${doc.id}.pdf (${fs.statSync(outputPath).size} bytes)`);
  });
});

console.log('\nPDF generation complete!');
