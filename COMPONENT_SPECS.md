# TrustDoc Component Specifications

**Technical specifications for all Review UI components**

---

## Component Architecture

```
review-ui/
├── app/
│   ├── layout.tsx              # Root layout with auth provider
│   ├── page.tsx                # Landing/login page
│   ├── dashboard/
│   │   └── page.tsx            # HDR overview dashboard
│   ├── review/
│   │   └── [id]/page.tsx       # HDR review workflow
│   ├── tat/
│   │   ├── issue/page.tsx      # NEW: TAT issuance interface
│   │   └── active/page.tsx     # NEW: Active TAT management
│   ├── compliance/
│   │   └── page.tsx            # NEW: Compliance dashboard
│   └── verify/
│       └── [id]/page.tsx       # NEW: Public verification
│
├── components/
│   ├── AIOutputDisplay.tsx     # ✅ Complete
│   ├── DecisionButtons.tsx     # ✅ Complete
│   ├── HDRConfirmation.tsx     # ✅ Complete
│   ├── MFAGate.tsx             # ✅ Complete
│   ├── TATBuilder.tsx          # 🔴 TODO
│   ├── TATCard.tsx             # 🔴 TODO
│   ├── ComplianceMetrics.tsx   # 🔴 TODO
│   ├── MerkleTreeViz.tsx       # 🔴 TODO
│   ├── AARSessionMonitor.tsx   # 🔴 TODO
│   ├── VerificationBadge.tsx   # 🔴 TODO
│   └── shared/
│       ├── Card.tsx            # 🔴 TODO: Reusable card component
│       ├── Badge.tsx           # 🔴 TODO: Reusable badge component
│       ├── HashDisplay.tsx     # 🔴 TODO: Monospace hash with copy
│       └── StatCard.tsx        # 🔴 TODO: Dashboard stat card
│
└── lib/
    ├── api.ts                  # ✅ API client functions
    ├── auth.ts                 # 🔴 TODO: Auth utilities
    └── merkle.ts               # 🔴 TODO: Merkle tree utilities
```

---

## New Component Specifications

### 1. TATBuilder Component

**Purpose:** Form for issuing TAT tokens to AI agents

**Props:**
```typescript
interface TATBuilderProps {
  onIssue: (tat: TATRequest) => Promise<void>;
  loading?: boolean;
}

interface TATRequest {
  agent_name: string;
  agent_id: string;
  permitted_actions: string[];
  forbidden_actions?: string[];
  expires_in_minutes: number;
  max_actions?: number;
}
```

**UI Structure:**
```tsx
<div className="space-y-6">
  {/* Agent Identification */}
  <section>
    <label>Agent Name</label>
    <input type="text" placeholder="Contract Analyzer v2" />

    <label>Agent Identifier</label>
    <input type="text" placeholder="agent_abc123xyz" />
  </section>

  {/* Permissions Scope */}
  <section>
    <h3>Permitted Actions</h3>
    <PermissionCheckboxGroup
      actions={['read:documents', 'write:analysis', 'execute:summarize']}
      onChange={setPermitted}
    />

    <h3>Forbidden Actions (Override)</h3>
    <PermissionCheckboxGroup
      actions={['delete:records', 'admin:users']}
      onChange={setForbidden}
    />
  </section>

  {/* Time Bounds */}
  <section>
    <label>Duration</label>
    <select>
      <option value={30}>30 minutes</option>
      <option value={120}>2 hours</option>
      <option value={480}>8 hours (max)</option>
    </select>

    <p className="text-sm text-gray-500">
      Expires: {calculateExpiry(duration)}
    </p>
  </section>

  {/* MFA Gate */}
  <MFAGate onVerified={setMfaToken} />

  {/* Issue Button */}
  <button
    disabled={!mfaToken || loading}
    onClick={handleIssue}
  >
    Issue TAT Token
  </button>
</div>
```

