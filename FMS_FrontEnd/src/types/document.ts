export interface FolderNode {
  id: string;
  name: string;
  parentId: string | null;
  caseId: string | null;
  arbitrationCaseId: string | null;
  isSystem: boolean;
  children?: FolderNode[];
  createdAt: string;
  documentCount?: number;
}

export interface DocumentNode {
  id: string;
  title: string;
  folderId: string | null;
  fileSize: number;
  fileType: string;
  updatedAt: string;
}

export type MoveItemType = "FOLDER" | "DOCUMENT";

export const MOVE_ITEM_TYPE = {
  FOLDER: "FOLDER",
  DOCUMENT: "DOCUMENT",
} as const satisfies Record<string, MoveItemType>;
