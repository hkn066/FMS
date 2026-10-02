import apiClient from "@/lib/api-client";
import { mapDocument, mapFolderNode } from "@/lib/mappers";
import type { ApiResponse, DocumentApiResponse, FolderApiResponse, PageResponse } from "@/types/api";
import type { Document } from "@/types";
import type { DocumentNode, FolderNode, MoveItemType } from "@/types/document";

const CYCLE_ERROR_MESSAGE = "Hata: Bir klasör kendi alt klasörünün içine taşınamaz!";

export interface DmsScope {
  caseId?: string;
  arbitrationCaseId?: string;
}

export interface DmsListParams extends DmsScope {
  folderId?: string;
}

function isCycleError(message?: string): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("döngü") ||
    lower.includes("cycle") ||
    lower.includes("descendant") ||
    lower.includes("alt klasör")
  );
}

export const documentService = {
  async getAll(
    page = 0,
    size = 20,
    params: DmsListParams = {},
  ): Promise<{ documents: Document[]; total: number }> {
    const { folderId, caseId, arbitrationCaseId } = params;
    const { data } = await apiClient.get<ApiResponse<PageResponse<DocumentApiResponse>>>("/documents", {
      params: {
        page,
        size,
        ...(folderId ? { folderId } : {}),
        ...(caseId ? { caseId } : {}),
        ...(arbitrationCaseId ? { arbitrationCaseId } : {}),
      },
    });
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Belgeler alınamadı");
    }
    return {
      documents: data.data.content.map(mapDocument),
      total: data.data.totalElements,
    };
  },

  async upload(
    file: File,
    scope: DmsScope = {},
    folderId?: string,
  ): Promise<Document> {
    const formData = new FormData();
    formData.append("file", file);
    if (scope.caseId) formData.append("caseId", scope.caseId);
    if (scope.arbitrationCaseId) formData.append("arbitrationCaseId", scope.arbitrationCaseId);
    if (folderId) formData.append("folderId", folderId);

    const { data } = await apiClient.post<ApiResponse<DocumentApiResponse>>("/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Belge yüklenemedi");
    }
    return mapDocument(data.data);
  },

  async move(id: string, folderId?: string | null): Promise<Document> {
    const { data } = await apiClient.put<ApiResponse<DocumentApiResponse>>(`/documents/${id}/move`, {
      folderId: folderId ?? null,
    });
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Belge taşınamadı");
    }
    return mapDocument(data.data);
  },

  async getFolderTree(scope: DmsScope = {}): Promise<FolderNode[]> {
    const { data } = await apiClient.get<ApiResponse<FolderApiResponse[]>>("/folders", {
      params: {
        ...(scope.caseId ? { caseId: scope.caseId } : {}),
        ...(scope.arbitrationCaseId ? { arbitrationCaseId: scope.arbitrationCaseId } : {}),
      },
    });
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Klasörler alınamadı");
    }
    return data.data.map(mapFolderNode);
  },

  async createFolder(
    name: string,
    parentId: string | null,
    scope: DmsScope = {},
  ): Promise<FolderNode> {
    const { data } = await apiClient.post<ApiResponse<FolderApiResponse>>("/folders", {
      name,
      parentId: parentId ?? undefined,
      caseId: scope.caseId,
      arbitrationCaseId: scope.arbitrationCaseId,
    });
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Klasör oluşturulamadı");
    }
    return mapFolderNode(data.data);
  },

  async renameFolder(id: string, name: string): Promise<FolderNode> {
    const { data } = await apiClient.put<ApiResponse<FolderApiResponse>>(`/folders/${id}`, { name });
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Klasör güncellenemedi");
    }
    return mapFolderNode(data.data);
  },

  async moveFolderOrDocument(
    id: string,
    targetParentId: string | null,
    type: MoveItemType,
  ): Promise<void> {
    try {
      if (type === "FOLDER") {
        const { data } = await apiClient.put<ApiResponse<FolderApiResponse>>(`/folders/${id}/move`, {
          targetParentId,
        });
        if (!data.success) {
          throw new Error(
            isCycleError(data.message) ? CYCLE_ERROR_MESSAGE : (data.message ?? "Klasör taşınamadı"),
          );
        }
        return;
      }

      const { data } = await apiClient.put<ApiResponse<DocumentApiResponse>>(`/documents/${id}/move`, {
        folderId: targetParentId,
      });
      if (!data.success) {
        throw new Error(data.message ?? "Belge taşınamadı");
      }
    } catch (error) {
      if (error instanceof Error && isCycleError(error.message)) {
        throw new Error(CYCLE_ERROR_MESSAGE);
      }
      throw error;
    }
  },

  async deleteFolder(id: string): Promise<void> {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/folders/${id}`);
    if (!data.success) {
      throw new Error(data.message ?? "Klasör silinemedi");
    }
  },
};

export type { DocumentNode, FolderNode, MoveItemType };