**Validation Rules:**
- Agent name: Required, 3-100 chars
- Agent ID: Required, alphanumeric + underscore
- Permitted actions: At least 1 required
- Duration: 1-480 minutes only
- MFA: Required before issuance

**Visual Design:**
- Dangerous permissions (delete, admin) highlighted in red
- Duration selector shows absolute expiry time
- TAT preview shown before final issuance

---

### 2. TATCard Component

**Purpose:** Display active TAT with status and actions

**Props:**
```typescript
interface TATCardProps {
  tat: {
    tat_id: string;
    agent_name: string;
    agent_id: string;
    permitted_actions: string[];
    expires_at: string;
    issued_at: string;
    revoked: boolean;
  };
  onRevoke?: (tatId: string) => void;
}
```

**UI Structure:**
```tsx
<div className={cn(
  "border rounded-xl p-4",
  revoked ? "bg-gray-50 border-gray-300" : "bg-white border-gray-200"
)}>
  {/* Header */}
  <div className="flex justify-between items-start">
    <div>
      <h3 className="font-semibold">{agent_name}</h3>
      <p className="text-sm text-gray-500">{agent_id}</p>
    </div>
    <TATStatusBadge status={getStatus(expires_at, revoked)} />
  </div>

  {/* Permissions */}
  <div className="mt-3">
    <p className="text-xs text-gray-500 uppercase">Permitted Actions</p>
    <div className="flex flex-wrap gap-1 mt-1">
      {permitted_actions.map(action => (
        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
          {action}
        </span>
      ))}
    </div>
  </div>

  {/* Expiry */}
  <div className="mt-3 flex justify-between items-center">
    <p className="text-sm">
      Expires: <ExpiryCountdown expiresAt={expires_at} />
    </p>
    {!revoked && (
      <button
        onClick={() => onRevoke?.(tat_id)}
        className="text-xs text-red-600 hover:underline"
      >
        Revoke
      </button>
    )}
  </div>
</div>
```

**States:**
- **Active:** Green badge, countdown visible
- **Expiring Soon:** Yellow badge, < 15 min
- **Expired:** Gray badge, countdown hidden
- **Revoked:** Red badge, strikethrough

---

### 3. ComplianceMetrics Component

**Purpose:** Display regulatory compliance status

**Props:**
```typescript
interface ComplianceMetricsProps {
  metrics: {
    total_hdrs: number;
    total_aars: number;
    active_tats: number;
    compliance_status: {
      eu_ai_act_art_12: boolean;
      eu_ai_act_art_14: boolean;
      colorado_sb_205: boolean;
    };
    time_period: 'day' | 'week' | 'month' | 'all';
  };
}
```

**UI Structure:**
```tsx
<div className="space-y-6">
  {/* Metrics Grid */}
  <div className="grid grid-cols-3 gap-4">
    <StatCard
      label="Human Decision Records"
      value={metrics.total_hdrs}
      trend="+12%"
      color="blue"
    />
    <StatCard
      label="Agent Accountability Records"
      value={metrics.total_aars}
      trend="+8%"
      color="purple"
    />
    <StatCard
      label="Active TAT Tokens"
      value={metrics.active_tats}
      color="green"
    />
  </div>

  {/* Regulatory Status */}
  <div className="bg-white border rounded-xl p-6">
    <h3 className="font-semibold mb-4">Regulatory Compliance</h3>
    <div className="space-y-2">
      <ComplianceRow
        label="EU AI Act Article 12 (Tamper-proof logs)"
        status={metrics.compliance_status.eu_ai_act_art_12}
      />
      <ComplianceRow
        label="EU AI Act Article 14 (Human oversight)"
        status={metrics.compliance_status.eu_ai_act_art_14}
      />
      <ComplianceRow
        label="Colorado SB 205 (Risk management)"
        status={metrics.compliance_status.colorado_sb_205}
      />
    </div>
  </div>

  {/* Export Actions */}
  <div className="flex gap-3">
    <button className="btn-secondary">Export CSV</button>
    <button className="btn-secondary">Download PDF Report</button>
  </div>
</div>
```

