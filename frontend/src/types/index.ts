export type UserRole = 'SuperAdmin' | 'SalesManager' | 'SalesRepresentative';

export type SchoolType = 'National' | 'International' | 'Private' | 'Language' | 'Experimental' | 'Other';

export type LeadSource = 'FieldVisit' | 'Referral' | 'SocialMedia' | 'InboundCall' | 'Website' | 'Exhibition' | 'Other';

export type SalesStatus =
  | 'New'
  | 'Assigned'
  | 'Contacted'
  | 'VisitScheduled'
  | 'Visited'
  | 'DemoScheduled'
  | 'ProposalSent'
  | 'Negotiation'
  | 'ClosedWon'
  | 'ClosedLost'
  | 'Inactive';

export type ProductInterest = 'SmartSchool' | 'Academy' | 'Both' | 'Neither';

export type VisitOutcomeType =
  | 'DemoRequested'
  | 'MeetingScheduled'
  | 'ProposalRequested'
  | 'DetailsRequested'
  | 'DecisionMakerNotReached'
  | 'NotInterested'
  | 'FollowUpLater'
  | 'ClosedWon'
  | 'ClosedLost';

export type ActivityType = 'Call' | 'Visit' | 'Meeting' | 'Email' | 'WhatsApp' | 'Note' | 'Reminder';

export type FollowUpStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';

export type FollowUpPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type AnswerType = 'Text' | 'Number' | 'YesNo' | 'SingleChoice' | 'MultipleChoice';

export type PeriodType = 'Monthly' | 'Quarterly';

export type SlideCategory = 'CompanyOverview' | 'SmartSchool' | 'Academy' | 'ValueProposition' | 'Closing';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
  createdAtUtc: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  user: UserDto;
}

export interface SchoolDto {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city: string;
  district?: string;
  schoolType: SchoolType;
  source: LeadSource;
  salesStatus: SalesStatus;
  generalNotes?: string;
  createdByUserId: string;
  createdByUserName?: string;
  assignedToUserId?: string;
  assignedToUserName?: string;
  contactsCount: number;
  visitsCount: number;
  activitiesCount: number;
  lastVisitDate?: string;
  nextFollowUpDate?: string;
  createdAtUtc: string;
  updatedAtUtc?: string;
}

export interface SchoolContactDto {
  id: string;
  schoolId: string;
  fullName: string;
  jobTitle: string;
  phone: string;
  email?: string;
  isDecisionMaker: boolean;
  isPrimaryContact: boolean;
  contactNotes?: string;
  createdAtUtc: string;
}

export interface SchoolAssignmentHistoryDto {
  id: string;
  schoolId: string;
  assignedToUserId: string;
  assignedToUserName: string;
  assignedByUserId: string;
  assignedByUserName: string;
  assignedAtUtc: string;
  unassignedAtUtc?: string;
  notes?: string;
}

export interface VisitSummaryDto {
  id: string;
  schoolId: string;
  representativeName: string;
  visitDate: string;
  contactPerson: string;
  decisionMakerReached: boolean;
  interestedProducts: ProductInterest;
  visitOutcome: VisitOutcomeType;
  nextAction?: string;
  nextFollowUpDate?: string;
  createdAtUtc: string;
}

export interface VisitAnswerDto {
  id: string;
  visitId: string;
  schoolId: string;
  questionTemplateId: string;
  questionSnapshotAr: string;
  questionSnapshotEn: string;
  answerValue: string;
  createdAtUtc: string;
}

export interface VisitDto {
  id: string;
  schoolId: string;
  schoolName: string;
  representativeId: string;
  representativeName: string;
  visitDate: string;
  contactPerson: string;
  contactPosition?: string;
  decisionMakerReached: boolean;
  interestedProducts: ProductInterest;
  visitOutcome: VisitOutcomeType;
  notes?: string;
  nextAction?: string;
  nextFollowUpDate?: string;
  answers: VisitAnswerDto[];
  createdAtUtc: string;
}

export interface ActivityDto {
  id: string;
  schoolId: string;
  schoolName: string;
  userId: string;
  userName: string;
  type: ActivityType;
  subject: string;
  description?: string;
  dueDateUtc?: string;
  completedAtUtc?: string;
  isCompleted: boolean;
  createdAtUtc: string;
}

