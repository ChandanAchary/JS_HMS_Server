/**
 * Queue Management System - Constants
 * Defines queue statuses, priorities, service types, and configurations
 * 
 * Hospital Queue System for:
 * - OPD Consultations (Doctor queues)
 * - Diagnostic Services (Lab, Radiology)
 * - Billing/Pharmacy counters
 * - Emergency prioritization
 */

// ==================== QUEUE STATUS ====================
/**
 * Patient Queue Status
 * Tracks the lifecycle of a patient in the queue
 */
export const QUEUE_STATUS = {
  WAITING: 'WAITING',       // In queue, waiting to be called
  CALLED: 'CALLED',         // Called but not yet arrived at counter
  SERVING: 'SERVING',       // Currently being served
  COMPLETED: 'COMPLETED',   // Service completed
  SKIPPED: 'SKIPPED',       // Patient not present when called
  TRANSFERRED: 'TRANSFERRED', // Moved to another queue
  CANCELLED: 'CANCELLED',   // Patient left/cancelled
  RECALLED: 'RECALLED',     // Called again after skip
  ON_HOLD: 'ON_HOLD'        // Temporarily on hold
};

// Status flow: WAITING -> CALLED -> SERVING -> COMPLETED
// Alternative flows: WAITING -> SKIPPED -> RECALLED -> SERVING -> COMPLETED
//                   WAITING -> CANCELLED
//                   WAITING -> TRANSFERRED

export const QUEUE_STATUS_DISPLAY = {
  [QUEUE_STATUS.WAITING]: { label: 'Waiting', color: '#FFA500', icon: 'clock' },
  [QUEUE_STATUS.CALLED]: { label: 'Called', color: '#2196F3', icon: 'volume-up' },
  [QUEUE_STATUS.SERVING]: { label: 'Serving', color: '#4CAF50', icon: 'user-check' },
  [QUEUE_STATUS.COMPLETED]: { label: 'Completed', color: '#9E9E9E', icon: 'check-circle' },
  [QUEUE_STATUS.SKIPPED]: { label: 'Skipped', color: '#FF5722', icon: 'skip-forward' },
  [QUEUE_STATUS.TRANSFERRED]: { label: 'Transferred', color: '#9C27B0', icon: 'arrow-right' },
  [QUEUE_STATUS.CANCELLED]: { label: 'Cancelled', color: '#F44336', icon: 'x-circle' },
  [QUEUE_STATUS.RECALLED]: { label: 'Recalled', color: '#FF9800', icon: 'phone-call' },
  [QUEUE_STATUS.ON_HOLD]: { label: 'On Hold', color: '#607D8B', icon: 'pause' }
};

// ==================== QUEUE PRIORITY ====================
/**
 * Priority Levels for Queue
 * EMERGENCY has highest priority and is always served first
 */
export const QUEUE_PRIORITY = {
  EMERGENCY: 'EMERGENCY',   // From billing emergency flag - TOP PRIORITY
  URGENT: 'URGENT',         // Doctor referral urgent, STAT diagnostic
  PRIORITY: 'PRIORITY',     // Senior citizen, pregnant, disabled, VIP
  NORMAL: 'NORMAL'          // Standard queue
};

// Priority order (lower number = higher priority)
export const PRIORITY_ORDER = {
  [QUEUE_PRIORITY.EMERGENCY]: 1,
  [QUEUE_PRIORITY.URGENT]: 2,
  [QUEUE_PRIORITY.PRIORITY]: 3,
  [QUEUE_PRIORITY.NORMAL]: 4
};