**Data Visualizations:**
- Line chart: HDRs created over time (Chart.js or Recharts)
- Pie chart: Decision distribution (APPROVE/OVERRIDE/ESCALATE)
- Bar chart: AI tool usage frequency

---

### 4. MerkleTreeViz Component

**Purpose:** Visual representation of Merkle tree structure

**Props:**
```typescript
interface MerkleTreeVizProps {
  merkle_root: string;
  records: Array<{
    record_id: string;
    record_hash: string;
    sealed_at: string;
  }>;
  highlighted_record_id?: string;
}
```

**UI Structure:**
```tsx
<div className="space-y-4">
  {/* Root Display */}
  <div className="bg-slate-900 text-green-400 p-4 rounded-lg">
    <p className="text-xs uppercase tracking-wider">Merkle Root</p>
    <HashDisplay hash={merkle_root} copyable />
  </div>

  {/* Tree Visualization */}
  <svg className="w-full h-96">
    {/* Render tree nodes and connections */}
    <TreeNode
      node={root}
      depth={0}
      highlighted={highlighted_record_id}
    />
  </svg>

  {/* Proof Path */}
  {highlighted_record_id && (
    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
      <h4 className="font-semibold text-sm mb-2">Verification Path</h4>
      <ProofPath recordId={highlighted_record_id} tree={tree} />
    </div>
  )}

  {/* Verification Status */}
  <VerificationBadge
    verified={verifyMerklePath(highlighted_record_id, tree)}
    s3_locked={true}
  />
</div>
```

**Interaction:**
- Click node → Highlight proof path
- Hover → Show hash tooltip
- Download proof certificate (PDF)

**Library Options:**
- D3.js for tree layout
- React Flow for interactive nodes
- Canvas API for custom rendering

---

### 5. AARSessionMonitor Component

**Purpose:** Real-time AAR session activity log

**Props:**
```typescript
interface AARSessionMonitorProps {
  aar_session_id: string;
  agent: {
    name: string;
    id: string;
  };
  tat: {
    tat_id: string;
    expires_at: string;
  };
  actions: Array<{
    timestamp: string;
    action_type: string;
    action_data: Record<string, unknown>;
    result: 'SUCCESS' | 'SCOPE_VIOLATION';
  }>;
}
```

**UI Structure:**
```tsx
<div className="space-y-4">
  {/* Session Header */}
  <div className="bg-white border rounded-xl p-4">
    <div className="flex justify-between">
      <div>
        <h3 className="font-semibold">{agent.name}</h3>
        <p className="text-sm text-gray-500">{agent.id}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">TAT Expires</p>
        <ExpiryCountdown expiresAt={tat.expires_at} />
      </div>
    </div>
  </div>

  {/* Action Log */}
  <div className="bg-white border rounded-xl overflow-hidden">
    <div className="px-4 py-3 border-b bg-gray-50">
      <h4 className="font-semibold text-sm">Action Log</h4>
    </div>
    <div className="divide-y max-h-96 overflow-y-auto">
      {actions.map((action, idx) => (
        <ActionLogRow key={idx} action={action} />
      ))}
    </div>
  </div>

  {/* Seal Session Button */}
  <button
    onClick={handleSeal}
    className="btn-secondary w-full"
  >
    Force Seal Session
  </button>
</div>
```

**Action Log Row:**
```tsx
<div className={cn(
  "flex items-start gap-3 px-4 py-3",
  result === 'SCOPE_VIOLATION' && "bg-red-50"
)}>
  <span className="text-xs text-gray-500 font-mono w-24">
    {formatTime(timestamp)}
  </span>
  <span className="text-sm flex-1">{action_type}</span>
  <ResultBadge result={result} />
</div>
```

