export enum UserRole {
  JOURNALIST = 'ROLE_JOURNALIST',
  EDITOR = 'ROLE_EDITOR',
  ADMIN = 'ROLE_ADMIN',
}

export enum ReportStatus {
  DRAFT = 'DRAFT',           // Backend equivalent of "Needs Revision"
  SUBMITTED = 'SUBMITTED',   // Backend equivalent of "Pending"
  VERIFIED = 'VERIFIED',     // Backend equivalent of "Approved"
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  DELETED = 'DELETED',
}

export enum WorkflowAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  REQUEST_REVISION = 'REQUEST_REVISION',
  FLAG_MISINFORMATION = 'FLAG_MISINFORMATION',
}

export interface ResponseDTO<T> {
  timestamp: string;
  status: number;
  message: string;
  data: T;
  errors?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  fullName?: string;
  role?: string[];
}

export interface JwtResponse {
  token: string;
  type: string;
  refreshToken: string;
  id: number;
  email: string;
  roles: string[];
  enabled: boolean;
}

export interface MfaSetupResponse {
  secret: string;
  qrCodeUrl: string;
}

export interface MfaVerifyRequest {
  code: string;
}

export interface ReportRequest {
  title: string;
  content: string;
  summary: string;
  latitude: number;
  longitude: number;
  casualtyCount?: number;
  categories?: string[];
  mediaFiles?: string[];
}

export interface ReportResponse {
  id: number;
  title: string;
  content: string;
  summary: string;
  authorName: string;
  status: string;
  latitude: number;
  longitude: number;
  casualtyCount?: number;
  createdAt: string;
  categories?: string[];
}

export interface ReviewRequest {
  action: WorkflowAction;
  comment?: string;
}

export interface User {
  id: number;
  email: string;
  fullName?: string;
  isEnabled: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  roles: Role[];
}

export interface Role {
  id: number;
  name: UserRole;
}

export interface AuditLog {
  id: number;
  action: string;
  username: string;
  details: string;
  timestamp: string;
}

export interface SystemBackup {
  id: number;
  filename: string;
  fileSizeMb: number;
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';
  logMessage?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
  flaggedReports: number;
  totalCasualties: number;
  reportsByStatus: Record<string, number>;
  recentActivity: Array<{
    id: number;
    title: string;
    status: string;
    createdAt: string;
  }>;
}
