export type CaseStatus = "active" | "pending" | "closed" | "urgent";
export type Priority = "low" | "medium" | "high" | "urgent";
export type DocumentType = "pdf" | "docx" | "xlsx" | "image" | "other";
export type OCRStatus = "completed" | "processing" | "failed" | "pending";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "individual" | "corporate";
  status: "active" | "inactive";
  createdAt: string;
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  status: CaseStatus;
  clientId: string;
  clientName: string;
  lawyerId: string;
  lawyerName: string;
  court: string;
  category: string;
  openedAt: string;
  nextHearing?: string;
  description?: string;
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

export interface Hearing {
  id: string;
  caseId: string;
  caseTitle: string;
  court: string;
  date: string;
  time: string;
  location: string;
  type: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "waiting" | "in_progress" | "review" | "completed";
  priority: Priority;
  assignee: string;
  assigneeAvatar?: string;
  dueDate: string;
  caseId?: string;
  caseTitle?: string;
  tags: string[];
  progress: number;
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  folderId?: string;
  caseId?: string;
  arbitrationCaseId?: string;
  tags: string[];
  ocrStatus: OCRStatus;
  version: number;
  url?: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  caseId?: string;
  isSystem?: boolean;
  children?: Folder[];
  documentCount: number;
}

export interface Activity {
  id: string;
  type: "case" | "document" | "task" | "hearing" | "message" | "finance";
  title: string;
  description: string;
  user: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  timestamp: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "hearing" | "document" | "note" | "task" | "status";
  user: string;
}

export interface DashboardStats {
  activeCases: number;
  activeCasesChange: number;
  pendingTasks: number;
  pendingTasksChange: number;
  upcomingHearings: number;
  upcomingHearingsChange: number;
  monthlyRevenue: number;
  monthlyRevenueChange: number;
  totalClients?: number;
  totalDocuments?: number;
}

export interface LawyerPerformance {
  name: string;
  cases: number;
  winRate: number;
  tasksCompleted: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
}