export const PRIORITY_DISPLAY = {
  [QUEUE_PRIORITY.EMERGENCY]: { 
    label: 'Emergency', 
    color: '#DC2626', 
    bgColor: '#FEE2E2',
    icon: 'alert-triangle',
    description: 'Emergency case - Immediate attention required'
  },
  [QUEUE_PRIORITY.URGENT]: { 
    label: 'Urgent', 
    color: '#F59E0B', 
    bgColor: '#FEF3C7',
    icon: 'alert-circle',
    description: 'Urgent case - High priority'
  },
  [QUEUE_PRIORITY.PRIORITY]: { 
    label: 'Priority', 
    color: '#3B82F6', 
    bgColor: '#DBEAFE',
    icon: 'star',
    description: 'Priority patient - Senior/Pregnant/Disabled'
  },
  [QUEUE_PRIORITY.NORMAL]: { 
    label: 'Normal', 
    color: '#10B981', 
    bgColor: '#D1FAE5',
    icon: 'user',
    description: 'Standard queue'
  }
};

// ==================== SERVICE TYPES ====================
/**
 * Types of services that can have queues
 */
export const SERVICE_TYPE = {
  CONSULTATION: 'CONSULTATION',   // Doctor OPD consultation
  DIAGNOSTIC: 'DIAGNOSTIC',       // Lab tests, Radiology, Cardiology
  BILLING: 'BILLING',             // Billing counter
  PHARMACY: 'PHARMACY',           // Pharmacy dispensing
  PROCEDURE: 'PROCEDURE',         // Minor procedures, injections
  ADMISSION: 'ADMISSION',         // IPD admission counter
  DISCHARGE: 'DISCHARGE',         // IPD discharge counter
  SAMPLE_COLLECTION: 'SAMPLE_COLLECTION', // Blood/urine collection
  REPORT_COLLECTION: 'REPORT_COLLECTION'  // Report pickup
};

export const SERVICE_TYPE_CONFIG = {
  [SERVICE_TYPE.CONSULTATION]: {
    label: 'Doctor Consultation',
    icon: 'stethoscope',
    avgServiceTime: 15,       // minutes
    tokenPrefix: 'C',
    requiresDoctor: true,
    department: 'OPD'
  },
  [SERVICE_TYPE.DIAGNOSTIC]: {
    label: 'Diagnostic Test',
    icon: 'activity',
    avgServiceTime: 10,
    tokenPrefix: 'D',
    requiresDoctor: false,
    department: 'DIAGNOSTICS'
  },
  [SERVICE_TYPE.BILLING]: {
    label: 'Billing Counter',
    icon: 'file-text',
    avgServiceTime: 5,
    tokenPrefix: 'B',
    requiresDoctor: false,
    department: 'BILLING'
  },
  [SERVICE_TYPE.PHARMACY]: {
    label: 'Pharmacy',
    icon: 'package',
    avgServiceTime: 7,
    tokenPrefix: 'P',
    requiresDoctor: false,
    department: 'PHARMACY'
  },
  [SERVICE_TYPE.PROCEDURE]: {
    label: 'Minor Procedure',
    icon: 'scissors',
    avgServiceTime: 20,
    tokenPrefix: 'PR',
    requiresDoctor: true,
    department: 'OPD'
  },
  [SERVICE_TYPE.SAMPLE_COLLECTION]: {
    label: 'Sample Collection',
    icon: 'droplet',
    avgServiceTime: 5,
    tokenPrefix: 'S',
    requiresDoctor: false,
    department: 'DIAGNOSTICS'
  },
  [SERVICE_TYPE.REPORT_COLLECTION]: {
    label: 'Report Collection',
    icon: 'file-check',
    avgServiceTime: 3,
    tokenPrefix: 'R',
    requiresDoctor: false,
    department: 'DIAGNOSTICS'
  }
};

// ==================== QUEUE CONFIGURATION ====================
/**
 * Default queue configuration values
 */
