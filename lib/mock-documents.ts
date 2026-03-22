/**
 * Mock documents for TrustDoc testing
 * 15 realistic legal documents requiring AI review
 */

export interface MockDocument {
  id: string;
  name: string;
  type: 'contract' | 'nda' | 'agreement' | 'policy' | 'terms' | 'amendment';
  size: string;
  pages: number;
  url: string; // PDF URL or data URI
  ai_analysis: string;
  risk_level: 'low' | 'medium' | 'high';
  key_issues: number;
  uploaded_at: string;
}

export const MOCK_DOCUMENTS: MockDocument[] = [
  {
    id: 'doc_001',
    name: 'Master Service Agreement - TechCorp.pdf',
    type: 'agreement',
    size: '2.3 MB',
    pages: 24,
    url: '/api/mock-pdf/doc_001', // Will serve mock PDF
    risk_level: 'high',
    key_issues: 4,
    uploaded_at: '2026-03-19T10:30:00Z',
    ai_analysis: `**MASTER SERVICE AGREEMENT ANALYSIS**

**Critical Issues Identified:**

1. **LIABILITY LIMITATION (§8.2)** - HIGH RISK
   - Cap set at €50,000 (2.2% of contract value €2.3M)
   - Industry standard: 10-15% of contract value
   - **Recommendation:** Negotiate upward to €230,000 minimum

2. **TERMINATION FOR CONVENIENCE (§12.1)** - HIGH RISK
   - 14-day notice period is unusually short
   - Standard practice: 30-90 days
   - **Risk:** Significant operational disruption

3. **INTELLECTUAL PROPERTY (§15)** - MEDIUM RISK
   - Overly broad IP assignment clause
   - Includes pre-existing tools and methodologies
   - **Recommendation:** Limit to specifically commissioned deliverables

4. **DATA PROCESSING (§18.3)** - HIGH RISK
   - No explicit GDPR Article 28 DPA referenced
   - **Compliance gap:** Must be resolved before execution

**Financial Terms:**
- Contract Value: €2,300,000 over 36 months
- Payment Terms: Net 30, monthly installments
- Late Payment: 1.5% per month (compliant)

**RECOMMENDATION:** Do not execute in current form. Negotiate clauses 8.2, 12.1, 15, and 18.3 before proceeding.`,
  },
  {
    id: 'doc_002',
    name: 'Non-Disclosure Agreement - Vendor Due Diligence.pdf',
    type: 'nda',
    size: '487 KB',
    pages: 6,
    url: '/api/mock-pdf/doc_002',
    risk_level: 'medium',
    key_issues: 2,
    uploaded_at: '2026-03-19T09:15:00Z',
    ai_analysis: `**NDA ANALYSIS - VENDOR DUE DILIGENCE**

**Issues Identified:**

1. **CONFIDENTIALITY SCOPE (§2.1)** - MEDIUM RISK
   - Definition of "Confidential Information" is overly broad
   - Includes "any information disclosed during relationship"
   - **Risk:** Could inadvertently cover public information
   - **Recommendation:** Add standard exclusions (publicly available, independently developed, previously known)

2. **RETURN OF MATERIALS (§7)** - LOW RISK
   - 10-day return window after termination
   - Industry standard: 30 days
   - **Impact:** Tight timeline for compliance

**Positive Elements:**
- Term: 2 years from effective date (standard)
- Mutual obligations (balanced)
- Standard exceptions included (judicial order, regulatory requirement)
- No non-compete or non-solicit clauses

**Financial Impact:** No direct costs, but breachpenalties unspecified

**RECOMMENDATION:** Acceptable with minor amendments to §2.1 definitions. Request 30-day return window.`,
  },
  {
    id: 'doc_003',
    name: 'Employment Contract - Senior Engineer (EU).pdf',
    type: 'contract',
    size: '1.1 MB',
    pages: 18,
    url: '/api/mock-pdf/doc_003',
    risk_level: 'low',
    key_issues: 1,
    uploaded_at: '2026-03-19T08:45:00Z',
    ai_analysis: `**EMPLOYMENT CONTRACT ANALYSIS**

**Summary:** Standard EU employment contract, largely compliant.

**Minor Issue:**

1. **INTELLECTUAL PROPERTY ASSIGNMENT (§9)** - LOW RISK
   - Assigns all IP created "during employment"
   - Standard clause but could be interpreted broadly
   - **Recommendation:** Clarify "within scope of employment duties"

**Compliant Elements:**
- Salary: €95,000/year (competitive for role)
- Working hours: 40 hours/week with overtime compensation
- Vacation: 25 days/year (EU standard)
- Notice period: 3 months (both parties)
- Termination: Complies with EU labor law
- Data protection: GDPR-compliant
- No non-compete (non-enforceable in this jurisdiction)

**Benefits Package:**
- Health insurance (fully covered)
- Pension contribution: 5% employer match
- Professional development: €2,000/year budget

**RECOMMENDATION:** Approve with minor IP clause clarification. Excellent terms for candidate.`,
  },
  {
    id: 'doc_004',
    name: 'Software License Agreement - Enterprise SaaS.pdf',
    type: 'agreement',
    size: '896 KB',
    pages: 12,
    url: '/api/mock-pdf/doc_004',
    risk_level: 'high',
    key_issues: 3,
    uploaded_at: '2026-03-19T08:00:00Z',
    ai_analysis: `**SOFTWARE LICENSE AGREEMENT - ENTERPRISE SAAS**

**Critical Issues:**

1. **AUTO-RENEWAL CLAUSE (§3.2)** - HIGH RISK
   - Contract auto-renews annually unless cancelled 90 days prior
   - Price increase up to 15% per year without approval
   - **Risk:** $180K annual spend could increase to $207K without negotiation
   - **Recommendation:** Cap price increases at 5% or CPI, whichever is lower

2. **DATA OWNERSHIP (§11)** - HIGH RISK
   - Vendor claims ownership of "derived data" and "aggregate analytics"
   - Potentially includes customer business intelligence
   - **Risk:** Competitive data exposure
   - **Recommendation:** Explicitly exclude customer-specific derived data

3. **INDEMNIFICATION (§14)** - MEDIUM RISK
   - Customer indemnifies vendor for third-party claims related to "customer data"
   - No cap on indemnity obligation
   - **Risk:** Unlimited liability
   - **Recommendation:** Add cap matching contract value

**License Terms:**
- Type: Named user, non-exclusive, non-transferable
- Users: 500 seats at $30/seat/month = $180K/year
- Support: 24/7 email, 8/5 phone (acceptable)
- SLA: 99.5% uptime with service credits (industry standard)

**RECOMMENDATION:** High business value but significant risk. Negotiate all three issues before signing.`,
  },
  {
    id: 'doc_005',
    name: 'Real Estate Lease - Office Space Downtown.pdf',
    type: 'agreement',
    size: '1.8 MB',
    pages: 32,
    url: '/api/mock-pdf/doc_005',
    risk_level: 'medium',
    key_issues: 2,
    uploaded_at: '2026-03-18T16:30:00Z',
    ai_analysis: `**COMMERCIAL LEASE ANALYSIS**

**Property:** 5,500 sq ft, Class A office, downtown district

**Issues Identified:**

1. **RENT ESCALATION (§4.3)** - MEDIUM RISK
   - Annual increase: Greater of 4% or CPI + 1%
   - In high inflation environment, could exceed 7%
   - **Financial Impact:** Base rent €165K could reach €200K+ by year 5
   - **Recommendation:** Cap at 5% annually or negotiate fixed increases

2. **MAINTENANCE OBLIGATIONS (§7)** - MEDIUM RISK
   - Tenant responsible for HVAC, electrical, plumbing repairs
   - Landlord only covers "structural" repairs (undefined)
   - **Risk:** Unexpected capital expenditures
   - **Recommendation:** Define "structural" explicitly, landlord should cover major systems

**Lease Terms:**
- Term: 7 years with one 5-year renewal option
- Base Rent: €30/sq ft/year = €165,000/year
- Triple Net (NNN): Tenant pays property tax, insurance, CAM
- Early Termination: 12-month penalty after year 3 (reasonable)
- Improvement Allowance: €50/sq ft = €275,000 (competitive)

**Positive Elements:**
- Build-out allowance above market average
- Renewal option with favorable terms
- No percentage rent clause
- Standard assignment/subletting provisions

**RECOMMENDATION:** Negotiate rent cap and HVAC/major systems coverage. Otherwise acceptable commercial terms.`,
  },
  {
    id: 'doc_006',
    name: 'Partnership Agreement - Joint Venture Formation.pdf',
    type: 'agreement',
    size: '2.1 MB',
    pages: 28,
    url: '/api/mock-pdf/doc_006',
    risk_level: 'high',
    key_issues: 5,
    uploaded_at: '2026-03-18T14:20:00Z',
    ai_analysis: `**JOINT VENTURE PARTNERSHIP AGREEMENT**

**Critical Issues:**

1. **CONTROL & VOTING (§5)** - HIGH RISK
   - 50/50 ownership but certain decisions require unanimous consent
   - No tiebreaker mechanism defined
   - **Risk:** Deadlock on material decisions
   - **Recommendation:** Add mediation/arbitration tiebreaker or third-party director

2. **CAPITAL CALLS (§8.2)** - HIGH RISK
   - Mandatory capital contributions with 30-day notice
   - No cap on total capital calls
   - **Risk:** Unlimited financial obligation
   - **Recommendation:** Cap at 2x initial contribution or require mutual consent for calls >€500K

3. **DISSOLUTION TERMS (§12)** - HIGH RISK
   - Either party can trigger dissolution with 90-day notice
   - No buy-sell provisions
   - **Risk:** Forced liquidation at disadvantageous time
   - **Recommendation:** Add right of first refusal, shotgun clause, or minimum 2-year commitment

4. **INTELLECTUAL PROPERTY (§9)** - MEDIUM RISK
   - JV owns all IP created, but allocation upon dissolution unclear
   - **Risk:** Dispute over valuable IP
   - **Recommendation:** Define IP split methodology (contribution-based or auction)

5. **NON-COMPETE (§14)** - MEDIUM RISK
   - 5-year non-compete post-exit in same industry
   - **Risk:** May be unenforceable in EU, but litigious
   - **Recommendation:** Narrow to specific customer/product categories

**Financial Structure:**
- Initial Capital: €1M each (€2M total)
- Profit Distribution: 50/50 quarterly
- Management Fee: None (both parties contribute resources)

**RECOMMENDATION:** High strategic value but significant governance and financial risks. Strongly recommend renegotiating control, capital call caps, and dissolution provisions before signing.`,
  },
  {
    id: 'doc_007',
    name: 'Terms of Service - Consumer Platform (GDPR Update).pdf',
    type: 'terms',
    size: '764 KB',
    pages: 22,
    url: '/api/mock-pdf/doc_007',
    risk_level: 'medium',
    key_issues: 3,
    uploaded_at: '2026-03-18T11:05:00Z',
    ai_analysis: `**TERMS OF SERVICE - GDPR COMPLIANCE REVIEW**

**Issues Identified:**

1. **DATA RETENTION (§7.3)** - MEDIUM RISK
   - States data retained "as long as account is active"
   - GDPR requires specific retention periods
   - **Compliance Risk:** GDPR Art. 5(1)(e) violation
   - **Recommendation:** Define maximum retention periods by data category

2. **THIRD-PARTY SHARING (§8.4)** - MEDIUM RISK
   - Lists "partners" without specifying who or why
   - GDPR requires explicit purposes for data sharing
   - **Compliance Risk:** GDPR Art. 13 violation (transparency)
   - **Recommendation:** Name categories of partners and purposes

3. **CHILDREN'S DATA (§3.1)** - LOW RISK
   - States service is for users 13+
   - No age verification mechanism described
   - **Recommendation:** Add parental consent provisions for users under 16 (GDPR standard)

**Positive Elements:**
- Clear consent mechanisms for data processing
- User rights section (access, deletion, portability) present
- DPO contact information provided
- Data breach notification procedures defined
- International transfers covered with SCCs

**User Protections:**
- Free tier available (good faith)
- Clear pricing display
- 30-day cancellation right
- No automatic renewals
- Dispute resolution: Arbitration optional

**RECOMMENDATION:** Approve with amendments to §7.3, §8.4, and §3.1. Otherwise GDPR-compliant and user-friendly terms.`,
  },
  {
    id: 'doc_008',
    name: 'Settlement Agreement - Employment Dispute.pdf',
    type: 'agreement',
    size: '512 KB',
    pages: 8,
    url: '/api/mock-pdf/doc_008',
    risk_level: 'medium',
    key_issues: 2,
    uploaded_at: '2026-03-17T15:45:00Z',
    ai_analysis: `**SETTLEMENT AGREEMENT - EMPLOYMENT DISPUTE**

**Context:** Wrongful termination claim, pre-litigation settlement

**Issues Identified:**

1. **GENERAL RELEASE SCOPE (§3)** - MEDIUM RISK
   - Releases "all claims known or unknown"
   - In some jurisdictions, unknown claims releases are unenforceable
   - **Risk:** Agreement could be challenged
   - **Recommendation:** Add specific waiver of unknown claims provision with legal advice confirmation

2. **CONFIDENTIALITY (§5)** - LOW RISK
   - Mutual non-disclosure of settlement terms
   - Exception: "required by law"
   - **Issue:** No carve-out for employee's attorney, accountant, spouse
   - **Recommendation:** Add standard exceptions for necessary disclosures

**Settlement Terms:**
- Payment: €85,000 gross (includes statutory + enhancement)
- Structure: Lump sum within 14 days of execution
- No admission of liability (standard)
- Neutral reference letter provided
- Accrued vacation paid separately (€4,200)

**Positive Elements:**
- Reasonable settlement amount (6 months salary equivalent)
- Quick payment terms
- No disparagement clause (balanced)
- No non-compete obligation
- Standard indemnification if employee breaches

**Tax Implications:**
- Settlement will be subject to income tax and social contributions
- No tax planning strategy included
- **Note:** Employee should consult tax advisor

**RECOMMENDATION:** Accept with minor amendments to release and confidentiality language. Commercially reasonable settlement avoiding litigation costs and uncertainty.`,
  },
  {
    id: 'doc_009',
    name: 'Acquisition Agreement - Asset Purchase (Tech Startup).pdf',
    type: 'agreement',
    size: '3.2 MB',
    pages: 64,
    url: '/api/mock-pdf/doc_009',
    risk_level: 'high',
    key_issues: 6,
    uploaded_at: '2026-03-17T10:00:00Z',
    ai_analysis: `**ASSET PURCHASE AGREEMENT - TECH STARTUP ACQUISITION**

**Transaction:** Acquisition of SaaS platform, customer contracts, and IP

**Critical Issues:**

1. **REPRESENTATIONS & WARRANTIES (§6)** - HIGH RISK
   - No survival period specified
   - Standard: 18-24 months for fundamental reps, 12 months for others
   - **Risk:** Claims could be time-barred immediately post-closing
   - **Recommendation:** Add explicit survival periods

2. **WORKING CAPITAL ADJUSTMENT (§2.5)** - HIGH RISK
   - Target working capital undefined
   - Post-closing adjustment mechanism vague
   - **Risk:** Dispute over purchase price
   - **Recommendation:** Define target working capital = last 12-month average

3. **INTELLECTUAL PROPERTY (§3.2)** - HIGH RISK
   - IP schedule lists "Appendix A" but Appendix A missing from draft
   - **Risk:** Core asset undefined
   - **Recommendation:** Complete IP schedule before signing - this is critical

4. **EMPLOYEE TRANSITION (§8)** - MEDIUM RISK
   - Buyer "may" offer employment to key employees
   - No obligation to maintain salary/benefits
   - **Risk:** Loss of institutional knowledge, key personnel
   - **Recommendation:** Require offers to named key employees at current comp for 12 months

5. **NON-COMPETE (§10)** - MEDIUM RISK
   - Seller non-compete: 5 years, worldwide, entire SaaS industry
   - **Risk:** Likely unenforceable (too broad)
   - **Recommendation:** Narrow to 2 years, specific geography, specific product category

6. **EARNOUT (§2.3)** - HIGH RISK
   - 30% of purchase price ($2.1M) contingent on revenue targets
   - Buyer has "sole discretion" over business decisions affecting revenue
   - No protection against buyer manipulation
   - **Risk:** Earnout targets unachievable if buyer deprioritizes product
   - **Recommendation:** Add operating covenants (maintain sales team, marketing budget floors)

**Purchase Price:**
- Cash at Closing: $4.9M
- Earnout (3 years): Up to $2.1M
- Total Potential: $7.0M
- Escrowed (18 months): $700K (10% for indemnity claims)

**Positive Elements:**
- Customer contracts assignable (confirmed)
- No material litigation disclosed
- Financial statements audited (clean opinion)
- Key licenses and permits in place

**RECOMMENDATION:** High strategic fit but significant execution risk. Do NOT sign until IP schedule complete and earnout protections added. Consider renegotiating warranty survival and non-compete scope.`,
  },
  {
    id: 'doc_010',
    name: 'Consulting Agreement - Fractional CFO Services.pdf',
    type: 'agreement',
    size: '623 KB',
    pages: 10,
    url: '/api/mock-pdf/doc_010',
    risk_level: 'low',
    key_issues: 1,
    uploaded_at: '2026-03-16T14:30:00Z',
    ai_analysis: `**CONSULTING AGREEMENT - FRACTIONAL CFO**

**Scope:** Part-time CFO services, 20 hours/week, 12-month term

**Minor Issue:**

1. **TERMINATION (§8)** - LOW RISK
   - Either party can terminate with 30-day notice
   - No provision for immediate termination for cause
   - **Issue:** If consultant breaches confidentiality, 30-day notice required
   - **Recommendation:** Add immediate termination right for material breach

**Consulting Terms:**
- Compensation: €8,000/month (€96K annually)
- Hours: 20 hours/week average (flexible scheduling)
- Benefits: None (independent contractor)
- Expenses: Reimbursed with receipts

**Scope of Services:**
- Financial planning and analysis
- Board presentation preparation
- Fundraising support
- Vendor/bank relationship management
- Budget development and monitoring

**Positive Elements:**
- Clear independent contractor classification
- Consultant can serve other clients (no exclusivity)
- Reasonable confidentiality provisions
- IP created in scope belongs to company
- No non-compete clause
- Professional liability insurance required ($1M coverage)

**Tax & Legal:**
- Consultant responsible for own taxes
- Complies with independent contractor tests
- No benefits obligations

**RECOMMENDATION:** Approve with minor termination clause addition. Fair terms, clear scope, appropriate compensation for fractional executive role.`,
  },
  {
    id: 'doc_011',
    name: 'API License Agreement - Third-Party Integration.pdf',
    type: 'agreement',
    size: '1.4 MB',
    pages: 16,
    url: '/api/mock-pdf/doc_011',
    risk_level: 'medium',
    key_issues: 2,
    uploaded_at: '2026-03-16T09:20:00Z',
    ai_analysis: `**API LICENSE AGREEMENT - THIRD-PARTY INTEGRATION**

**Issues Identified:**

1. **RATE LIMITS & THROTTLING (§3.4)** - MEDIUM RISK
   - API rate limited to 1,000 requests/hour
   - Current usage: ~800 requests/hour (80% capacity)
   - No graduated pricing or overage mechanism
   - **Risk:** Service degradation as usage grows
   - **Recommendation:** Negotiate tiered pricing or soft limits with overage fees

2. **DEPRECATION POLICY (§5.2)** - MEDIUM RISK
   - Vendor can deprecate API endpoints with 30-day notice
   - **Risk:** Insufficient time for migration
   - **Industry Standard:** 90-180 days for breaking changes
   - **Recommendation:** Require 90-day notice for deprecations

**License Terms:**
- Type: Non-exclusive, non-transferable
- Pricing: $2,500/month flat rate
- SLA: 99.9% uptime
- Support: Email only, 24-hour response time

**Technical Specifications:**
- Authentication: OAuth 2.0 (secure)
- Data Format: JSON (standard)
- Endpoints: RESTful (well-documented)
- Versioning: Semantic versioning (good)

**Data & Privacy:**
- No PII transmitted via API
- Data encrypted in transit (TLS 1.3)
- No data retention by vendor
- GDPR-compliant data processing

**Positive Elements:**
- Clear API documentation
- Sandbox environment provided
- No minimum commitment
- Monthly billing

**RECOMMENDATION:** Acceptable business terms with amendments to rate limits and deprecation notice. Technical implementation is sound.`,
  },
  {
    id: 'doc_012',
    name: 'Franchise Agreement - Multi-Unit Development.pdf',
    type: 'agreement',
    size: '2.8 MB',
    pages: 42,
    url: '/api/mock-pdf/doc_012',
    risk_level: 'high',
    key_issues: 4,
    uploaded_at: '2026-03-15T16:50:00Z',
    ai_analysis: `**FRANCHISE AGREEMENT - MULTI-UNIT DEVELOPMENT**

**Critical Issues:**

1. **DEVELOPMENT OBLIGATIONS (§4)** - HIGH RISK
   - Must open 5 locations in 3 years or lose territorial rights
   - Each location requires $400K-$600K investment
   - Total obligation: $2M-$3M
   - **Risk:** Forfeiture of territory and already-invested capital if schedule missed
   - **Recommendation:** Negotiate force majeure provisions and extension rights

2. **ROYALTY STRUCTURE (§7)** - MEDIUM RISK
   - 7% of gross revenue (above industry average of 5-6%)
   - Marketing fund: additional 2% (reasonable)
   - Combined 9% ongoing costs
   - **Financial Impact:** On $5M annual revenue = $450K/year in fees
   - **Recommendation:** Negotiate volume discounts for multi-unit operators

3. **TERRITORIAL PROTECTION (§3)** - HIGH RISK
   - Territory defined by zip codes but franchisor can:
     - Sell products online into territory
     - Open corporate locations at their discretion
   - **Risk:** Cannibalization of franchisee investment
   - **Recommendation:** Add minimum distance requirement for corporate locations

4. **RENEWAL RIGHTS (§14)** - MEDIUM RISK
   - 10-year initial term
   - Renewal available but franchisor "may" modify terms
   - **Risk:** Uncertainty in long-term investment
   - **Recommendation:** Right of first refusal at then-current terms

**Financial Summary:**
- Initial Franchise Fee: $45,000 per location × 5 = $225,000
- Build-out: $400K-$600K per location
- Total Investment: $2.2M-$3.2M
- Royalties: 7% of gross (ongoing)
- Marketing Fee: 2% of gross (ongoing)

**Franchisor Obligations:**
- Initial training (2 weeks)
- Ongoing support and site visits
- Marketing materials and campaigns
- Supply chain management
- Brand protection

**RECOMMENDATION:** High-risk, high-investment opportunity. Strongly recommend renegotiating development timeline, territorial protection, and renewal rights. Consider starting with single-unit franchise to test market before multi-unit commitment.`,
  },
  {
    id: 'doc_013',
    name: 'Amendment No 3 - Cloud Services Agreement.pdf',
    type: 'amendment',
    size: '234 KB',
    pages: 4,
    url: '/api/mock-pdf/doc_013',
    risk_level: 'low',
    key_issues: 1,
    uploaded_at: '2026-03-15T11:10:00Z',
    ai_analysis: `**AMENDMENT NO. 3 - CLOUD SERVICES AGREEMENT**

**Summary:** Adds new data center region (EU-Central) and increases storage allocation

**Minor Issue:**

1. **PRICING ADJUSTMENT (§2)** - LOW RISK
   - Storage price increases from $0.10/GB to $0.12/GB (20% increase)
   - Market rate: $0.10-$0.11/GB
   - **Cost Impact:** Additional ~$15K/year on 750TB storage
   - **Recommendation:** Request price matching with market rate

**Changes Made:**
- **New Region:** EU-Central data center added
- **Storage:** Increased from 500TB to 750TB included
- **Bandwidth:** Increased from 50TB to 75TB/month
- **Redundancy:** Geo-redundant storage now included (previously charged)
- **Support:** Upgraded to 24/7 phone support (was email-only)

**Pricing:**
- Old: $12,000/month
- New: $14,500/month
- Increase: 20.8% ($2,500/month, $30K/year)

**Cost Justification:**
- Storage increase: +50% capacity
- Geo-redundancy: Value $1,200/month if purchased separately
- Enhanced support: Value $800/month if purchased separately
- Net new features value: ~$2,000/month

**Original Agreement:**
- Initial term: 36 months (18 months remaining)
- Amendment extends remaining term (good)
- All other terms unchanged

**RECOMMENDATION:** Accept amendment. Price increase justified by added value (geo-redundancy and support upgrade worth $2,000/month). Minor negotiation possible on storage rate but not material to decision.`,
  },
  {
    id: 'doc_014',
    name: 'Privacy Policy - Mobile App (California CCPA).pdf',
    type: 'policy',
    size: '891 KB',
    pages: 14,
    url: '/api/mock-pdf/doc_014',
    risk_level: 'medium',
    key_issues: 3,
    uploaded_at: '2026-03-14T13:25:00Z',
    ai_analysis: `**PRIVACY POLICY - CCPA COMPLIANCE REVIEW**

**Issues Identified:**

1. **DO NOT SELL LINK (CCPA §1798.135)** - MEDIUM RISK
   - "Do Not Sell My Personal Information" link required on homepage
   - Currently not present in policy or app interface
   - **Compliance Risk:** CCPA violation even if not selling data
   - **Recommendation:** Add link immediately (safe harbor even if not selling)

2. **CATEGORIES OF DATA COLLECTED (CCPA §1798.100)** - MEDIUM RISK
   - Policy lists data types but not CCPA-specific categories
   - Must use CCPA-defined categories (11 categories)
   - **Example:** "Contact info" should be "Identifiers" category
   - **Recommendation:** Reformat to match CCPA categories

3. **RETENTION PERIODS (CCPA §1798.105)** - LOW RISK
   - States data kept "as long as necessary"
   - CCPA best practice: Specify maximum periods
   - **Recommendation:** Add retention schedule table

**Positive CCPA Elements:**
- Right to know (disclosure) explained
- Right to delete process described
- Right to opt-out mechanism (though link missing)
- Non-discrimination policy included
- Authorized agent process described
- Verification procedures defined

**Data Practices:**
- **Collected:** Device ID, location, usage data, contacts (with permission)
- **Purposes:** App functionality, analytics, advertising
- **Sharing:** Analytics partners (Google, Mixpanel), ad networks
- **Sale:** Policy claims no sale, but ad network sharing may qualify

**Child Privacy:**
- States app not for users under 13
- No actual knowledge of child users
- COPPA compliant

**RECOMMENDATION:** Update to include prominent "Do Not Sell" link and reformat data categories to CCPA standards. Otherwise substantially compliant with California privacy law.`,
  },
  {
    id: 'doc_015',
    name: 'Supplier Agreement - Manufacturing Contract (Asia).pdf',
    type: 'agreement',
    size: '1.9 MB',
    pages: 26,
    url: '/api/mock-pdf/doc_015',
    risk_level: 'high',
    key_issues: 4,
    uploaded_at: '2026-03-14T08:00:00Z',
    ai_analysis: `**SUPPLIER AGREEMENT - MANUFACTURING CONTRACT**

**Critical Issues:**

1. **QUALITY CONTROL (§6)** - HIGH RISK
   - No third-party inspection rights
   - Supplier self-certifies quality
   - **Risk:** Defective products, brand damage
   - **Recommendation:** Add independent QC inspection at buyer's cost

2. **MINIMUM ORDER QUANTITIES (§3.3)** - HIGH RISK
   - MOQ: 10,000 units per SKU per order
   - Current forecast: 6,000 units/month across 3 SKUs
   - **Risk:** Excess inventory, cash flow strain
   - **Recommendation:** Negotiate lower MOQ or aggregate across SKUs

3. **PAYMENT TERMS (§8)** - MEDIUM RISK
   - 50% deposit, 50% before shipment
   - No payment terms (Net 0)
   - **Cash Flow Impact:** $120K upfront per order
   - **Industry Standard:** 30% deposit, Net 30-60 after shipment
   - **Recommendation:** Negotiate Net 30 on final 50%

4. **INTELLECTUAL PROPERTY (§12)** - HIGH RISK
   - Buyer provides designs and molds
   - Molds remain supplier's property after 2 years
   - Designs can be used for "similar products"
   - **Risk:** Supplier could manufacture for competitors
   - **Recommendation:** Buyer must own molds, add strict confidentiality + non-compete

**Pricing:**
- Per Unit: $12.00 FOB (Asian port)
- Shipping: Buyer responsible (approx $2.50/unit)
- Landed Cost: ~$14.50/unit
- Target Retail: $49.99 (good margin)

**Production:**
- Lead Time: 60 days after deposit
- Capacity: 50,000 units/month
- Samples: 7-10 days (free for first order)

**Positive Elements:**
- Certifications: ISO 9001, ISO 14001
- Insurance: $2M product liability
- No exclusivity (buyer can use other suppliers)

**Force Majeure:**
- Standard clause included
- Recent supply chain issues make this critical

**RECOMMENDATION:** Do not sign without addressing QC inspection rights and IP protection. These are dealbreakers. MOQ and payment terms should also be negotiated but are less critical.`,
  },
  {
    id: 'doc_016',
    name: 'Data Processing Agreement - AI Model Training (GDPR).pdf',
    type: 'agreement',
    size: '1.6 MB',
    pages: 20,
    url: '/api/mock-pdf/doc_016',
    risk_level: 'high',
    key_issues: 5,
    uploaded_at: '2026-03-20T09:30:00Z',
    ai_analysis: `**DATA PROCESSING AGREEMENT - AI MODEL TRAINING**

**Critical Issues:**

1. **PURPOSE LIMITATION (GDPR Art. 5(1)(b))** - HIGH RISK
   - DPA permits processing for "AI model development and improvement"
   - Overly broad - no specific use case limitation
   - **Risk:** Model training could include inadvertent personal data
   - **Recommendation:** Limit to "training natural language models for customer service automation only"

2. **DATA MINIMIZATION (GDPR Art. 5(1)(c))** - HIGH RISK
   - Agreement permits transfer of "all customer interaction data"
   - No filtering or pseudonymization requirements
   - **Risk:** Processing unnecessary personal data
   - **Recommendation:** Require anonymization pipeline + only transfer non-PII features

3. **INTERNATIONAL TRANSFERS (GDPR Art. 44-50)** - HIGH RISK
   - Data will be processed in US and India
   - References "Standard Contractual Clauses" but SCCs not attached
   - **Compliance Gap:** Invalid transfer mechanism
   - **Recommendation:** Attach EU SCCs (2021 version) immediately

4. **SUB-PROCESSOR NOTIFICATION (GDPR Art. 28(2))** - MEDIUM RISK
   - Processor can add sub-processors with 5-day notice
   - Industry standard: 30 days
   - **Risk:** Insufficient time for objection
   - **Recommendation:** 30-day notice requirement

5. **DATA RETENTION (GDPR Art. 5(1)(e))** - HIGH RISK
   - Training data retained "for model lifecycle"
   - Model lifecycle undefined (could be 5+ years)
   - **Risk:** Excessive retention
   - **Recommendation:** Max 18 months after model deprecation

**Processing Details:**
- Data Types: Chat logs, customer feedback, support tickets
- Volume: ~2M records/month
- Processor: AI Labs Inc (US-based, EU subsidiary)
- Security: SOC 2 Type II certified

**Positive Elements:**
- Encryption at rest and in transit (AES-256, TLS 1.3)
- Annual audit rights
- Data breach notification within 24 hours
- Right to erasure supported

**EU AI Act Implications:**
- Model likely classifies as "high-risk" under EU AI Act
- Article 10 requirements for training data quality apply
- Must maintain data governance records

**RECOMMENDATION:** BLOCK execution until SCCs attached and purpose/retention explicitly limited. This is a high-risk processing activity requiring strict GDPR compliance.`,
  },
  {
    id: 'doc_017',
    name: 'Independent Contractor Agreement - Content Creator (Brazil).pdf',
    type: 'contract',
    size: '742 KB',
    pages: 12,
    url: '/api/mock-pdf/doc_017',
    risk_level: 'medium',
    key_issues: 3,
    uploaded_at: '2026-03-20T08:15:00Z',
    ai_analysis: `**INDEPENDENT CONTRACTOR AGREEMENT - CONTENT CREATOR**

**Jurisdiction:** Brazil (LGPD applicable)

**Issues Identified:**

1. **MISCLASSIFICATION RISK (Brazilian Labor Law)** - HIGH RISK
   - Contract states "independent contractor" but includes:
     - Fixed working hours (Mon-Fri, 9am-5pm)
     - Company-provided equipment
     - Direct supervision by manager
   - **Risk:** Labor court could reclassify as employment
   - **Financial Exposure:** Back wages, benefits, fines (~R$150K)
   - **Recommendation:** Remove fixed hours, allow equipment flexibility, focus on deliverables not supervision

2. **INTELLECTUAL PROPERTY ASSIGNMENT (§7)** - MEDIUM RISK
   - All content created "during contract term" assigned to company
   - No distinction between work-related and personal projects
   - **Risk:** Contractor may challenge scope
   - **Recommendation:** Limit to "content created for company purposes"

3. **PERSONAL DATA PROCESSING (LGPD)** - MEDIUM RISK
   - Contract involves access to customer data for content creation
   - No LGPD-specific clauses (data security, breach notification)
   - **Compliance Risk:** LGPD Art. 46 violation (controller-processor relationship)
   - **Recommendation:** Add DPA annex with LGPD obligations

**Compensation:**
- Monthly Fee: R$12,000 (approx €2,200)
- Payment: 15th of each month
- Invoicing: Contractor issues RPA (Recibo de Pagamento Autônomo)
- Taxes: Contractor responsible (INSS, IRRF)

**Scope of Work:**
- Social media content (Instagram, LinkedIn, TikTok)
- Blog articles (2 per week)
- Video scripts
- Email newsletters

**Term:**
- Duration: 12 months
- Renewal: Automatic unless 60-day notice
- Termination: Either party, 30 days notice

**Positive Elements:**
- Clear deliverables and metrics
- Reasonable compensation for Brazilian market
- No non-compete (unenforceable in Brazil)
- Standard confidentiality provisions

**LGPD Data Categories:**
- Access to: Customer names, emails, purchase history
- Purpose: Personalized content creation
- Legal Basis: Legitimate interest (marketing)

**RECOMMENDATION:** Modify to reduce misclassification risk by removing fixed hours and supervision language. Add LGPD DPA annex. Otherwise commercially reasonable terms.`,
  },
  {
    id: 'doc_018',
    name: 'Loan Agreement - Bridge Financing (Convertible Note).pdf',
    type: 'agreement',
    size: '1.3 MB',
    pages: 18,
    url: '/api/mock-pdf/doc_018',
    risk_level: 'high',
    key_issues: 4,
    uploaded_at: '2026-03-20T07:00:00Z',
    ai_analysis: `**CONVERTIBLE NOTE PURCHASE AGREEMENT - BRIDGE FINANCING**

**Critical Issues:**

1. **VALUATION CAP ABSENT (§3)** - HIGH RISK
   - Note converts at Series A price with 20% discount
   - No valuation cap specified
   - **Risk:** If Series A values company at $100M, note converts at $80M valuation
   - **Investor Expectation:** Cap at $15-25M for bridge round
   - **Recommendation:** Add $20M valuation cap

2. **MATURITY DATE (§2.3)** - HIGH RISK
   - Note matures in 12 months
   - If no Series A by maturity, note becomes debt due immediately
   - **Risk:** Forced repayment could bankrupt company
   - **Recommendation:** Add automatic 12-month extension or mandatory conversion

3. **MOST FAVORED NATION (MFN) ABSENT** - MEDIUM RISK
   - If subsequent bridge notes have better terms, this investor doesn't benefit
   - **Investor Protection:** MFN clause standard in bridge rounds
   - **Recommendation:** Add MFN provision

4. **BOARD OBSERVER RIGHTS (§6)** - MEDIUM RISK
   - Note holder gets board observer seat
   - No confidentiality obligations specified
   - **Risk:** Sensitive information leakage
   - **Recommendation:** Add standard board observer confidentiality

**Financial Terms:**
- Principal: $750,000
- Interest Rate: 8% per annum (reasonable for bridge)
- Discount: 20% on Series A price
- No Valuation Cap (problematic - see above)

**Conversion Mechanics:**
- Automatic conversion upon Series A ≥$3M
- Optional conversion by holder upon acquisition
- Mandatory repayment upon maturity if no qualified financing

**Positive Elements:**
- Pro rata rights in Series A (standard)
- Information rights (quarterly financials)
- No participation cap (investor-friendly)
- Clean cap table representation

**Use of Proceeds:**
- Product development: 60%
- Marketing/sales: 30%
- Working capital: 10%

**Investor Profile:**
- Strategic angel with industry expertise
- Previously invested in two successful exits
- Non-competing portfolio companies

**RECOMMENDATION:** Strong strategic investor but terms need work. Must add valuation cap ($20M) and maturity extension mechanism. Without cap, this could be very dilutive to founders if Series A at high valuation.`,
  },
  {
    id: 'doc_019',
    name: 'Telemedicine Service Agreement - Healthcare Provider.pdf',
    type: 'agreement',
    size: '2.4 MB',
    pages: 34,
    url: '/api/mock-pdf/doc_019',
    risk_level: 'high',
    key_issues: 5,
    uploaded_at: '2026-03-19T16:45:00Z',
    ai_analysis: `**TELEMEDICINE SERVICE AGREEMENT - HEALTHCARE PROVIDER**

**Critical Issues:**

1. **HIPAA COMPLIANCE (§9)** - HIGH RISK
   - Agreement references HIPAA but Business Associate Agreement (BAA) not attached
   - **Regulatory Risk:** HIPAA violation ($1.5M potential fine)
   - **Requirement:** BAA must be signed before any PHI transmission
   - **Recommendation:** Execute BAA immediately as separate document

2. **STANDARD OF CARE (§4.2)** - HIGH RISK
   - Agreement states telemedicine uses "commercially reasonable efforts"
   - Medical standard is "standard of care" not commercial reasonableness
   - **Liability Risk:** Insufficient for medical malpractice insurance
   - **Recommendation:** Change to "applicable standard of care" language

3. **PRESCRIPTION AUTHORITY (§5.3)** - HIGH RISK
   - Platform permits prescribing controlled substances
   - No verification of DEA requirements or state-specific rules
   - **Regulatory Risk:** Ryan Haight Act violations (federal crime)
   - **Recommendation:** Block controlled substances or add robust verification

4. **CROSS-STATE LICENSURE (§6)** - HIGH RISK
   - Physicians can treat patients in any state
   - No verification of multi-state licensure
   - **Risk:** Practicing medicine without license (criminal + civil)
   - **Recommendation:** Add licensure verification for each state served

5. **MEDICAL RECORDS RETENTION (§11)** - MEDIUM RISK
   - Records retained for "3 years after last visit"
   - State requirements vary: 5-10 years common
   - **Risk:** Regulatory violation + litigation risk
   - **Recommendation:** 10 years minimum, longer for minors

**Service Terms:**
- Platform Fee: $15 per completed consultation
- Volume: Estimated 2,000 consultations/month
- Monthly Cost: ~$30,000
- Provider Reimbursement: $45 per visit

**Technology:**
- Video Platform: HIPAA-compliant (vendor certified)
- EHR Integration: HL7 FHIR standard
- Encryption: End-to-end, AES-256
- Backup: Daily, geo-redundant

**Positive Elements:**
- Professional liability insurance required ($1M/$3M)
- Credentialing process defined
- Patient consent procedures documented
- Emergency protocol established

**Insurance:**
- Platform has $5M cyber liability
- $10M general liability
- Provider must carry own malpractice

**RECOMMENDATION:** BLOCK until HIPAA BAA executed and standard of care language corrected. Cross-state licensure and prescription authority issues must be resolved. This is a heavily regulated service requiring strict compliance.`,
  },
  {
    id: 'doc_020',
    name: 'Influencer Marketing Agreement - Social Media Campaign.pdf',
    type: 'agreement',
    size: '567 KB',
    pages: 8,
    url: '/api/mock-pdf/doc_020',
    risk_level: 'low',
    key_issues: 2,
    uploaded_at: '2026-03-19T14:20:00Z',
    ai_analysis: `**INFLUENCER MARKETING AGREEMENT**

**Campaign:** Product launch promotion across Instagram, TikTok, YouTube

**Minor Issues:**

1. **FTC DISCLOSURE (§4.1)** - MEDIUM RISK
   - Agreement requires "disclosure of partnership"
   - Language not specific to FTC requirements
   - **Risk:** FTC Guides violations (16 CFR Part 255)
   - **Recommendation:** Specify "#ad" or "#sponsored" placement requirements
   - **Best Practice:** Pre-approval of disclosure language

2. **USAGE RIGHTS (§6)** - LOW RISK
   - Brand can use influencer content "in perpetuity"
   - No geographic limitations
   - **Issue:** Influencer may regret unlimited rights
   - **Recommendation:** Limit to 24 months and specified territories

**Campaign Terms:**
- Compensation: $25,000 (10 posts + 5 stories)
- Payment: 50% upfront, 50% upon completion
- Deliverables:
  - 6 Instagram feed posts
  - 4 Instagram stories
  - 2 TikTok videos (short form)
  - 1 YouTube integration (dedicated segment)

**Content Requirements:**
- Brand approval required (48-hour turnaround)
- Product must be featured prominently
- Specific talking points provided
- Authentic voice maintained (good balance)

**Performance Metrics:**
- Minimum reach: 500K combined impressions
- Engagement rate: No minimum (realistic)
- Analytics provided within 7 days

**Exclusivity:**
- 90-day exclusivity for competing products
- Category: Skincare brands only (well-defined)
- No blanket non-compete

**Positive Elements:**
- Clear deliverable schedule
- Reasonable approval process
- Fair compensation for follower count (250K followers)
- No requirement to misrepresent product experience
- Creative control maintained

**Cancellation:**
- Either party: 14-day notice before campaign start
- After start: Prorated payment for completed work

**RECOMMENDATION:** Approve with FTC disclosure specifications added to §4.1. Otherwise clean, fair agreement for both parties. Usage rights could be negotiated down but not material issue.`,
  },
  {
    id: 'doc_021',
    name: 'Subscription Agreement - SaaS Platform (Enterprise).pdf',
    type: 'agreement',
    size: '1.7 MB',
    pages: 22,
    url: '/api/mock-pdf/doc_021',
    risk_level: 'medium',
    key_issues: 3,
    uploaded_at: '2026-03-19T11:30:00Z',
    ai_analysis: `**ENTERPRISE SAAS SUBSCRIPTION AGREEMENT**

**Issues Identified:**

1. **PRICE ESCALATION (§3.4)** - MEDIUM RISK
   - Annual price increase: Greater of 8% or CPI + 2%
   - In current environment, could mean 10%+ annual increases
   - **Cost Projection:** $240K Year 1 → $290K+ Year 3
   - **Recommendation:** Cap at 6% annually or CPI only

2. **DATA PORTABILITY (§8.2)** - MEDIUM RISK
   - Upon termination, data export in "standard format"
   - Format not specified (CSV, JSON, API?)
   - Export window: 30 days only
   - **Risk:** Vendor lock-in, difficult migration
   - **Recommendation:** Specify format (JSON via API), extend to 90 days

3. **SERVICE LEVEL AGREEMENT (§5)** - LOW RISK
   - SLA: 99.5% uptime (acceptable but not premium)
   - Service credits: 10% of monthly fee per 1% below SLA
   - **Issue:** Max credits capped at 50% of monthly fee
   - **Gap:** Doesn't cover extended outages adequately
   - **Recommendation:** Remove cap or add termination right if <98% for 2 consecutive months

**Subscription Terms:**
- License Type: Enterprise, unlimited named users
- Annual Fee: $240,000/year (paid annually in advance)
- Contract Term: 3 years
- Payment: Net 30 from invoice

**Included Services:**
- Platform access (web + mobile)
- 24/7 email support
- Business hours phone support
- Quarterly business reviews
- Dedicated customer success manager

**Technical Specifications:**
- API Access: RESTful, rate limited to 10K requests/hour
- Integration: Pre-built connectors (Salesforce, HubSpot, Slack)
- Data Residency: EU region (GDPR-compliant)
- Security: SOC 2 Type II, ISO 27001

**Positive Elements:**
- No user minimums or maximums
- Free training for up to 50 users
- Sandbox environment included
- Quarterly feature releases
- 99.5% uptime SLA (industry standard)

**Exit Strategy:**
- 90-day termination notice required
- Early termination fee: 50% of remaining contract value
- Data retention: 30 days post-termination

**RECOMMENDATION:** Negotiate price escalation cap and data portability details. Otherwise solid enterprise agreement with standard terms. Service credit cap should be addressed but not a dealbreaker.`,
  },
  {
    id: 'doc_022',
    name: 'Arbitration Agreement - Dispute Resolution Addendum.pdf',
    type: 'agreement',
    size: '423 KB',
    pages: 6,
    url: '/api/mock-pdf/doc_022',
    risk_level: 'medium',
    key_issues: 2,
    uploaded_at: '2026-03-19T09:50:00Z',
    ai_analysis: `**ARBITRATION AGREEMENT - DISPUTE RESOLUTION**

**Context:** Addendum to existing Master Services Agreement

**Issues Identified:**

1. **CLASS ACTION WAIVER (§2.4)** - MEDIUM RISK
   - Waives right to participate in class actions
   - In some jurisdictions (e.g., California) may be unenforceable
   - **Risk:** Challenged in court, agreement invalidated
   - **Consideration:** For consumer contracts, class waivers highly scrutinized
   - **Note:** This is B2B, so lower risk than consumer context

2. **ARBITRATION COSTS (§4)** - MEDIUM RISK
   - Each party pays own costs + splits arbitrator fees
   - Arbitrator fees: $8,000-$15,000 typical
   - **Issue:** For smaller claims (<$50K), arbitration more expensive than court
   - **Recommendation:** Company pays arbitrator fees for claims <$100K

**Arbitration Terms:**
- Provider: International Chamber of Commerce (ICC)
- Seat: Frankfurt, Germany
- Language: English
- Rules: ICC Arbitration Rules 2021
- Arbitrator: Single arbitrator (claims <$500K), three arbitrators (above)

**Scope:**
- All disputes arising from or related to the Agreement
- Excludes: Intellectual property disputes (can seek injunction in court)
- Excludes: Emergency injunctive relief

**Process:**
- Notice: 30-day informal negotiation required before filing
- Discovery: Limited (document production, depositions restricted)
- Timeline: Award within 6 months of arbitrator appointment (expedited)

**Confidentiality:**
- Entire arbitration confidential (good)
- Award confidential (good)
- Exception: Enforcement of award

**Positive Elements:**
- Respected arbitration forum (ICC)
- Single arbitrator option for smaller disputes (cost-effective)
- Expedited timeline (faster than litigation)
- Confidentiality protects business interests
- Right to seek injunction preserved for IP

**Cost Comparison:**
- Arbitration: $50K-$150K (including attorneys)
- Litigation: $100K-$500K+ (trial)
- Appeal: Arbitration awards rarely appealable (finality)

**RECOMMENDATION:** Acceptable dispute resolution mechanism for B2B context. Consider paying arbitrator fees for smaller claims to show good faith. Class action waiver likely enforceable given B2B nature but monitor jurisdictional developments.`,
  },
  {
    id: 'doc_023',
    name: 'Mutual Non-Disclosure Agreement - Technology Partnership.pdf',
    type: 'nda',
    size: '534 KB',
    pages: 7,
    url: '/api/mock-pdf/doc_002', // Reusing existing NDA PDF
    risk_level: 'medium',
    key_issues: 2,
    uploaded_at: '2026-03-20T10:45:00Z',
    ai_analysis: `**MUTUAL NDA - TECHNOLOGY PARTNERSHIP**

**Issues Identified:**

1. **RESIDUAL INFORMATION CLAUSE (§3.4)** - MEDIUM RISK
   - Permits use of "residual information retained in unaided memory"
   - This effectively creates unlimited license to use disclosed information
   - **Risk:** Trade secrets could be used without compensation
   - **Recommendation:** Delete residual information clause entirely or limit to non-trade secret information

2. **INJUNCTIVE RELIEF (§6.2)** - LOW RISK
   - States breaches "may cause irreparable harm"
   - Some courts require proof, not just allegation
   - **Recommendation:** Change to "will cause irreparable harm" (stronger)

**NDA Terms:**
- Type: Mutual (both parties disclose and receive)
- Term: 3 years from effective date
- Survival: Confidentiality obligations survive 5 years post-termination
- Purpose: Evaluation of potential technology integration partnership

**Confidential Information:**
- Technical specifications
- Source code and algorithms
- Customer lists and pricing
- Business plans and strategies
- Financial information

**Exclusions (Standard):**
- Publicly available information
- Independently developed information
- Previously known information
- Disclosed with owner's consent
- Required by law/regulation

**Positive Elements:**
- Balanced mutual obligations
- Clear definition of confidential information
- Standard exclusions present
- Return of materials clause (30 days)
- No non-compete or non-solicit
- Reasonable term and survival periods

**Use Restrictions:**
- Only for evaluation purpose
- No reverse engineering
- No copying except as necessary
- Must implement reasonable security measures

**RECOMMENDATION:** Approve with deletion of residual information clause. Otherwise standard mutual NDA with reasonable terms for technology evaluation.`,
  },
  {
    id: 'doc_024',
    name: 'Employee Handbook & Workplace Policy - 2026 Edition.pdf',
    type: 'policy',
    size: '2.1 MB',
    pages: 48,
    url: '/api/mock-pdf/doc_014', // Reusing existing policy PDF
    risk_level: 'high',
    key_issues: 4,
    uploaded_at: '2026-03-20T10:30:00Z',
    ai_analysis: `**EMPLOYEE HANDBOOK - WORKPLACE POLICY REVIEW**

**Critical Issues:**

1. **SOCIAL MEDIA POLICY (§12)** - HIGH RISK
   - Prohibits "negative comments about company on social media"
   - **Legal Risk:** Violates NLRA Section 7 (protected concerted activity)
   - In EU: Violates freedom of expression protections
   - **Recommendation:** Narrow to prohibit disclosure of confidential information only, not general criticism

2. **MONITORING & PRIVACY (§9)** - HIGH RISK
   - States "no expectation of privacy in company systems"
   - No specific disclosure of monitoring methods
   - **GDPR Issue:** Article 88 requires transparency about employee monitoring
   - **Recommendation:** Specify what is monitored (email, internet, keystrokes) and for what purposes

3. **DISCRIMINATION POLICY (§4.2)** - MEDIUM RISK
   - Lists protected classes but omits several EU-required categories
   - Missing: Gender identity, genetic information, family status
   - **Compliance Risk:** Incomplete anti-discrimination policy
   - **Recommendation:** Align with EU Equality Directive 2000/78/EC

4. **LEAVE POLICIES (§8)** - MEDIUM RISK
   - Parental leave: 12 weeks unpaid
   - EU Directive 2019/1158 requires minimum 4 months paid parental leave
   - **Compliance Gap:** Below statutory minimum
   - **Recommendation:** Update to 18 weeks paid parental leave (EU standard)

**Positive Elements:**
- Clear anti-harassment procedures
- Whistleblower protection policy
- Health and safety procedures
- Data protection responsibilities
- Remote work policy (flexible)
- Professional development support

**GDPR Compliance:**
- Employee data processing notice included
- Data subject rights explained
- Retention periods specified (mostly compliant)
- Issue: Monitoring policy insufficient (see above)

**Work Environment:**
- Working hours: 40 hours/week standard
- Overtime: Compensated for non-exempt employees
- Flexible work: Available with manager approval
- Equipment: Company-provided laptop and phone

**Compensation & Benefits:**
- Annual performance reviews
- Merit increase eligibility
- Health insurance (fully covered)
- Pension: 5% employer contribution
- 25 days annual leave (EU compliant)

**Code of Conduct:**
- Professional behavior standards
- Conflict of interest disclosure
- Gift policy (max €50)
- Anti-bribery compliance

**RECOMMENDATION:** BLOCK distribution until social media policy corrected (NLRA violation risk) and monitoring policy enhanced (GDPR). Parental leave should be updated before next hiring cycle. Discrimination policy needs expansion.`,
  },
  {
    id: 'doc_025',
    name: 'Website Terms of Use - E-Commerce Platform.pdf',
    type: 'terms',
    size: '892 KB',
    pages: 18,
    url: '/api/mock-pdf/doc_007', // Reusing existing terms PDF
    risk_level: 'medium',
    key_issues: 3,
    uploaded_at: '2026-03-20T10:15:00Z',
    ai_analysis: `**TERMS OF USE - E-COMMERCE PLATFORM**

**Issues Identified:**

1. **LIMITATION OF LIABILITY (§11)** - MEDIUM RISK
   - Excludes "all liability for any damages"
   - In EU, cannot exclude liability for death, personal injury, fraud
   - **Legal Risk:** Unfair Contract Terms Directive 93/13/EEC
   - **Recommendation:** Carve out non-excludable liabilities under EU law

2. **AUTOMATIC RENEWAL (§4.3)** - MEDIUM RISK
   - Premium subscriptions auto-renew unless cancelled 7 days prior
   - EU Consumer Rights Directive requires 30 days notice
   - **Compliance Risk:** Unfair commercial practice
   - **Recommendation:** Change to 30-day cancellation window

3. **JURISDICTION CLAUSE (§14)** - LOW RISK
   - Exclusive jurisdiction: Delaware courts
   - For EU consumers, must allow claims in consumer's home country
   - **Risk:** Unenforceable for EU consumers
   - **Recommendation:** Add exception for EU consumers per Rome I Regulation

**Service Description:**
- E-commerce marketplace platform
- Connects buyers and sellers
- Platform facilitates transactions but is not party to sales
- Payment processing via third-party provider

**User Accounts:**
- Registration required for purchases
- Users must be 18+ (GDPR compliant)
- Account termination: Platform discretion with 30-day notice
- User can close account anytime

**Fees & Payment:**
- Free: Basic browsing and purchasing
- Premium: €9.99/month (seller features)
- Transaction fees: 2.5% + €0.30 per sale
- Payment methods: Credit card, PayPal, bank transfer

**Content Policy:**
- User-generated content (product listings, reviews)
- Platform has moderation rights
- Users retain ownership of content
- Platform gets license to display/promote

**Prohibited Items:**
- Illegal goods
- Counterfeit products
- Hazardous materials
- Age-restricted items without verification

**Dispute Resolution:**
- Platform offers mediation (optional)
- EU Online Dispute Resolution link provided (good)
- Arbitration clause (see jurisdiction issue above)

**Positive Elements:**
- Clear fee structure
- EU ODR platform link included
- Right to return goods (14 days, EU compliant)
- Privacy Policy linked and GDPR-compliant
- Seller verification process
- Content moderation transparency

**Consumer Rights (EU):**
- 14-day cooling-off period (compliant)
- Right to refund (compliant)
- Faulty goods warranty (compliant)
- Issue: Cancellation notice period too short (see above)

**RECOMMENDATION:** Update limitation of liability, auto-renewal notice period, and jurisdiction clauses for EU compliance. Otherwise solid terms with good consumer protections. Priority: Fix 7-day cancellation to 30-day before EU consumer complaints.`,
  },
  {
    id: 'doc_026',
    name: 'Confidentiality & Non-Compete Agreement - Senior Position.pdf',
    type: 'nda',
    size: '678 KB',
    pages: 9,
    url: '/api/mock-pdf/doc_002', // Reusing existing NDA PDF
    risk_level: 'high',
    key_issues: 3,
    uploaded_at: '2026-03-20T10:00:00Z',
    ai_analysis: `**CONFIDENTIALITY & NON-COMPETE AGREEMENT**

**Critical Issues:**

1. **NON-COMPETE SCOPE (§4)** - HIGH RISK
   - Duration: 24 months post-termination
   - Geography: Entire European Union
   - Industry: "Technology sector" (extremely broad)
   - **Enforceability:** Likely unenforceable in most EU jurisdictions
   - German law: 6-12 months max, requires compensation
   - French law: Limited in scope/duration, requires necessity
   - UK: Must be reasonable to protect legitimate interests
   - **Recommendation:** Narrow to 6 months, specific geographic markets where company operates, specific product categories

2. **NON-SOLICITATION (§5)** - MEDIUM RISK
   - Prohibits soliciting any "employee or contractor"
   - No limitation to employees worked with
   - **Risk:** Overly broad, may be unenforceable
   - **Recommendation:** Limit to employees directly worked with or senior employees

3. **LIQUIDATED DAMAGES (§7)** - MEDIUM RISK
   - Breach triggers automatic €100,000 liquidated damages
   - Not tied to actual harm
   - **Risk:** May be viewed as penalty (unenforceable)
   - **Recommendation:** Make damages reasonable estimate of harm or remove

**Confidentiality Terms:**
- Standard confidentiality provisions (reasonable)
- Scope: Trade secrets, customer lists, business strategies
- Duration: Indefinite for trade secrets (appropriate)
- Return of materials: 5 days (tight but acceptable)

**Compensation:**
- No compensation during non-compete period
- **Issue:** Some EU countries require compensation for enforceable non-compete
- Germany: 50% of last salary required
- **Recommendation:** Add compensation clause for enforceability

**Position Context:**
- Role: Senior Software Architect
- Access to: Proprietary algorithms, roadmap, customer data
- Legitimate interest in protection: YES

**Trade Secret Protection:**
- Clear identification of trade secrets (good)
- Reasonable security requirements
- Limited disclosure provisions

**Jurisdiction:**
- Governed by German law
- German courts have exclusive jurisdiction
- **Note:** German law strictly limits non-competes

**RECOMMENDATION:** BLOCK execution in current form. Non-compete is unenforceable under German law without 6-month limitation and 50% salary compensation. Overly broad scope makes it vulnerable to challenge. Redraft to comply with German Employment Act (BGB §§ 74-75) before having employee sign.`,
  },
  {
    id: 'doc_027',
    name: 'Privacy Policy - Mobile Gaming App (COPPA & GDPR).pdf',
    type: 'policy',
    size: '1.2 MB',
    pages: 16,
    url: '/api/mock-pdf/doc_014', // Reusing existing policy PDF
    risk_level: 'high',
    key_issues: 4,
    uploaded_at: '2026-03-20T09:45:00Z',
    ai_analysis: `**PRIVACY POLICY - MOBILE GAMING APP**

**Critical Issues:**

1. **CHILDREN'S DATA (COPPA)** - HIGH RISK
   - App marketed to ages 8-12 demographic
   - No verifiable parental consent mechanism
   - Collects: Device ID, in-app behavior, geolocation
   - **COPPA Violation:** 15 USC 6501-6506 requires parental consent for <13
   - **FTC Penalty:** Up to $50,000 per violation
   - **Recommendation:** Implement parent email verification before data collection

2. **THIRD-PARTY SHARING (GDPR Art. 13)** - HIGH RISK
   - Shares data with "advertising partners"
   - Partners not named or categorized
   - **GDPR Violation:** Transparency requirement
   - No consent mechanism for marketing
   - **Recommendation:** Name partners, obtain explicit consent

3. **IN-APP PURCHASES (FTC)** - MEDIUM RISK
   - No mention of parental controls for purchases
   - Virtual currency can be purchased
   - **Risk:** FTC Section 5 unfair practices
   - Children could make unauthorized purchases
   - **Recommendation:** Require parental authorization for all purchases by child accounts

4. **DATA RETENTION (GDPR Art. 5(1)(e))** - MEDIUM RISK
   - Data retained "for duration of account"
   - Children's accounts could exist indefinitely
   - **Best Practice:** Delete inactive child accounts after 12 months
   - **Recommendation:** Add automatic deletion policy

**Data Collected:**
- Personal Data: Name, email (parent), age
- Device Data: Device ID, IP address, OS version
- Usage Data: Game progress, in-app behavior, session duration
- Location: Approximate location (city-level)
- Sensitive: None (good)

**Legal Bases (GDPR):**
- Consent: For marketing and analytics
- Contract: For providing game service
- Legitimate Interest: For fraud prevention
- **Issue:** Consent not implemented properly for children

**Age Verification:**
- Age gate: Date of birth required at signup
- **Problem:** Easily bypassed by children
- No neutral age verification
- **Recommendation:** Implement facial age estimation or ID verification

**Parental Rights:**
- Right to access child's data
- Right to delete child's account
- **Issue:** No verification of parent identity
- **Risk:** Account hijacking

**Positive Elements:**
- No sale of children's data
- Encryption in transit (TLS)
- No behavioral advertising to children
- Clear privacy policy language (readable)

**Monetization:**
- In-app purchases (virtual currency)
- Optional ads for adult users only
- No forced ads for children (good)

**RECOMMENDATION:** BLOCK app launch until COPPA compliance implemented. This is a high-risk violation with significant FTC penalties. Must implement verifiable parental consent, third-party partner transparency, and purchase controls before release.`,
  },
  {
    id: 'doc_028',
    name: 'Cloud Infrastructure Agreement - Multi-Cloud Strategy.pdf',
    type: 'agreement',
    size: '2.7 MB',
    pages: 38,
    url: '/api/mock-pdf/doc_028',
    risk_level: 'high',
    key_issues: 4,
    uploaded_at: '2026-03-20T11:30:00Z',
    ai_analysis: `**CLOUD INFRASTRUCTURE AGREEMENT - MULTI-CLOUD**

**Critical Issues:**

1. **VENDOR LOCK-IN (§7.3)** - HIGH RISK
   - Proprietary APIs and tooling throughout
   - Migration path not defined
   - **Cost:** Estimated $2M+ to migrate away
   - **Recommendation:** Require containerization standards (Kubernetes), open APIs

2. **DATA EGRESS FEES (§5.2)** - HIGH RISK
   - $0.12/GB for data transfer out
   - Current usage: 50TB/month = $6,000/month egress
   - No cap on egress costs
   - **Financial Risk:** Could spike during migration or failover
   - **Recommendation:** Negotiate cap at $10K/month or free egress for migration

3. **UPTIME CREDITS (§9.1)** - MEDIUM RISK
   - 99.95% SLA but credits only for downtime >1 hour continuous
   - Multiple 55-minute outages wouldn't trigger credits
   - **Gap:** Doesn't cover frequent short outages
   - **Recommendation:** Aggregate monthly downtime for credit calculation

4. **SECURITY INCIDENT RESPONSE (§11)** - HIGH RISK
   - Vendor notifies "as soon as reasonably practical"
   - No specific timeframe (24/48/72 hours)
   - GDPR requires 72-hour breach notification
   - **Recommendation:** 24-hour notification requirement

**Pricing:**
- Compute: $0.08/hour per vCPU
- Storage: $0.10/GB/month (SSD)
- Bandwidth: $0.12/GB egress
- Support: 15% of monthly bill (Premium tier)
- **Total Estimated:** $45K/month base + egress

**Technical Requirements:**
- Regions: 5 availability zones minimum
- Backup: Automated daily, 30-day retention
- Disaster Recovery: RPO 1 hour, RTO 4 hours
- Monitoring: Real-time dashboards included
- Compliance: SOC 2, ISO 27001, GDPR-compliant

**Positive Elements:**
- Auto-scaling included
- Load balancing no additional cost
- 24/7 technical support
- Quarterly architecture reviews

**RECOMMENDATION:** High risk due to vendor lock-in and egress costs. Negotiate egress cap and migration provisions before signing. Security notification timeline must be explicit.`,
  },
  {
    id: 'doc_029',
    name: 'Research & Development Collaboration Agreement - University Partnership.pdf',
    type: 'agreement',
    size: '1.8 MB',
    pages: 24,
    url: '/api/mock-pdf/doc_029',
    risk_level: 'medium',
    key_issues: 3,
    uploaded_at: '2026-03-20T11:15:00Z',
    ai_analysis: `**R&D COLLABORATION AGREEMENT - UNIVERSITY PARTNERSHIP**

**Issues Identified:**

1. **IP OWNERSHIP (§6)** - MEDIUM RISK
   - University retains ownership of all "background IP"
   - Foreground IP (developed during collaboration) jointly owned
   - **Issue:** Joint ownership creates commercialization complexity
   - Each party needs other's consent to license
   - **Recommendation:** Company should have exclusive commercialization rights with royalty to university

2. **PUBLICATION RIGHTS (§8.2)** - MEDIUM RISK
   - University can publish research results after 60-day review period
   - **Risk:** Premature disclosure of trade secrets
   - Company can request publication delay but only once for 90 days
   - **Recommendation:** Extend initial review to 90 days, allow multiple delays for patent filings

3. **STUDENT ASSIGNMENT (§4.1)** - LOW RISK
   - University assigns PhD students to project
   - No guarantee of student continuity
   - **Risk:** Knowledge loss if students graduate mid-project
   - **Recommendation:** Require overlapping assignments, knowledge transfer protocols

**Collaboration Terms:**
- Duration: 3 years
- Company Contribution: €450,000 (€150K/year)
- University Contribution: Lab space, equipment, 3 PhD students
- Principal Investigator: Prof. Dr. Schmidt (renowned in field)

**Research Objectives:**
- Development of novel AI algorithms for healthcare diagnostics
- Training datasets from company's clinical data
- Target: Publishable results, potential patent applications

**Governance:**
- Joint Steering Committee (quarterly meetings)
- Technical Working Group (monthly)
- Company has observer seat in research team meetings

**Deliverables:**
- Quarterly progress reports
- Annual technical milestones
- Final research report and code repository
- Joint publications (subject to approval)

**IP Strategy:**
- Background IP: Each party retains ownership
- Foreground IP: Joint ownership (problematic - see above)
- Company has first right to commercialize
- University gets royalty: 3% of net revenue (reasonable)

**Positive Elements:**
- Access to world-class research facilities
- Collaboration with leading researchers
- PhD talent pipeline
- Brand association with prestigious university
- Grant funding opportunities

**Data Sharing:**
- Company provides anonymized clinical datasets
- Data use limited to research purposes
- GDPR compliance protocols in place
- Data destroyed after project completion

**RECOMMENDATION:** Approve with amendments to IP commercialization rights and publication review periods. Overall strong partnership opportunity with acceptable risk profile.`,
  },
  {
    id: 'doc_030',
    name: 'Executive Employment Contract - C-Level Position (Stock Options).pdf',
    type: 'contract',
    size: '1.5 MB',
    pages: 22,
    url: '/api/mock-pdf/doc_030',
    risk_level: 'low',
    key_issues: 2,
    uploaded_at: '2026-03-20T11:00:00Z',
    ai_analysis: `**EXECUTIVE EMPLOYMENT CONTRACT - C-LEVEL**

**Position:** Chief Technology Officer (CTO)

**Minor Issues:**

1. **CHANGE OF CONTROL (§9.3)** - LOW RISK
   - Single-trigger acceleration of 50% unvested equity
   - Standard is double-trigger (acquisition + termination)
   - **Risk:** Expensive if company acquired
   - Example: 1M options, 60% unvested = 300K shares accelerate immediately
   - **Recommendation:** Change to double-trigger (industry standard)

2. **CLAWBACK PROVISION (§7.4)** - LOW RISK
   - Clawback of bonus if financial restatement
   - No time limit specified
   - **Issue:** Could apply to bonuses paid years ago
   - **Recommendation:** Limit to 3 years (Dodd-Frank standard)

**Compensation Package:**
- Base Salary: €280,000/year
- Target Bonus: 50% of base (€140K) based on company + individual performance
- Stock Options: 1,000,000 shares at €1.00/share strike price
- Benefits: Full executive package

**Equity Details:**
- Vesting: 4-year vest, 1-year cliff
- Acceleration: 50% on change of control (see issue above)
- Exercise Period: 10 years from grant
- Early Exercise: Permitted with 83(b) election

**Severance:**
- Termination without Cause: 12 months salary + prorated bonus
- Resignation for Good Reason: 12 months salary + prorated bonus
- Change of Control: 18 months salary + full year bonus (generous)

**Non-Compete:**
- Duration: 12 months post-termination
- Geography: Territories where company operates
- Compensation: Full salary during non-compete period (excellent)
- **Enforceability:** Likely enforceable with compensation

**Relocation:**
- Relocation package: €50,000
- Temporary housing: 3 months
- Travel allowance: Business class for family visits

**Perks:**
- Company car allowance: €1,200/month
- Professional development: €10,000/year
- Technology budget: €5,000/year
- Executive coaching: Provided

**Positive Elements:**
- Competitive compensation for tech sector
- Strong equity package (1M options significant)
- Generous severance protections
- Non-compete is reasonable with full pay
- Clear performance metrics for bonus
- Comprehensive benefits package

**Performance Metrics:**
- Technical roadmap execution
- Team building and retention
- Product launch milestones
- Technology cost optimization
- Innovation and patent generation

**RECOMMENDATION:** Approve with change to double-trigger equity acceleration. Otherwise excellent executive package competitive for senior tech talent. Clawback time limit is minor issue.`,
  },
  {
    id: 'doc_031',
    name: 'Cybersecurity Insurance Policy - Data Breach Coverage.pdf',
    type: 'policy',
    size: '3.1 MB',
    pages: 52,
    url: '/api/mock-pdf/doc_031',
    risk_level: 'high',
    key_issues: 5,
    uploaded_at: '2026-03-20T10:50:00Z',
    ai_analysis: `**CYBERSECURITY INSURANCE POLICY REVIEW**

**Critical Issues:**

1. **EXCLUSIONS - SOCIAL ENGINEERING (§8.4)** - HIGH RISK
   - Policy excludes losses from "voluntary transfer of funds"
   - This excludes business email compromise (BEC) attacks
   - **Gap:** BEC is #1 cyber threat (FBI: $2.4B losses annually)
   - **Recommendation:** Add social engineering coverage endorsement ($50K-$200K sublimit)

2. **WAITING PERIOD (§4.2)** - HIGH RISK
   - 72-hour waiting period for incident response costs
   - **Problem:** Response must begin immediately for breach containment
   - Insurer must pre-approve vendors
   - **Recommendation:** Eliminate waiting period, pre-approve vendor list

3. **RETROACTIVE DATE (§2.1)** - HIGH RISK
   - Policy only covers breaches discovered after effective date
   - No prior acts coverage
   - **Risk:** Undiscovered breaches from past may not be covered
   - **Recommendation:** Negotiate 12-month retroactive date

4. **RANSOMWARE EXCLUSION (§8.7)** - HIGH RISK
   - Policy excludes ransomware payments
   - Covers investigation but not ransom
   - **Industry Trend:** Ransom coverage increasingly standard
   - **Recommendation:** Add ransomware sublimit ($250K minimum)

5. **PCI DSS COMPLIANCE REQUIREMENT (§11.3)** - MEDIUM RISK
   - Policy requires annual PCI DSS attestation
   - Non-compliance voids coverage
   - **Risk:** Many companies struggle with PCI compliance
   - **Recommendation:** Ensure current compliance before binding

**Coverage Limits:**
- Aggregate Limit: €5,000,000/year
- Per Incident Limit: €2,000,000
- Crisis Management: €500,000 sublimit
- Business Interruption: €1,000,000 sublimit
- Regulatory Fines: €500,000 sublimit (where insurable)

**Premium:**
- Annual Premium: €68,000
- Deductible: €25,000 per incident
- **Cost Analysis:** 1.36% of coverage limit (competitive)

**Covered Costs:**
- Incident response and forensics
- Legal counsel and notification costs
- Credit monitoring for affected individuals
- Public relations and crisis management
- Regulatory defense costs
- Business interruption losses
- Cyber extortion response (but not ransom payment)

**Not Covered:**
- Infrastructure improvements
- Routine security assessments
- Lost intellectual property value
- Betterment (upgrades beyond restoration)
- Acts of war or terrorism

**Risk Assessment Required:**
- Annual penetration testing
- Security awareness training
- Multi-factor authentication
- Encrypted data at rest and in transit
- Incident response plan
- **Compliance:** Company must maintain these controls

**Claims Process:**
- 24/7 incident hotline
- Immediate vendor dispatch
- 48-hour preliminary report
- Insurer right to appoint legal counsel
- Consent to settle required >€100K

**Positive Elements:**
- Broad coverage definition
- Pre-breach services included (annual security assessment)
- No geographic restrictions
- Regulatory defense costs covered
- Business interruption with 8-hour wait period (good)

**GDPR Considerations:**
- Regulatory fines sublimit: €500K
- **Gap:** GDPR fines can reach €20M or 4% of revenue
- Most insurers won't cover intentional GDPR violations
- Coverage for "unintentional" violations only

**RECOMMENDATION:** Policy has significant gaps in ransomware, social engineering, and prior acts coverage. These are critical exposures. Negotiate enhanced coverage or accept higher risk. PCI compliance requirement is strict - ensure you can maintain it.`,
  },
  {
    id: 'doc_032',
    name: 'M&A - Letter of Intent (LOI) - Strategic Acquisition.pdf',
    type: 'agreement',
    size: '892 KB',
    pages: 12,
    url: '/api/mock-pdf/doc_032',
    risk_level: 'medium',
    key_issues: 3,
    uploaded_at: '2026-03-20T10:35:00Z',
    ai_analysis: `**LETTER OF INTENT - STRATEGIC ACQUISITION**

**Transaction:** Acquisition of 100% equity interest in target company

**Issues Identified:**

1. **BINDING VS NON-BINDING (§12)** - MEDIUM RISK
   - LOI states "non-binding except for §9 (Exclusivity) and §10 (Confidentiality)"
   - **Issue:** Price term language could be interpreted as binding
   - Uses "shall acquire" instead of "intends to acquire"
   - **Risk:** Seller could claim binding obligation to close at stated price
   - **Recommendation:** Clarify all commercial terms are non-binding, only exclusivity/confidentiality bind parties

2. **EXCLUSIVITY PERIOD (§9)** - MEDIUM RISK
   - 90-day exclusive negotiation period
   - No milestones or conditions to maintain exclusivity
   - **Risk:** Seller locked in even if buyer slows due diligence
   - **Buyer Perspective:** This actually favors buyer
   - **Recommendation:** Add good faith negotiation clause, allow seller to terminate if buyer misses milestones

3. **BREAK-UP FEE (§11)** - LOW RISK
   - If buyer walks away, no break-up fee
   - If seller entertains other offers during exclusivity, €150K penalty
   - **Issue:** One-sided in buyer's favor
   - **Market:** Break-up fees often mutual (2-3% of deal value each side)
   - **Recommendation:** Consider adding €400K buyer reverse break-up fee for goodwill

**Transaction Terms:**
- Purchase Price: €15,000,000 (enterprise value)
- Structure: Stock purchase (100% of shares)
- Payment: Cash at closing (no earnout)
- Closing Target: 90 days from LOI execution

**Price Adjustments:**
- Working Capital: Target €1.2M (normalized from last 12 months)
- Debt-Free: Seller repays all debt before closing
- Cash-Free: Seller retains all cash (standard)
- Adjustment: Dollar-for-dollar above/below target working capital

**Conditions Precedent:**
- Satisfactory due diligence (legal, financial, operational)
- Board and shareholder approvals
- Regulatory approvals (if required)
- Definitive agreements executed
- No material adverse change (MAC)

**Due Diligence Scope:**
- Financial: Last 3 years audited financials + current year unaudited
- Legal: Material contracts, IP, litigation, employment
- Operational: Customer concentration, technology stack, vendor dependencies
- Compliance: GDPR, tax, regulatory licenses

**Target Company Profile:**
- Industry: SaaS platform for logistics
- Revenue: €5.8M annually (growing 40% YoY)
- EBITDA: €1.2M (21% margin)
- Customers: 140 enterprise clients
- Employees: 35 (mostly engineering)
- Valuation Multiple: 2.6x revenue, 12.5x EBITDA (fair for SaaS)

**Positive Elements:**
- Clean cap table (2 co-founders own 90%, small angel investor 10%)
- No litigation or regulatory issues disclosed
- Strong customer retention (95% annually)
- Proprietary technology (no open-source dependencies)
- Experienced management team willing to stay post-acquisition

**Exclusivity:**
- 90 days from LOI signature
- No-shop, no-talk provisions
- Seller must notify buyer of any unsolicited inquiries
- Penalty: €150K if violated (see issue above)

**Confidentiality:**
- Mutual non-disclosure obligations
- Survives termination of LOI
- Standard exceptions (public information, regulatory disclosure)

**Deal Risks:**
- Customer Concentration: Top 5 customers = 40% of revenue
- Technology: Single product line (no diversification)
- Key Person: CTO is critical (retention package needed)
- Market: Competitive landscape intensifying

**RECOMMENDATION:** Generally favorable LOI for buyer. Recommend clarifying binding vs non-binding language to avoid disputes. Exclusivity period and break-up fee structure favor buyer strongly - consider small concessions for relationship building. Overall good strategic fit at fair valuation.`,
  },
];

// Helper to get documents by status
export function getDocumentsByDecision(decision: 'APPROVE' | 'OVERRIDE' | 'ESCALATE' | null) {
  // This will be connected to store.ts HDRs
  return MOCK_DOCUMENTS;
}

// Helper to get document by ID
export function getDocumentById(id: string): MockDocument | undefined {
  return MOCK_DOCUMENTS.find(doc => doc.id === id);
}
