import {
  LoginRequest,
  SignupRequest,
  JwtResponse,
  ResponseDTO,
  MfaSetupResponse,
  MfaVerifyRequest,
  ReportRequest,
  ReportResponse,
  ReviewRequest,
  User,
  AuditLog,
  SystemBackup,
  DashboardStats,
  ReportAction,
  AiEditorRequest,
  AiEditorResponse
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  // Low-level fetch wrapper
  private async execute<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ResponseDTO<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // --- Generic Request Method for Chat/Components ---
  // This matches the signature used in Chat.tsx: (method, url, body?)
  public async request<T>(method: string, endpoint: string, body?: any): Promise<ResponseDTO<T>> {
    return this.execute<T>(endpoint, {
      method,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // --- Auth & Core Methods ---

  async login(credentials: LoginRequest): Promise<ResponseDTO<JwtResponse>> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) {
      throw data; // Throw the whole DTO so we can access data.data for the pre-auth token
    }
    return data;
  }

  async register(data: SignupRequest): Promise<ResponseDTO<{ message: string }>> {
    return this.execute<{ message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async setupMfa(): Promise<ResponseDTO<MfaSetupResponse>> {
    return this.execute<MfaSetupResponse>('/api/auth/mfa/setup');
  }

  async verifyMfa(data: MfaVerifyRequest): Promise<ResponseDTO<any>> {
    return this.execute<any>('/api/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
    });
  }

  async forgotPassword(email: string): Promise<ResponseDTO<string>> {
    return this.execute<string>('/api/auth/password/forgot', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<ResponseDTO<string>> {
    return this.execute<string>('/api/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async getAllReports(): Promise<ResponseDTO<ReportResponse[]>> {
    return this.execute<ReportResponse[]>('/api/reports');
  }

  async getReportById(id: number): Promise<ResponseDTO<ReportResponse>> {
    return this.execute<ReportResponse>(`/api/reports/${id}`);
  }

  async submitReport(data: ReportRequest): Promise<ResponseDTO<ReportResponse>> {
    return this.execute<ReportResponse>('/api/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReport(id: number, data: ReportRequest): Promise<ResponseDTO<ReportResponse>> {
    return this.execute<ReportResponse>(`/api/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReport(id: number): Promise<ResponseDTO<unknown>> {
    return this.execute<unknown>(`/api/reports/${id}`, {
      method: 'DELETE',
    });
  }

  async searchReports(params: {
    status?: string;
    authorId?: number;
  }): Promise<ResponseDTO<ReportResponse[]>> {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.authorId) queryParams.append('authorId', params.authorId.toString());
    return this.execute<ReportResponse[]>(`/api/reports/search?${queryParams}`);
  }

  async changeReportStatus(id: number, review: ReviewRequest): Promise<ResponseDTO<unknown>> {
    return this.execute<unknown>(`/api/workflow/reports/${id}/status`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  async flagReport(id: number): Promise<ResponseDTO<unknown>> {
    return this.execute<unknown>(`/api/workflow/reports/${id}/flag`, {
      method: 'POST',
    });
  }

  async checkMisinformation(id: number): Promise<ResponseDTO<{ confidenceScore: number; reason: string }>> {
    return this.execute<{ confidenceScore: number; reason: string }>(`/api/workflow/reports/${id}/ai-check`);
  }

  async getAiSuggestedEdits(data: AiEditorRequest): Promise<ResponseDTO<AiEditorResponse>> {
    return this.execute<AiEditorResponse>('/api/crisis-reports/ai-edit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFlaggedReports(): Promise<ResponseDTO<unknown>> {
    return this.execute<unknown>('/api/workflow/flagged');
  }

  async getReportVersions(id: number): Promise<ResponseDTO<unknown>> {
    return this.execute<unknown>(`/api/workflow/reports/${id}/versions`);
  }

  async getReportActions(id: number): Promise<ResponseDTO<ReportAction[]>> {
    return this.execute<ReportAction[]>(`/api/workflow/reports/${id}/actions`);
  }

  async getDashboardStats(): Promise<ResponseDTO<DashboardStats>> {
    return this.execute<DashboardStats>('/api/analytics/dashboard');
  }

  async getAllUsers(isEnabled?: boolean): Promise<ResponseDTO<User[]>> {
    const query = isEnabled !== undefined ? `?is_enabled=${isEnabled}` : '';
    return this.execute<User[]>(`/api/admin/users${query}`);
  }

  async approveUser(id: number): Promise<ResponseDTO<unknown>> {
    return this.execute<unknown>(`/api/admin/users/${id}/approve`, {
      method: 'PUT',
    });
  }

  async banUser(id: number): Promise<ResponseDTO<unknown>> {
    return this.execute<unknown>(`/api/admin/users/${id}/ban`, {
      method: 'PUT',
    });
  }

  async getAuditLogs(): Promise<ResponseDTO<AuditLog[]>> {
    return this.execute<AuditLog[]>('/api/admin/audit-logs');
  }

  async getBackupHistory(): Promise<ResponseDTO<SystemBackup[]>> {
    return this.execute<SystemBackup[]>('/api/admin/backups');
  }

  async triggerBackup(): Promise<ResponseDTO<string>> {
    return this.execute<string>('/api/admin/backups/trigger', {
      method: 'POST',
    });
  }

  async restoreBackup(filename: string): Promise<ResponseDTO<string>> {
    return this.execute<string>(`/api/admin/backups/restore/${filename}`, {
      method: 'POST',
    });
  }

  async uploadMedia(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/media/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.text();
  }

  async syncBatch(reports: ReportRequest[]): Promise<ResponseDTO<string>> {
    return this.execute<string>('/api/sync/batch', {
      method: 'POST',
      body: JSON.stringify(reports),
    });
  }
}

export const apiClient = new ApiClient();