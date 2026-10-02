import type {
  CaseApiResponse,
  ClientApiResponse,
  DocumentApiResponse,
  FolderApiResponse,
  HearingApiResponse,
  TaskApiResponse,
  AuditLogApiResponse,
} from "@/types/api";
import type { Activity, Case, Client, Document, Folder, Hearing, OCRStatus, Task } from "@/types";
import type { DocumentNode, FolderNode } from "@/types/document";

const caseStatusMap: Record<CaseApiResponse["status"], Case["status"]> = {
  ACTIVE: "active",
  PENDING: "pending",
  CLOSED: "closed",
  URGENT: "urgent",
};

const taskStatusMap: Record<TaskApiResponse["status"], Task["status"]> = {
  WAITING: "waiting",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  COMPLETED: "completed",
};

const taskPriorityMap: Record<TaskApiResponse["priority"], Task["priority"]> = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

const ocrStatusMap: Record<DocumentApiResponse["ocrStatus"], OCRStatus> = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

function inferDocumentType(name: string, contentType?: string): Document["type"] {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf" || contentType?.includes("pdf")) return "pdf";
  if (ext === "docx" || ext === "doc" || contentType?.includes("word")) return "docx";
  if (ext === "xlsx" || ext === "xls" || contentType?.includes("sheet")) return "xlsx";
  if (contentType?.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp"].includes(ext ?? ""))
    return "image";
  return "other";
}

export function mapCase(api: CaseApiResponse): Case {
  return {
    id: api.id,
    caseNumber: api.caseNumber,
    title: api.title,
    description: api.description,
    status: caseStatusMap[api.status],
    clientId: api.clientId,
    clientName: api.clientName,
    lawyerId: api.lawyerId ?? "",
    lawyerName: api.lawyerName ?? "—",
    court: api.court ?? "",
    category: api.category ?? "",
    openedAt: api.openedAt ?? "",
    nextHearing: api.nextHearing,
    courtBasisNumber: api.courtBasisNumber,
    decisionNumber: api.decisionNumber,
    clientRole: api.clientRole,
    counterpartyName: api.counterpartyName,
    counterpartyLawyer: api.counterpartyLawyer,
    hasSubjectVehicle: api.hasSubjectVehicle,
    vehiclePlate: api.vehiclePlate,
    vehicleInfo: api.vehicleInfo,
    claimAmount: api.claimAmount,
    dmsRootFolderId: api.dmsRootFolderId,
  };
}

export function mapClient(api: ClientApiResponse): Client {
  return {
    id: api.id,
    name: api.name,
    email: api.email,
    phone: api.phone ?? "",
    type: api.type === "CORPORATE" ? "corporate" : "individual",
    status: api.status === "ACTIVE" ? "active" : "inactive",
    createdAt: "",
  };
}

export function mapDocument(api: DocumentApiResponse): Document {
  return {
    id: api.id,
    name: api.name,
    type: inferDocumentType(api.name, api.contentType),
    size: api.fileSize ?? 0,
    uploadedBy: api.uploadedBy ?? "—",
    uploadedAt: api.uploadedAt ?? new Date().toISOString(),
    folderId: api.folderId,
    caseId: api.caseId,
    arbitrationCaseId: api.arbitrationCaseId,
    tags: [],
    ocrStatus: ocrStatusMap[api.ocrStatus],
    version: api.currentVersion,
  };
}

export function mapFolder(api: FolderApiResponse): Folder {
  return {
    id: api.id,
    name: api.name,
    parentId: api.parentId,
    caseId: api.caseId,
    isSystem: api.system,
    documentCount: api.documentCount,
    children: api.children?.map(mapFolder),
  };
}

export function mapFolderNode(api: FolderApiResponse): FolderNode {
  return {
    id: api.id,
    name: api.name,
    parentId: api.parentId ?? null,
    caseId: api.caseId ?? null,
    arbitrationCaseId: api.arbitrationCaseId ?? null,
    isSystem: api.system,
    documentCount: api.documentCount,
    createdAt: "",
    children: api.children?.map(mapFolderNode),
  };
}

export function mapDocumentNode(doc: Document): DocumentNode {
  return {
    id: doc.id,
    title: doc.name,
    folderId: doc.folderId ?? null,
    fileSize: doc.size,
    fileType: doc.type,
    updatedAt: doc.uploadedAt,
  };
}

export function mapTask(api: TaskApiResponse): Task {
  return {
    id: api.id,
    title: api.title,
    description: api.description,
    status: taskStatusMap[api.status],
    priority: taskPriorityMap[api.priority],
    assignee: api.assigneeName ?? "—",
    dueDate: api.dueDate ?? "",
    caseId: api.caseId,
    caseTitle: api.caseTitle,
    tags: [],
    progress: api.progress,
  };
}

export function mapHearing(api: HearingApiResponse): Hearing {
  return {
    id: api.id,
    caseId: api.caseId,
    caseTitle: api.caseTitle,
    court: api.court,
    date: api.hearingDate,
    time: api.hearingTime?.substring(0, 5) ?? "—",
    location: api.location ?? "—",
    type: api.hearingType ?? "Duruşma",
  };
}

export function mapRoleToLabel(roles: string[]): string {
  const role = roles[0]?.replace("ROLE_", "") ?? "USER";
  const labels: Record<string, string> = {
    ADMIN: "Sistem Yöneticisi",
    PARTNER: "Ortak Avukat",
    LAWYER: "Avukat",
    ASSISTANT: "Asistan",
    ACCOUNTING: "Muhasebe",
    CLIENT: "Müvekkil",
  };
  return labels[role] ?? role;
}

const actionTitles: Record<AuditLogApiResponse["action"], string> = {
  LOGIN: "Oturum açıldı",
  LOGOUT: "Oturum kapatıldı",
  CREATE: "Kayıt oluşturuldu",
  UPDATE: "Kayıt güncellendi",
  DELETE: "Kayıt silindi",
  UPLOAD: "Belge yüklendi",
  DOWNLOAD: "Belge indirildi",
};

const entityLabels: Record<string, string> = {
  Client: "Müvekkil",
  Case: "Dava",
  Document: "Belge",
  Task: "Görev",
  Hearing: "Duruşma",
  User: "Kullanıcı",
  Organization: "Kurum",
  ArbitrationCase: "Tahkim dosyası",
  ArbitrationDocument: "Tahkim evrakı",
};

function mapEntityToActivityType(entityType: string): Activity["type"] {
  switch (entityType) {
    case "Case":
    case "ArbitrationCase":
      return "case";
    case "Document":
    case "ArbitrationDocument":
      return "document";
    case "Task":
      return "task";
    case "Hearing":
      return "hearing";
    default:
      return "message";
  }
}

export function mapAuditToActivity(audit: AuditLogApiResponse): Activity {
  const entityLabel = entityLabels[audit.entityType] ?? audit.entityType;
  const actionTitle = actionTitles[audit.action] ?? audit.action;
  return {
    id: audit.id,
    type: mapEntityToActivityType(audit.entityType),
    title: `${entityLabel} — ${actionTitle}`,
    description: audit.details?.trim() || `${entityLabel} işlemi gerçekleştirildi`,
    user: audit.username,
    timestamp: audit.createdAt,
  };
}
