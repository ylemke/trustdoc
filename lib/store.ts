/**
 * TrustDoc State Management
 * Persists approvals to localStorage, syncs across tabs
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface HDRRecord {
  hdr_id: string;
  document_id: string;
  document_name: string;
  document_url: string;
  ai_tool: string;
  ai_output: string;
  decision: 'APPROVE' | 'OVERRIDE' | 'ESCALATE' | null;
  decision_note?: string;
  record_hash: string;
  sealed_at: string | null;
  created_at: string;
  reviewer_id: string;
  reviewer_email: string;
  // Sprint 3: Enhanced HDR Protocol with WORM Ledger
  ledger_id?: string;
  chat_transcript?: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  governance_context?: {
    frameworks: string[];
    internal_policy?: {
      fileName: string;
      rulesCount: number;
    };
  };
  // Sprint 5: Claude 3.5 Sonnet AI Analysis
  ai_analysis?: {
    risk_level: 'low' | 'medium' | 'high';
    summary: string;
    issues: Array<{
      clause: string;
      reason: string;
      severity: 'low' | 'medium' | 'high';
      framework?: string;
    }>;
    recommendations: string[];
    analyzed_at: string;
    model: string;
  };
  ai_analysis_status?: 'PENDING' | 'ANALYZING' | 'COMPLETE' | 'FAILED';
  ai_analysis_error?: string;
  // Escalation metadata
  escalated_by?: string;
  escalated_to?: string;
  escalation_reason?: string;
  status?: 'PENDING' | 'ESCALATED' | 'RESOLVED';
  // Resolution metadata
  resolved_by?: string;
  resolved_at?: string;
  resolution_decision?: 'APPROVE' | 'OVERRIDE';
  resolution_note?: string;
  // Sprint 4.2: E-Signature Integration
  esign_status?: 'PENDING' | 'SENT' | 'SIGNED' | 'DECLINED';
  esign_envelope_id?: string;
  esign_provider?: 'DOCUSIGN' | 'ADOBE_SIGN';
  esign_sent_at?: string;
  esign_signed_at?: string;
  // Phase 1B: QES Namirial Integration
  certificateStatus?: 'SHA256_ONLY' | 'QES_SIGNED';
  qesSignatureRef?: string;
  qesSignedAt?: string;
  qesCertUrl?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'ESCALATION_RESOLVED' | 'ESCALATION_RECEIVED';
  title: string;
  message: string;
  document_id: string;
  document_name: string;
  hdr_id: string;
  created_at: string;
  read: boolean;
  metadata?: {
    resolver_name?: string;
    resolution_decision?: string;
    original_escalation_reason?: string;
  };
}

// Governance Configuration
export interface GovernanceConfig {
  euAiAct: boolean;
  lgpd: boolean;
  coloradoSB205: boolean;
}

// Internal Policy (from uploaded PDF)
export interface InternalPolicy {
  fileName: string | null;
  uploadedAt: string | null;
  extractedRules: string[];
  processing: boolean;
}

const STORAGE_KEY = 'trustdoc_hdrs';
const CURRENT_USER_KEY = 'trustdoc_current_user';
const NOTIFICATIONS_KEY = 'trustdoc_notifications';
const GOVERNANCE_CONFIG_KEY = 'trustdoc_governance_config';
const INTERNAL_POLICY_KEY = 'trustdoc_internal_policy';

// User Directory
export const USERS: User[] = [
  {
    id: 'u_001',
    name: 'Yasmin Lemke',
    email: 'yasmin.lemke@trustdoc.dev',
    role: 'Junior Legal Analyst',
    department: 'Compliance'
  },
  {
    id: 'm_999',
    name: 'Sarah Chen',
    email: 'sarah.chen@trustdoc.dev',
    role: 'Head of Legal & Risk',
    department: 'Executive'
  }
];

// RBAC Permissions (Strict Zero-Visibility Security)
const ROLE_PERMISSIONS: Record<string, string[]> = {
  'Junior Legal Analyst': ['contract', 'nda', 'agreement', 'policy', 'terms', 'amendment'], // ALL document types for testing
  'Head of Legal & Risk': ['contract', 'nda', 'agreement', 'policy', 'terms', 'amendment'], // ALL document types
};

/**
 * Check if user has permission to view a document type
 * @param userRole - User's role
 * @param documentType - Document type to check
 * @returns true if user has permission, false otherwise
 */
