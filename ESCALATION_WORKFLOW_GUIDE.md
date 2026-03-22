# 🚀 TrustDoc Escalation Workflow Guide

## ✅ Implemented Features

### Task 1: Quick Login / Role Switcher ✓
- **Page:** `/login`
- **Users:**
  - **Yasmin Lemke** (Junior Legal Analyst) - Can review, chat with AI, escalate
  - **Sarah Chen** (Head of Legal & Risk) - Full permissions, can resolve escalations

### Task 2: Escalation Logic ✓
- **Status:** Documents can be `PENDING`, `ESCALATED`, or `RESOLVED`
- **Metadata captured:**
  - `escalated_to`: Sarah Chen's user ID
  - `escalated_by`: Yasmin's user ID
  - `escalation_reason`: Captured from modal textarea
  - `escalation_date`: Timestamp of escalation

### Task 3: Worklist & Notifications ✓
- **Page:** `/worklist`
- **Navigation:** Inbox icon in TopNav
- **Notification Badge:** Red dot on NotificationBell when escalations pending
- **Sarah's View:** Priority list of all escalations with reasons
- **Yasmin's View:** Track status of her escalations (pending/resolved)

### Task 4: Final Decision & PDF Seal ✓
- **Sarah's Review:** Full chat transcript visible (all AI interactions)
- **PDF Certification:** Seal shows "Reviewed & Certified by Sarah Chen (Head of Legal & Risk)"
- **Ledger ID:** Format `QLDB-{hash}` (SHA-256 cryptographic fingerprint)
- **Immutability:** Records sealed in WORM Ledger (Write Once, Read Many)

---

## 🎯 Testing the Complete Workflow

### Step 1: Login as Yasmin
1. Navigate to: `http://localhost:3003/login`
2. Click **"Login as Yasmin"**
3. You'll land on Dashboard with limited document visibility

### Step 2: Review a High-Risk Document
1. From Dashboard, select a high-risk document (e.g., doc_028 - Cloud Infrastructure)
2. Click **"Analyze with AI"**
3. Chat with Gemini about specific clauses
4. Notice the AI identifies critical risks

### Step 3: Escalate to Manager
1. Click **"↑ Escalate"** button
2. Select **"Sarah Chen - Head of Legal & Risk"** from dropdown
3. Enter escalation reason:
   ```
   High-risk vendor lock-in and egress costs. Potential $2M+ migration liability.
   Requires senior approval before execution.
   ```
4. Click **"Confirm Escalation"**
5. Document status changes to `ESCALATED`

### Step 4: Check Worklist as Yasmin
1. Navigate to `/worklist`
2. See your escalation in **"My Escalations"** section
3. Status shows `ESCALATED` badge (orange/rose)

### Step 5: Switch to Sarah Chen
1. Navigate back to `/login`
2. Click **"Login as Sarah"**
3. **Notice:** NotificationBell has red badge 🔴

### Step 6: Review as Manager
1. Click **Inbox** icon or go to `/worklist`
2. See **"Escalations Requiring Your Review"**
3. View:
   - Document name
   - Who escalated (Yasmin Lemke)
   - Escalation reason (full context)
   - Risk level badge
   - Chat transcript count
4. Click **"Review Now →"**

### Step 7: Make Final Decision
1. Review complete chat transcript (all AI interactions preserved)
2. See Yasmin's escalation reason prominently displayed
3. Verify your identity (MFA gate)
4. Make decision:
   - **Approve** → Signs off on deal
   - **Override** → Rejects with senior authority
5. Enter your note as Sarah

### Step 8: Seal the Decision
1. Confirmation modal shows:
   - Your name: **Sarah Chen (Head of Legal & Risk)**
   - Chat messages count
   - Immutable WORM Ledger warning
2. Click **"Seal & Archive Decision"**
3. HDR record created with:
   - Ledger ID: `QLDB-{unique_hash}`
   - Status: `RESOLVED`
   - Reviewer: Sarah Chen

### Step 9: Download Certified PDF
1. On confirmation page, click **"Download Certified PDF"**
2. PDF includes:
   - Sidebar stamps on every page
   - Certificate of Authenticity page showing:
     - **"Reviewed & Certified by Sarah Chen"**
     - Head of Legal & Risk
     - Ledger ID (QLDB format)
     - SHA-256 hash
     - QR code for public verification