export interface FollowUpDto {
  id: string;
  schoolId: string;
  schoolName: string;
  assignedToUserId: string;
  assignedToUserName: string;
  dueDate: string;
  priority: FollowUpPriority;
  status: FollowUpStatus;
  title: string;
  notes?: string;
  completedAtUtc?: string;
  isOverdue: boolean;
  createdAtUtc: string;
}

export interface SchoolDetailDto extends SchoolDto {
  contacts: SchoolContactDto[];
  assignmentHistory: SchoolAssignmentHistoryDto[];
  recentVisits: VisitSummaryDto[];
  recentActivities: ActivityDto[];
  pendingFollowUps: FollowUpDto[];
}

export interface QuestionTemplateDto {
  id: string;
  categoryId: string;
  categoryNameAr: string;
  categoryNameEn: string;
  product: ProductInterest;
  questionAr: string;
  questionEn: string;
  guidanceAr?: string;
  guidanceEn?: string;
  answerType: AnswerType;
  optionsJson?: string;
  isRequired: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface QuestionCategoryDto {
  id: string;
  nameAr: string;
  nameEn: string;
  displayOrder: number;
  questions: QuestionTemplateDto[];
}

export interface SalesTargetDto {
  id: string;
  userId: string;
  userName: string;
  periodType: PeriodType;
  periodYear: number;
  periodNumber: number;
  targetNewSchools: number;
  targetVisits: number;
  targetDecisionMakersReached: number;
  targetDemosScheduled: number;
  targetProposalsRequested: number;
  targetClosedDeals: number;
  notes?: string;
  actualNewSchools: number;
  actualVisits: number;
  actualDecisionMakersReached: number;
  actualDemosScheduled: number;
  actualProposalsRequested: number;
  actualClosedDeals: number;
  overallAchievementRate: number;
  createdAtUtc: string;
}

export interface PresentationSlideDto {
  id: string;
  presentationId: string;
  slideTitleAr: string;
  slideTitleEn: string;
  contentAr: string;
  contentEn: string;
  keyPointsArJson?: string;
  keyPointsEnJson?: string;
  imageUrl?: string;
  category: SlideCategory;
  displayOrder: number;
  isEnabled: boolean;
  notes?: string;
}

export interface PresentationDto {
  id: string;
  schoolId?: string;
  schoolName?: string;
  title: string;
  description?: string;
  isTemplate: boolean;
  selectedProducts: ProductInterest;
  versionNumber: number;
  slidesCount: number;
  slides: PresentationSlideDto[];
  createdAtUtc: string;
  updatedAtUtc?: string;
}

export interface QATemplateDto {
  id: string;
  categoryId: string;
  categoryNameAr: string;
  categoryNameEn: string;
  product: ProductInterest;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
  internalNotes?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface QACategoryDto {
  id: string;
  nameAr: string;
  nameEn: string;
  displayOrder: number;
  items: QATemplateDto[];
}

export interface TeamMemberDto {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  isActive: boolean;
  roles: string[];
  discoveredSchoolsCount: number;
  assignedSchoolsCount: number;
  visitsCount: number;
  closedDealsCount: number;
  createdAtUtc: string;
}

export interface StageCountDto {
  stage: SalesStatus;
  stageName: string;
  count: number;
}

export interface ProductInterestCountDto {
  product: ProductInterest;
  productName: string;
  count: number;
}

export interface RepPerformanceDto {
  representativeId: string;
  representativeName: string;
  discoveredSchools: number;
  assignedSchools: number;
  visits: number;
  demosScheduled: number;
  proposalsRequested: number;
  closedDeals: number;
  targetAchievementRate: number;
}

export interface DashboardStatsDto {
  totalSchools: number;
  newSchools: number;
  visitedSchools: number;
  unassignedSchools: number;
  mySchoolsCount: number;
  myAssignedSchoolsCount: number;
  totalVisits: number;
  demosRequested: number;
  proposalsRequested: number;
  followUpsDueCount: number;
  followUpsOverdueCount: number;
  overallTargetAchievementRate: number;
  schoolsByStage: StageCountDto[];
  visitsByProduct: ProductInterestCountDto[];
  topRepresentatives: RepPerformanceDto[];
  upcomingVisits: VisitSummaryDto[];
  overdueFollowUps: FollowUpDto[];
}

export interface PerformanceReportDto {
  totalSchoolsDiscovered: number;
  totalVisits: number;
  totalDecisionMakersReached: number;
  totalDemosRequested: number;
  totalProposalsRequested: number;
  totalClosedDeals: number;
  rows: RepPerformanceDto[];
}