export function canViewDocumentType(userRole: string, documentType: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;
  return permissions.includes(documentType);
}

/**
 * Get all document types a user can view
 * @param userRole - User's role
 * @returns Array of permitted document types
 */
export function getPermittedDocumentTypes(userRole: string): string[] {
  return ROLE_PERMISSIONS[userRole] || [];
}

// Get all HDRs from localStorage
export function getAllHDRs(): HDRRecord[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save HDR to localStorage
export function saveHDR(hdr: HDRRecord): void {
  const hdrs = getAllHDRs();
  const existing = hdrs.findIndex(h => h.hdr_id === hdr.hdr_id);

  if (existing >= 0) {
    hdrs[existing] = hdr;
  } else {
    hdrs.push(hdr);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(hdrs));

  // Dispatch custom event for same-tab updates
  window.dispatchEvent(new CustomEvent('hdr-update', { detail: hdrs }));

  // Dispatch storage event for cross-tab sync
  window.dispatchEvent(new StorageEvent('storage', {
    key: STORAGE_KEY,
    newValue: JSON.stringify(hdrs),
  }));
}

// Get HDR by ID
export function getHDRById(hdr_id: string): HDRRecord | null {
  const hdrs = getAllHDRs();
  return hdrs.find(h => h.hdr_id === hdr_id) || null;
}

// Get HDR statistics
export function getHDRStats() {
  const hdrs = getAllHDRs();
  return {
    total: hdrs.length,
    approved: hdrs.filter(h => h.decision === 'APPROVE').length,
    overridden: hdrs.filter(h => h.decision === 'OVERRIDE').length,
    escalated: hdrs.filter(h => h.decision === 'ESCALATE').length,
    pending: hdrs.filter(h => !h.decision).length,
  };
}

// Subscribe to HDR changes
export function subscribeToHDRs(callback: (hdrs: HDRRecord[]) => void): () => void {
  // Handle cross-tab storage events
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getAllHDRs());
    }
  };

  // Handle same-tab custom events
  const customHandler = ((e: CustomEvent<HDRRecord[]>) => {
    callback(e.detail);
  }) as EventListener;

  window.addEventListener('storage', storageHandler);
  window.addEventListener('hdr-update', customHandler);

  return () => {
    window.removeEventListener('storage', storageHandler);
    window.removeEventListener('hdr-update', customHandler);
  };
}

// Clear all HDRs (dev only)
export function clearAllHDRs(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('hdr-update', { detail: [] }));
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: null }));
}

// Factory Reset - Clear ALL app state (for clean testing)
export function factoryReset(): void {
  if (typeof window === 'undefined') return;

  // Clear all storage keys
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(NOTIFICATIONS_KEY);
  localStorage.removeItem(GOVERNANCE_CONFIG_KEY);
  localStorage.removeItem(INTERNAL_POLICY_KEY);

  // Clear Gemini chat history for all documents
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('trustdoc_gemini_') || key.startsWith('gemini_chat_')) {
      localStorage.removeItem(key);
    }
  });

  // Dispatch events to update all subscribers
  window.dispatchEvent(new CustomEvent('hdr-update', { detail: [] }));
  window.dispatchEvent(new CustomEvent('notification-update', { detail: [] }));
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: null }));
  window.dispatchEvent(new StorageEvent('storage', { key: NOTIFICATIONS_KEY, newValue: null }));
}

