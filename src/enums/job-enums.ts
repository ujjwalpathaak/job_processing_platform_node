export enum JobCategories {
  EXTERNAL = "EXTERNAL",
  STANDARD = "STANDARD",
  CRITICAL = "CRITICAL",
}

export enum JobHandlerTypes {
  EMAIL = "email",
  REPORT_GENERATION = "report_generation",
  NOTIFICATION_CLEANUP = "notification_cleanup",
  WEBHOOK_TRIGGER = "webhook_trigger",
  CRM_SYNC = "crm_sync",
  PAYMENT = "payment",
  REFUND = "refund",
}

export enum JobStatuses {
  SCHEDULED = "SCHEDULED",
  PUBLISHED = "PUBLISHED",
  PROCESSING = "PROCESSING",
  PROCESSED = "PROCESSED",
  RETRY = "RETRY",
  ERROR = "ERROR",
  DEAD = "DEAD",
}
