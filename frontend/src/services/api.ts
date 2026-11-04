import {
  ApiResponse,
  LoginResponse,
  PagedResult,
  SchoolDto,
  SchoolDetailDto,
  SchoolContactDto,
  SchoolAssignmentHistoryDto,
  VisitSummaryDto,
  VisitDto,
  VisitAnswerDto,
  QuestionCategoryDto,
  QuestionTemplateDto,
  ActivityDto,
  FollowUpDto,
  SalesTargetDto,
  PresentationDto,
  PresentationSlideDto,
  QACategoryDto,
  QATemplateDto,
  TeamMemberDto,
  DashboardStatsDto,
  PerformanceReportDto,
  ProductInterest
} from '../types';

const PRODUCTION_API_BASE = 'https://rootaca-sales-550287486754.me-central1.run.app/api/v1';

const API_BASE = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.PROD ? PRODUCTION_API_BASE : '/api/v1');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh-token')) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_BASE}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: token, refreshToken })
          });
          const refreshData: ApiResponse<LoginResponse> = await refreshRes.json();
          if (refreshData.success && refreshData.data) {
            localStorage.setItem('token', refreshData.data.accessToken);
            localStorage.setItem('refreshToken', refreshData.data.refreshToken);
            headers.set('Authorization', `Bearer ${refreshData.data.accessToken}`);
            const retryRes = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
            return await retryRes.json();
          }
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Network error occurred. Please check your connection.',
      errors: [error?.toString() || 'Unknown network error']
    };
  }
}