export const QUEUE_CONFIG = {
  // Token reset
  AUTO_RESET_DAILY: true,          // Reset token numbers daily
  RESET_HOUR: 0,                   // Hour to reset (midnight)
  
  // Skipping
  MAX_SKIP_COUNT: 3,               // Auto-cancel after 3 skips
  SKIP_RECALL_INTERVAL: 5,         // Minutes to wait before auto-skip recall
  
  // Priority handling
  PRIORITY_RATIO: 3,               // Serve 1 priority after every 3 normal
  EMERGENCY_ALWAYS_FIRST: true,    // Emergency always served first
  
  // Waiting time
  DEFAULT_AVG_SERVICE_TIME: 10,    // minutes
  MAX_QUEUE_CAPACITY: 100,         // Max patients in one queue
  
  // Notifications
  CALL_ANNOUNCEMENT_REPEAT: 2,     // Times to announce when calling
  NOTIFICATION_ADVANCE_MINUTES: 5, // Notify patient X minutes before turn
  
  // Display
  DISPLAY_REFRESH_INTERVAL: 5000,  // milliseconds
  SHOW_ESTIMATED_WAIT_TIME: true,
  SHOW_POSITION_IN_QUEUE: true
};

// ==================== PRIORITY REASONS ====================
/**
 * Predefined reasons for priority assignment
 */
export const PRIORITY_REASONS = {
  // Emergency
  BILLING_EMERGENCY: 'Emergency billing entry',
  MEDICAL_EMERGENCY: 'Medical emergency',
  ACCIDENT_TRAUMA: 'Accident/Trauma case',
  
  // Urgent
  DOCTOR_URGENT_REFERRAL: 'Doctor urgent referral',
  STAT_DIAGNOSTIC: 'STAT diagnostic order',
  CRITICAL_REPORT: 'Critical report collection',
  
  // Priority
  SENIOR_CITIZEN: 'Senior citizen (60+ years)',
  PREGNANT_WOMAN: 'Pregnant woman',
  DISABLED_PERSON: 'Person with disability',
  INFANT_CHILD: 'Infant/Young child (0-5 years)',
  VIP_PATIENT: 'VIP patient',
  STAFF_FAMILY: 'Hospital staff/family',
  FOLLOW_UP_URGENT: 'Urgent follow-up'
};

// ==================== VISIT TYPES ====================
/**
 * Types of hospital visits (for billing and queue routing)
 */
export const VISIT_TYPE = {
  OPD: 'OPD',               // Outpatient
  IPD: 'IPD',               // Inpatient
  EMERGENCY: 'EMERGENCY',   // Emergency department
  DIAGNOSTIC: 'DIAGNOSTIC', // Diagnostics only
  FOLLOW_UP: 'FOLLOW_UP',   // Follow-up visit
  PROCEDURE: 'PROCEDURE'    // Day procedure
};

// ==================== QUEUE ACTIONS ====================
/**
 * Actions that can be performed on queue entries
 */
export const QUEUE_ACTION = {
  CHECK_IN: 'CHECK_IN',
  CALL_NEXT: 'CALL_NEXT',
  START_SERVICE: 'START_SERVICE',
  COMPLETE: 'COMPLETE',
  SKIP: 'SKIP',
  RECALL: 'RECALL',
  TRANSFER: 'TRANSFER',
  CANCEL: 'CANCEL',
  HOLD: 'HOLD',
  UNHOLD: 'UNHOLD',
  CHANGE_PRIORITY: 'CHANGE_PRIORITY'
};

// ==================== NOTIFICATION MODES ====================
/**
 * How patients are notified when called
 */
