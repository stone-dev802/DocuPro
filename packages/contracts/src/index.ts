import { z } from 'zod';

// ========================================================
// Rôles et Statuts - Contrats Fondamentaux V1
// ========================================================

export enum PlatformRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SUPPORT = 'SUPPORT',
}

export enum TenantRole {
  ADMIN = 'ADMIN',
  DOCUMENT_MANAGER = 'DOCUMENT_MANAGER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  VIEWER = 'VIEWER',
}

export enum MembershipStatus {
  INVITED = 'INVITED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum DocumentStatus {
  QUARANTINED = 'QUARANTINED',
  SCANNING = 'SCANNING',
  SCAN_FAILED_TEMPORARY = 'SCAN_FAILED_TEMPORARY',
  REJECTED_SECURITY = 'REJECTED_SECURITY',
  REJECTED_FORMAT = 'REJECTED_FORMAT',
  READY = 'READY',
}

export enum AntivirusDriver {
  CLAMAV = 'clamav',
  MOCK = 'mock',
}

// Formats autorisés en V1
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const;

export type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];

// ========================================================
// Types d'Événements d'Audit
// ========================================================

export const AuditActions = {
  // Auth
  AUTH_LOGIN_SUCCESS: 'auth.login_success',
  AUTH_LOGIN_FAILURE: 'auth.login_failure',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_PASSWORD_RESET_REQUEST: 'auth.password_reset_request',
  AUTH_PASSWORD_RESET_SUCCESS: 'auth.password_reset_success',
  
  // Membres
  MEMBER_INVITED: 'member.invited',
  MEMBER_JOINED: 'member.joined',
  MEMBER_ROLE_UPDATED: 'member.role_updated',
  MEMBER_SUSPENDED: 'member.suspended',
  MEMBER_ACTIVATED: 'member.activated',

  // Dossiers
  FOLDER_CREATED: 'folder.created',
  FOLDER_RENAMED: 'folder.renamed',
  FOLDER_TRASHED: 'folder.trashed',
  FOLDER_RESTORED: 'folder.restored',

  // Documents
  DOCUMENT_UPLOADED: 'document.uploaded',
  DOCUMENT_SCAN_PASSED: 'document.scan_passed',
  DOCUMENT_SCAN_FAILED: 'document.scan_failed',
  DOCUMENT_VIEWED: 'document.viewed',
  DOCUMENT_DOWNLOADED: 'document.downloaded',
  DOCUMENT_METADATA_UPDATED: 'document.metadata_updated',
  DOCUMENT_TRASHED: 'document.trashed',
  DOCUMENT_RESTORED: 'document.restored',
} as const;

// ========================================================
// Schemas Zod communs
// ========================================================

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
