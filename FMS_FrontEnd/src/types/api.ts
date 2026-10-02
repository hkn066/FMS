export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
  };
}

export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  active: boolean;
}

export interface CaseApiResponse {
  id: string;
  caseNumber: string;
  title: string;
  description?: string;
  status: "ACTIVE" | "PENDING" | "CLOSED" | "URGENT";
  clientId: string;
  clientName: string;
  lawyerId?: string;
  lawyerName?: string;
  court?: string;
  category?: string;
  openedAt?: string;
  closedAt?: string;
  nextHearing?: string;
  courtBasisNumber?: string;
  decisionNumber?: string;
  clientRole?: string;
  counterpartyName?: string;
  counterpartyLawyer?: string;
  hasSubjectVehicle?: boolean;
  vehiclePlate?: string;
  vehicleInfo?: string;
  claimAmount?: number;
  dmsRootFolderId?: string;
}

export interface CreateCaseRequest {
  caseNumber?: string;
  title: string;
  description?: string;
  clientId: string;
  lawyerId?: string;
  court?: string;
  category?: string;
  openedAt?: string;
  nextHearing?: string;
  status?: string;
  courtBasisNumber?: string;
  decisionNumber?: string;
  clientRole?: string;
  counterpartyName?: string;
  counterpartyLawyer?: string;
  hasSubjectVehicle?: boolean;
  vehiclePlate?: string;
  vehicleInfo?: string;
  claimAmount?: number;
}

export interface ClientApiResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  taxNumber?: string;
  address?: string;
  type: "INDIVIDUAL" | "CORPORATE";
  status: "ACTIVE" | "INACTIVE";
}

export interface CreateClientRequest {
  name: string;
  email: string;
  phone?: string;
  taxNumber?: string;
  address?: string;
  type: "INDIVIDUAL" | "CORPORATE";
}

export interface DocumentApiResponse {
  id: string;
  name: string;
  contentType?: string;
  fileSize?: number;
  folderPath?: string;
  folderId?: string;
  currentVersion: number;
  ocrStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  caseId?: string;
  arbitrationCaseId?: string;
  uploadedBy?: string;
  uploadedAt?: string;
}

export interface FolderApiResponse {
  id: string;
  name: string;
  parentId?: string;
  caseId?: string;
  arbitrationCaseId?: string;
  system: boolean;
  documentCount: number;
  children?: FolderApiResponse[];
}

export interface TaskApiResponse {
  id: string;
  title: string;
  description?: string;
  status: "WAITING" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigneeId?: string;
  assigneeName?: string;
  caseId?: string;
  caseTitle?: string;
  dueDate?: string;
  progress: number;
}

export interface HearingApiResponse {
  id: string;
  caseId: string;
  caseTitle: string;
  court: string;
  hearingDate: string;
  hearingTime?: string;
  location?: string;
  hearingType?: string;
  notes?: string;
}

export interface DashboardApiResponse {
  activeCases: number;
  pendingTasks: number;
  upcomingHearings: number;
  totalClients: number;
  totalDocuments: number;
}

export interface AuditLogApiResponse {
  id: string;
  username: string;
  action: "LOGIN" | "LOGOUT" | "CREATE" | "UPDATE" | "DELETE" | "UPLOAD" | "DOWNLOAD";
  entityType: string;
  entityId?: string;
  details?: string;
  createdAt: string;
}

export interface LawyerPerformanceApiResponse {
  name: string;
  cases: number;
  winRate: number;
  tasksCompleted: number;
}

export interface ArbitrationCaseApiResponse {
  id: string;
  licensePlate: string;
  clientNameSurname: string;
  arbitrationFileNumber?: string;
  courtBasisNumber?: string;
  folderName: string;
  status: string;
  createdAt?: string;
}

export interface GlobalSearchResponse {
  clients: ClientApiResponse[];
  cases: CaseApiResponse[];
  arbitrations: ArbitrationCaseApiResponse[];
  documents: DocumentApiResponse[];
}