export const api = {
  // Auth
  login: (body: any) => request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  refreshToken: (body: any) => request<LoginResponse>('/auth/refresh-token', { method: 'POST', body: JSON.stringify(body) }),
  getCurrentUser: () => request<TeamMemberDto>('/auth/me'),
  changePassword: (body: any) => request<boolean>('/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),

  // Schools
  getSchools: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') query.append(key, val.toString());
    });
    return request<PagedResult<SchoolDto>>(`/schools?${query.toString()}`);
  },
  getSchoolById: (id: string) => request<SchoolDetailDto>(`/schools/${id}`),
  createSchool: (body: any) => request<SchoolDto>('/schools', { method: 'POST', body: JSON.stringify(body) }),
  updateSchool: (id: string, body: any) => request<SchoolDto>(`/schools/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  updateSchoolIntelligence: (id: string, intelligenceJson: string) => request<SchoolDetailDto>(`/schools/${id}/intelligence`, { method: 'PUT', body: JSON.stringify({ intelligenceJson }) }),
  updateSchoolDiscoveryAnswers: (id: string, discoveryAnswersJson: string) => request<SchoolDetailDto>(`/schools/${id}/discovery-answers`, { method: 'PUT', body: JSON.stringify({ discoveryAnswersJson }) }),
  deleteSchool: (id: string) => request<boolean>(`/schools/${id}`, { method: 'DELETE' }),

  // Contacts
  getContacts: (schoolId: string) => request<SchoolContactDto[]>(`/schools/${schoolId}/contacts`),
  addContact: (schoolId: string, body: any) => request<SchoolContactDto>(`/schools/${schoolId}/contacts`, { method: 'POST', body: JSON.stringify(body) }),
  updateContact: (schoolId: string, contactId: string, body: any) => request<SchoolContactDto>(`/schools/${schoolId}/contacts/${contactId}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteContact: (schoolId: string, contactId: string) => request<boolean>(`/schools/${schoolId}/contacts/${contactId}`, { method: 'DELETE' }),

  // Assignments
  assignSchool: (body: { schoolId: string; assignedToUserId: string; notes?: string }) => request<boolean>('/assignments', { method: 'POST', body: JSON.stringify(body) }),
  bulkAssign: (body: { schoolIds: string[]; assignedToUserId: string; notes?: string }) => request<number>('/assignments/bulk', { method: 'POST', body: JSON.stringify(body) }),
  getAssignmentHistory: (schoolId: string) => request<SchoolAssignmentHistoryDto[]>(`/assignments/history/${schoolId}`),
  getUnassignedSchools: () => request<SchoolDto[]>('/assignments/unassigned'),

  // Visits
  getVisits: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') query.append(key, val.toString());
    });
    return request<PagedResult<VisitSummaryDto>>(`/visits?${query.toString()}`);
  },
  getVisitById: (id: string) => request<VisitDto>(`/visits/${id}`),
  createVisit: (body: any) => request<VisitDto>('/visits', { method: 'POST', body: JSON.stringify(body) }),
  updateVisit: (id: string, body: any) => request<VisitDto>(`/visits/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteVisit: (id: string) => request<boolean>(`/visits/${id}`, { method: 'DELETE' }),

  // Discovery Questions
  getDiscoveryQuestions: (product?: ProductInterest) => request<QuestionCategoryDto[]>(`/discovery/questions${product ? `?product=${product}` : ''}`),
  createQuestionTemplate: (body: any) => request<QuestionTemplateDto>('/discovery/questions', { method: 'POST', body: JSON.stringify(body) }),
  updateQuestionTemplate: (id: string, body: any) => request<QuestionTemplateDto>(`/discovery/questions/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteQuestionTemplate: (id: string) => request<boolean>(`/discovery/questions/${id}`, { method: 'DELETE' }),
  getVisitAnswers: (visitId: string) => request<VisitAnswerDto[]>(`/discovery/visits/${visitId}/answers`),
  getSchoolLatestAnswers: (schoolId: string) => request<VisitAnswerDto[]>(`/discovery/schools/${schoolId}/answers`),

  // Activities & Follow-ups
  getActivities: (schoolId?: string, userId?: string) => {
    const query = new URLSearchParams();
    if (schoolId) query.append('schoolId', schoolId);
    if (userId) query.append('userId', userId);
    return request<ActivityDto[]>(`/activities?${query.toString()}`);
  },
  createActivity: (body: any) => request<ActivityDto>('/activities', { method: 'POST', body: JSON.stringify(body) }),
  toggleCompleteActivity: (id: string) => request<ActivityDto>(`/activities/${id}/toggle-complete`, { method: 'POST' }),
  deleteActivity: (id: string) => request<boolean>(`/activities/${id}`, { method: 'DELETE' }),

  getFollowUps: (schoolId?: string, userId?: string, onlyPending?: boolean) => {
    const query = new URLSearchParams();
    if (schoolId) query.append('schoolId', schoolId);
    if (userId) query.append('userId', userId);
    if (onlyPending !== undefined) query.append('onlyPending', onlyPending.toString());
    return request<FollowUpDto[]>(`/follow-ups?${query.toString()}`);
  },
  createFollowUp: (body: any) => request<FollowUpDto>('/follow-ups', { method: 'POST', body: JSON.stringify(body) }),
  updateFollowUp: (id: string, body: any) => request<FollowUpDto>(`/follow-ups/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteFollowUp: (id: string) => request<boolean>(`/follow-ups/${id}`, { method: 'DELETE' }),

  // Sales Targets
  getTargets: (year?: number, periodType?: string, userId?: string) => {
    const query = new URLSearchParams();
    if (year) query.append('year', year.toString());
    if (periodType) query.append('periodType', periodType);
    if (userId) query.append('userId', userId);
    return request<SalesTargetDto[]>(`/sales-targets?${query.toString()}`);
  },
  getTargetById: (id: string) => request<SalesTargetDto>(`/sales-targets/${id}`),
  createTarget: (body: any) => request<SalesTargetDto>('/sales-targets', { method: 'POST', body: JSON.stringify(body) }),
  updateTarget: (id: string, body: any) => request<SalesTargetDto>(`/sales-targets/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTarget: (id: string) => request<boolean>(`/sales-targets/${id}`, { method: 'DELETE' }),

  // Presentations
  getPresentations: (schoolId?: string, templatesOnly?: boolean) => {
    const query = new URLSearchParams();
    if (schoolId) query.append('schoolId', schoolId);
    if (templatesOnly !== undefined) query.append('templatesOnly', templatesOnly.toString());
    return request<PresentationDto[]>(`/presentations?${query.toString()}`);
  },
  getPresentationById: (id: string) => request<PresentationDto>(`/presentations/${id}`),
  createPresentation: (body: any) => request<PresentationDto>('/presentations', { method: 'POST', body: JSON.stringify(body) }),
  duplicatePresentation: (id: string, body?: { newTitle?: string; targetSchoolId?: string; isTemplate?: boolean }) =>
    request<PresentationDto>(`/presentations/${id}/duplicate`, { method: 'POST', body: JSON.stringify(body || {}) }),
  duplicatePresentationForSchool: (templateId: string, schoolId: string) => request<PresentationDto>(`/presentations/${templateId}/duplicate-for-school/${schoolId}`, { method: 'POST' }),
  deletePresentation: (id: string) => request<boolean>(`/presentations/${id}`, { method: 'DELETE' }),
  addSlide: (presentationId: string, body: any) => request<PresentationSlideDto>(`/presentations/${presentationId}/slides`, { method: 'POST', body: JSON.stringify(body) }),
  updateSlide: (slideId: string, body: any) => request<PresentationSlideDto>(`/presentations/slides/${slideId}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteSlide: (slideId: string) => request<boolean>(`/presentations/slides/${slideId}`, { method: 'DELETE' }),
  reorderSlides: (presentationId: string, slideIds: string[]) => request<boolean>(`/presentations/${presentationId}/reorder-slides`, { method: 'POST', body: JSON.stringify({ slideIds }) }),
  savePresentationVersion: (presentationId: string) => request<boolean>(`/presentations/${presentationId}/save-version`, { method: 'POST' }),
  publishPresentation: (id: string, body?: any) => request<any>(`/presentations/${id}/publish`, { method: 'POST', body: JSON.stringify(body || {}) }),
  unpublishPresentation: (id: string) => request<boolean>(`/presentations/${id}/unpublish`, { method: 'POST' }),
  regenerateShareToken: (id: string) => request<any>(`/presentations/${id}/regenerate-share-token`, { method: 'POST' }),
  getPresentationAnalytics: (id: string) => request<any>(`/presentations/${id}/analytics`),

  // Public Presentation View & Lead Capture
  getPublicPresentation: (shareToken: string) => request<any>(`/public/presentations/${shareToken}`),
  recordPublicViewEvent: (shareToken: string, body: any) => request<boolean>(`/public/presentations/${shareToken}/views`, { method: 'POST', body: JSON.stringify(body) }),
  submitPublicInquiry: (shareToken: string, body: any) => request<any>(`/public/presentations/${shareToken}/inquiry`, { method: 'POST', body: JSON.stringify(body) }),

  // Knowledge Base
  getQA: (product?: ProductInterest) => request<QACategoryDto[]>(`/knowledge-base${product ? `?product=${product}` : ''}`),
  createQA: (body: any) => request<QATemplateDto>('/knowledge-base', { method: 'POST', body: JSON.stringify(body) }),
  updateQA: (id: string, body: any) => request<QATemplateDto>(`/knowledge-base/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteQA: (id: string) => request<boolean>(`/knowledge-base/${id}`, { method: 'DELETE' }),

  // Users & Team
  getUsers: () => request<TeamMemberDto[]>('/users'),
  getUserById: (id: string) => request<TeamMemberDto>(`/users/${id}`),
  createUser: (body: any) => request<TeamMemberDto>('/users', { method: 'POST', body: JSON.stringify(body) }),
  updateUser: (id: string, body: any) => request<TeamMemberDto>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  setUserActiveStatus: (id: string, isActive: boolean) => request<boolean>(`/users/${id}/set-active`, { method: 'POST', body: JSON.stringify(isActive) }),

  // Dashboard & Reports
  getDashboardStats: () => request<DashboardStatsDto>('/dashboard'),
  getPerformanceReport: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') query.append(key, val.toString());
    });
    return request<PerformanceReportDto>(`/reports/performance?${query.toString()}`);
  },

  // Health
  checkHealth: () => request<any>('/health')
};