**Real-time Updates:**
- Consider WebSocket connection for live updates
- Fallback: Poll every 5 seconds
- Show "New action" indicator

---

### 6. VerificationBadge Component

**Purpose:** Display record integrity status

**Props:**
```typescript
interface VerificationBadgeProps {
  verified: boolean;
  sealed: boolean;
  s3_locked: boolean;
  merkle_verified?: boolean;
}
```

**UI Structure:**
```tsx
<div className={cn(
  "inline-flex items-center gap-2 px-3 py-2 rounded-lg border",
  verified
    ? "bg-green-50 border-green-200 text-green-700"
    : "bg-red-50 border-red-200 text-red-700"
)}>
  <Icon name={verified ? "check-circle" : "x-circle"} />
  <div className="text-sm">
    <p className="font-semibold">
      {verified ? "✓ Verified" : "✗ Verification Failed"}
    </p>
    <ul className="text-xs space-y-0.5 mt-1">
      <li>Hash match: {verified ? "✓" : "✗"}</li>
      <li>Sealed: {sealed ? "✓" : "Pending"}</li>
      <li>S3 Object Lock: {s3_locked ? "✓" : "✗"}</li>
      {merkle_verified !== undefined && (
        <li>Merkle tree: {merkle_verified ? "✓" : "✗"}</li>
      )}
    </ul>
  </div>
</div>
```

---

## Shared Component Library

### Card Component
```tsx
interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

// Usage: <Card variant="elevated" padding="lg">...</Card>
```

### Badge Component
```tsx
interface BadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

// Usage: <Badge variant="success">APPROVED</Badge>
```

### HashDisplay Component
```tsx
interface HashDisplayProps {
  hash: string;
  copyable?: boolean;
  truncate?: boolean;
}

// Usage: <HashDisplay hash={sha256} copyable truncate />
```

### StatCard Component
```tsx
interface StatCardProps {
  label: string;
  value: number | string;
  trend?: string;
  color?: 'blue' | 'green' | 'purple' | 'amber';
  icon?: React.ReactNode;
}

// Usage: <StatCard label="Total HDRs" value={1234} trend="+12%" color="blue" />
```

---

## API Integration Points

### Endpoints Needed
```typescript
// TAT Management
POST /api/v1/auth/tat/issue
GET  /api/v1/auth/tat/active
POST /api/v1/auth/tat/revoke/:tat_id

// AAR Monitoring
GET  /api/v1/records/aar/sessions/active
GET  /api/v1/records/aar/session/:session_id/actions

// Compliance
GET  /api/v1/compliance/metrics?period=week
GET  /api/v1/compliance/export?format=csv

// Merkle Verification
GET  /api/v1/verify/:record_id
GET  /api/v1/verify/:record_id/merkle-path

// Public Verification
GET  /api/v1/public/verify/:record_id
```

---

## Testing Plan

### Unit Tests (Jest + React Testing Library)
- [ ] TATBuilder form validation
- [ ] TATCard state transitions
- [ ] ComplianceMetrics data formatting
- [ ] MerkleTreeViz proof path calculation
- [ ] AARSessionMonitor action filtering

### Integration Tests
- [ ] TAT issuance → Active TAT list
- [ ] HDR creation → Compliance metrics update
- [ ] AAR action → Session monitor real-time update

### E2E Tests (Playwright)
- [ ] Full HDR workflow (review → MFA → decision)
- [ ] TAT issuance and revocation
- [ ] Public verification flow

---

## Performance Considerations

1. **Virtual Scrolling:** For long AAR action logs (react-window)
2. **Lazy Loading:** Merkle tree visualization (React.lazy)
3. **Memoization:** Complex calculations (useMemo, React.memo)
4. **Debouncing:** Search/filter inputs (use-debounce)
5. **Code Splitting:** Route-based splitting (Next.js automatic)

---

**Next:** Begin implementation of TATBuilder and ComplianceMetrics components.