### Step 10: Verify in Audit Trail
1. Navigate to `/audit`
2. Find the sealed record
3. View immutable audit trail showing:
   - Complete chat transcript
   - Escalation chain (Yasmin → Sarah)
   - Governance frameworks applied
   - Decision note from Sarah
   - Cryptographic hash

### Step 11: Public Verification
1. Copy the verification URL from PDF QR code
2. Open in new browser (or share with auditors)
3. Public verification page shows:
   - Document authenticity confirmed ✓
   - Reviewer: Sarah Chen
   - Sealed date
   - Ledger ID
   - Compliance Decision badge

---

## 🎬 Demo Script (2 Minutes)

**[As Yasmin]**
1. "I'm Yasmin, Junior Legal Analyst. I just received this Cloud Infrastructure Agreement."
2. "Let me chat with our AI compliance assistant about the vendor lock-in clause..."
3. "Gemini is flagging $2M+ migration risk. This is beyond my authority."
4. "I'm escalating this to Sarah Chen, our Head of Legal."

**[Switch to Sarah]**
5. "I'm Sarah Chen. I see a red notification - Yasmin escalated a document."
6. "Let me review her analysis... I can see all 5 AI chat interactions."
7. "Yasmin's concern is valid. I'll approve this with modifications."
8. "Sealing my decision to the WORM Ledger..."

**[Show Certification]**
9. "Here's the certified PDF with my signature and cryptographic seal."
10. "Anyone can verify this on our public blockchain using this QR code."
11. "This satisfies EU AI Act Article 14 - human oversight with audit trail."

---

## 🔐 EU AI Act Compliance

**Article 12 (Logging):** ✓ Tamper-proof WORM Ledger with SHA-256 hashes
**Article 14 (Human Oversight):** ✓ Sarah Chen has override authority
**Article 52 (Transparency):** ✓ Public verification via trustdoc.dev/verify

---

## 🌟 Key Features Demonstrated

- ✅ **Role-Based Access Control (RBAC):** Yasmin vs Sarah permissions
- ✅ **AI-Assisted Review:** Gemini 2.5 Flash with streaming responses
- ✅ **Escalation Workflow:** Junior → Senior hierarchy
- ✅ **Live Notifications:** Red badge when escalations pending
- ✅ **Immutable Audit Trail:** WORM Ledger with cryptographic seals
- ✅ **Certified PDFs:** Sidebar stamps + certificate page
- ✅ **Public Verification:** QR code links to trustdoc.dev/verify
- ✅ **Governance Frameworks:** GDPR, EU AI Act, LGPD, Colorado SB 205

---

## 📊 System Architecture

```
┌─────────────┐
│   Yasmin    │ Junior Legal Analyst
│   Lemke     │ (Limited Permissions)
└──────┬──────┘
       │ Escalates
       ↓
┌─────────────┐
│    Sarah    │ Head of Legal & Risk
│    Chen     │ (Full Authority)
└──────┬──────┘
       │ Seals Decision
       ↓
┌─────────────┐
│ WORM Ledger │ Immutable Archive
│  (SHA-256)  │ Public Verification
└─────────────┘
```

---

## 🐛 Troubleshooting

**Q: NotificationBell doesn't show red badge?**
A: Make sure an escalation is pending with `status === 'ESCALATED'`

**Q: Can't see all 32 documents?**
A: Check user permissions in `lib/store.ts` - ROLE_PERMISSIONS

**Q: Gemini API 403 error?**
A: API needs to propagate after activation (wait 2-3 minutes)

**Q: PDF download fails?**
A: Check if `/public/sample-contract.pdf` exists (fallback PDF)

---

## 🎉 Success Criteria

✅ Yasmin can escalate documents
✅ Sarah receives live notification
✅ Sarah can review with full context
✅ PDF shows Sarah's name and title
✅ Ledger ID format: QLDB-{hash}
✅ Public verification works
✅ EU AI Act Article 14 compliant

---

**Ready to test!** Start at: `http://localhost:3003/login` 🚀
