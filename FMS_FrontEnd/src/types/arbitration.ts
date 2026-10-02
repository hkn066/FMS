export type ArbitrationStatus =
  | "PRE_APPLICATION"
  | "NEW_APPLICATION"
  | "IN_COMMISSION"
  | "EXPERT_REVIEW"
  | "DECIDED"
  | "CLOSED";

export type ArbitrationDocumentCategory =
  | "RUHSAT"
  | "VEKALETNAME"
  | "BILIRKISI_RAPORU"
  | "EKSPER_RAPORU"
  | "KAZA_FOTOGRAFLARI"
  | "DIGER";

export interface ArbitrationCase {
  id: string;
  licensePlate: string;
  clientNameSurname: string;
  arbitrationFileNumber?: string | null;
  courtBasisNumber?: string | null;
  folderName: string;
  dmsRootFolderId?: string | null;
  status: ArbitrationStatus;
  createdAt?: string;
}

export interface ArbitrationDocument {
  id: string;
  name: string;
  contentType?: string;
  fileSize?: number;
  category: ArbitrationDocumentCategory;
  uploadedBy?: string;
  uploadedAt?: string;
}

export interface ArbitrationDocumentsResponse {
  arbitrationCaseId: string;
  virtualFolderName: string;
  documents: ArbitrationDocument[];
  byCategory: Record<ArbitrationDocumentCategory, ArbitrationDocument[]>;
}

export interface CreateArbitrationCasePayload {
  licensePlate: string;
  clientNameSurname: string;
  arbitrationFileNumber?: string;
  courtBasisNumber?: string;
  status?: ArbitrationStatus;
}

export interface UpdateArbitrationCasePayload {
  licensePlate?: string;
  clientNameSurname?: string;
  arbitrationFileNumber?: string;
  courtBasisNumber?: string;
  status?: ArbitrationStatus;
}

export const ARBITRATION_DOCUMENT_CATEGORIES: {
  value: ArbitrationDocumentCategory;
  label: string;
}[] = [
  { value: "RUHSAT", label: "Ruhsat" },
  { value: "VEKALETNAME", label: "Vekaletname" },
  { value: "BILIRKISI_RAPORU", label: "Bilirkişi Raporu" },
  { value: "EKSPER_RAPORU", label: "Eksper Raporu" },
  { value: "KAZA_FOTOGRAFLARI", label: "Kaza Fotoğrafları" },
  { value: "DIGER", label: "Diğer" },
];

export const ARBITRATION_STATUSES: Record<
  ArbitrationStatus,
  { label: string; color: string }
> = {
  PRE_APPLICATION: {
    label: "Ön Başvuru",
    color:
      "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/50 dark:text-slate-200 dark:border-slate-700",
  },
  NEW_APPLICATION: {
    label: "Yeni Başvuru",
    color:
      "bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-300 dark:border-cyan-900/50",
  },
  IN_COMMISSION: {
    label: "Komisyonda",
    color:
      "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50",
  },
  EXPERT_REVIEW: {
    label: "Bilirkişi İncelemesi",
    color:
      "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900/50",
  },
  DECIDED: {
    label: "Karar Verildi",
    color:
      "bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
  },
  CLOSED: {
    label: "Kapatıldı",
    color:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700",
  },
};

export const ARBITRATION_STATUS_FOLDER_NAMES: Record<ArbitrationStatus, string> = {
  PRE_APPLICATION: "Ön Başvuru",
  NEW_APPLICATION: "Yeni Başvuru",
  IN_COMMISSION: "Komisyonda",
  EXPERT_REVIEW: "Eksper İncelemesi",
  DECIDED: "Karar",
  CLOSED: "Kapalı",
};