export const NOTIFICATION_MODE = {
  DISPLAY_BOARD: 'DISPLAY_BOARD',   // TV/Monitor display
  SMS: 'SMS',                        // SMS to phone
  APP_PUSH: 'APP_PUSH',              // Mobile app notification
  ANNOUNCEMENT: 'ANNOUNCEMENT',      // Voice announcement
  WHATSAPP: 'WHATSAPP'               // WhatsApp message
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get priority level from various sources
 */
export function determinePriority(options = {}) {
  const { 
    isEmergency, 
    urgency, 
    patientAge, 
    isPregnant, 
    isDisabled,
    isVIP,
    isStaff
  } = options;
  
  // Emergency from billing always takes top priority
  if (isEmergency) {
    return {
      priority: QUEUE_PRIORITY.EMERGENCY,
      reason: PRIORITY_REASONS.BILLING_EMERGENCY
    };
  }
  
  // STAT/Urgent diagnostic
  if (urgency === 'STAT') {
    return {
      priority: QUEUE_PRIORITY.URGENT,
      reason: PRIORITY_REASONS.STAT_DIAGNOSTIC
    };
  }
  
  if (urgency === 'URGENT') {
    return {
      priority: QUEUE_PRIORITY.URGENT,
      reason: PRIORITY_REASONS.DOCTOR_URGENT_REFERRAL
    };
  }
  
  // Priority cases
  if (patientAge >= 60) {
    return {
      priority: QUEUE_PRIORITY.PRIORITY,
      reason: PRIORITY_REASONS.SENIOR_CITIZEN
    };
  }
  
  if (isPregnant) {
    return {
      priority: QUEUE_PRIORITY.PRIORITY,
      reason: PRIORITY_REASONS.PREGNANT_WOMAN
    };
  }
  
  if (isDisabled) {
    return {
      priority: QUEUE_PRIORITY.PRIORITY,
      reason: PRIORITY_REASONS.DISABLED_PERSON
    };
  }
  
  if (patientAge <= 5) {
    return {
      priority: QUEUE_PRIORITY.PRIORITY,
      reason: PRIORITY_REASONS.INFANT_CHILD
    };
  }
  
  if (isVIP) {
    return {
      priority: QUEUE_PRIORITY.PRIORITY,
      reason: PRIORITY_REASONS.VIP_PATIENT
    };
  }
  
  if (isStaff) {
    return {
      priority: QUEUE_PRIORITY.PRIORITY,
      reason: PRIORITY_REASONS.STAFF_FAMILY
    };
  }
  
  return {
    priority: QUEUE_PRIORITY.NORMAL,
    reason: null
  };
}

/**
 * Calculate estimated wait time based on position and average service time
 */
export function calculateEstimatedWaitTime(position, avgServiceTime = 10) {
  return position * avgServiceTime;
}

/**
 * Generate display-friendly token number
 */
export function formatTokenNumber(tokenNumber, prefix = '') {
  const paddedNumber = String(tokenNumber).padStart(3, '0');
  return prefix ? `${prefix}-${paddedNumber}` : paddedNumber;
}

/**
 * Get queue code for a service
 */
export function generateQueueCode(serviceType, department, identifier) {
  // Example: OPD_CARDIOLOGY_DR_SHARMA, LAB_BLOOD_COLLECTION_001
  const parts = [serviceType];
  if (department) parts.push(department);
  if (identifier) parts.push(identifier.replace(/\s+/g, '_').toUpperCase());
  return parts.join('_');
}

/**
 * Check if queue is accepting patients based on working hours
 */
export function isQueueOpen(workingHours, now = new Date()) {
  if (!workingHours) return true;
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const day = dayNames[now.getDay()];
  const daySchedule = workingHours[day];
  
  if (!daySchedule) return false;
  
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return currentTime >= daySchedule.start && currentTime <= daySchedule.end;
}

/**
 * Sort queue entries by priority and join time
 */
export function sortQueueByPriority(queueEntries) {
  return queueEntries.sort((a, b) => {
    // First sort by priority
    const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then by join time (earlier first)
    return new Date(a.joinedAt) - new Date(b.joinedAt);
  });
}

export default {
  QUEUE_STATUS,
  QUEUE_PRIORITY,
  PRIORITY_ORDER,
  SERVICE_TYPE,
  QUEUE_CONFIG,
  PRIORITY_REASONS,
  VISIT_TYPE,
  QUEUE_ACTION,
  NOTIFICATION_MODE,
  determinePriority,
  calculateEstimatedWaitTime,
  formatTokenNumber,
  generateQueueCode,
  isQueueOpen,
  sortQueueByPriority
};