// User Management
export function getCurrentUser(): User {
  if (typeof window === 'undefined') return USERS[0];
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Default to first user (Yasmin)
  return USERS[0];
}

export function setCurrentUser(userId: string): void {
  const user = USERS.find(u => u.id === userId);
  if (user && typeof window !== 'undefined') {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
}

export function getAvailableManagers(excludeUserId?: string): User[] {
  return USERS.filter(u => u.id !== excludeUserId);
}

export function getUserById(userId: string): User | undefined {
  return USERS.find(u => u.id === userId);
}

// Notification Management
export function getAllNotifications(): Notification[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getUserNotifications(userId: string): Notification[] {
  return getAllNotifications().filter(n => n.user_id === userId);
}

export function getUnreadCount(userId: string): number {
  return getUserNotifications(userId).filter(n => !n.read).length;
}

// Get count of pending escalations for a user (as manager)
export function getPendingEscalationsCount(userId: string): number {
  const hdrs = getAllHDRs();
  return hdrs.filter(h => h.status === 'ESCALATED' && h.escalated_to === userId).length;
}

// Get count of resolved escalations for a user (as escalator)
export function getResolvedEscalationsCount(userId: string): number {
  const notifications = getUserNotifications(userId);
  return notifications.filter(n => n.type === 'ESCALATION_RESOLVED' && !n.read).length;
}

// Get total notification badge count (includes unread notifications + pending escalations)
export function getTotalBadgeCount(userId: string): number {
  const unreadNotifs = getUnreadCount(userId);
  const pendingEscalations = getPendingEscalationsCount(userId);
  return unreadNotifs + pendingEscalations;
}

export function addNotification(notification: Notification): void {
  const notifications = getAllNotifications();
  notifications.unshift(notification);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));

  // Dispatch custom event for same-tab updates
  window.dispatchEvent(new CustomEvent('notification-update', { detail: notifications }));

  window.dispatchEvent(new StorageEvent('storage', {
    key: NOTIFICATIONS_KEY,
    newValue: JSON.stringify(notifications),
  }));
}

export function markNotificationAsRead(notificationId: string): void {
  const notifications = getAllNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));

    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('notification-update', { detail: notifications }));

    window.dispatchEvent(new StorageEvent('storage', {
      key: NOTIFICATIONS_KEY,
      newValue: JSON.stringify(notifications),
    }));
  }
}

export function markAllNotificationsAsRead(userId: string): void {
  const notifications = getAllNotifications();
  notifications.forEach(n => {
    if (n.user_id === userId) {
      n.read = true;
    }
  });
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));

  // Dispatch custom event for same-tab updates
  window.dispatchEvent(new CustomEvent('notification-update', { detail: notifications }));

  window.dispatchEvent(new StorageEvent('storage', {
    key: NOTIFICATIONS_KEY,
    newValue: JSON.stringify(notifications),
  }));
}

export function subscribeToNotifications(callback: (notifications: Notification[]) => void): () => void {
  // Handle cross-tab storage events
  const storageHandler = (e: StorageEvent) => {
    if (e.key === NOTIFICATIONS_KEY) {
      callback(getAllNotifications());
    }
  };

  // Handle same-tab custom events
  const customHandler = ((e: CustomEvent<Notification[]>) => {
    callback(e.detail);
  }) as EventListener;

  window.addEventListener('storage', storageHandler);
  window.addEventListener('notification-update', customHandler);

  return () => {
    window.removeEventListener('storage', storageHandler);
    window.removeEventListener('notification-update', customHandler);
  };
}

// Governance Configuration Management
export function getGovernanceConfig(): GovernanceConfig {
  if (typeof window === 'undefined') {
    return { euAiAct: false, lgpd: false, coloradoSB205: false };
  }
  const stored = localStorage.getItem(GOVERNANCE_CONFIG_KEY);
  return stored ? JSON.parse(stored) : { euAiAct: false, lgpd: false, coloradoSB205: false };
}

export function setGovernanceConfig(config: GovernanceConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(GOVERNANCE_CONFIG_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('governance-update', { detail: config }));
  }
}

export function subscribeToGovernanceConfig(callback: (config: GovernanceConfig) => void): () => void {
  const handler = ((e: CustomEvent<GovernanceConfig>) => {
    callback(e.detail);
  }) as EventListener;

  window.addEventListener('governance-update', handler);

  return () => {
    window.removeEventListener('governance-update', handler);
  };
}

// Internal Policy Management
export function getInternalPolicy(): InternalPolicy {
  if (typeof window === 'undefined') {
    return { fileName: null, uploadedAt: null, extractedRules: [], processing: false };
  }
  const stored = localStorage.getItem(INTERNAL_POLICY_KEY);
  return stored ? JSON.parse(stored) : { fileName: null, uploadedAt: null, extractedRules: [], processing: false };
}

export function setInternalPolicy(policy: InternalPolicy): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(INTERNAL_POLICY_KEY, JSON.stringify(policy));
    window.dispatchEvent(new CustomEvent('policy-update', { detail: policy }));
  }
}

export function uploadInternalPolicy(fileName: string): void {
  // Simulate processing
  setInternalPolicy({
    fileName,
    uploadedAt: new Date().toISOString(),
    extractedRules: [],
    processing: true
  });

  // Simulate AI extraction (3 seconds)
  setTimeout(() => {
    setInternalPolicy({
      fileName,
      uploadedAt: new Date().toISOString(),
      extractedRules: [
        'International jurisdiction clauses require Head of Legal approval',
        'Contracts exceeding €100k must undergo dual review',
        'Data processing terms must comply with LGPD and GDPR',
        'Force majeure clauses must explicitly include pandemic scenarios',
        'Payment terms cannot exceed 90 days without VP Finance approval'
      ],
      processing: false
    });
  }, 3000);
}

export function subscribeToInternalPolicy(callback: (policy: InternalPolicy) => void): () => void {
  const handler = ((e: CustomEvent<InternalPolicy>) => {
    callback(e.detail);
  }) as EventListener;

  window.addEventListener('policy-update', handler);

  return () => {
    window.removeEventListener('policy-update', handler);
  };
}

// Escalation Resolution
export function resolveEscalation(
  hdrId: string,
  resolverId: string,
  decision: 'APPROVE' | 'OVERRIDE',
  note?: string
): void {
  const hdrs = getAllHDRs();
  const hdr = hdrs.find(h => h.hdr_id === hdrId);

  if (!hdr || hdr.status !== 'ESCALATED') {
    throw new Error('HDR not found or not in escalated state');
  }

  const resolver = getUserById(resolverId);
  if (!resolver) {
    throw new Error('Resolver not found');
  }

  // Update HDR with resolution
  hdr.status = 'RESOLVED';
  hdr.resolved_by = resolverId;
  hdr.resolved_at = new Date().toISOString();
  hdr.resolution_decision = decision;
  hdr.resolution_note = note;

  // Save updated HDR
  saveHDR(hdr);

  // Create notification for original escalator (NEVER for the resolver)
  if (hdr.escalated_by && hdr.escalated_by !== resolverId) {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: hdr.escalated_by, // Always the person who escalated (e.g., Yasmin)
      type: 'ESCALATION_RESOLVED',
      title: 'Escalation Resolved',
      message: `${resolver.name} has ${decision.toLowerCase()}d your escalation for "${hdr.document_name}"`,
      document_id: hdr.document_id,
      document_name: hdr.document_name,
      hdr_id: hdr.hdr_id,
      created_at: new Date().toISOString(),
      read: false,
      metadata: {
        resolver_name: resolver.name,
        resolution_decision: decision,
        original_escalation_reason: hdr.escalation_reason
      }
    };

    addNotification(notification);
  }
}
