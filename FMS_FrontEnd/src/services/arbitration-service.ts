import apiClient from "@/lib/api-client";
import type { ApiResponse, PageResponse } from "@/types/api";
import type {
  ArbitrationCase,
  ArbitrationDocument,
  ArbitrationDocumentCategory,
  ArbitrationDocumentsResponse,
  CreateArbitrationCasePayload,
  UpdateArbitrationCasePayload,
} from "@/types/arbitration";

export const arbitrationService = {
  async getAll(page = 0, size = 20): Promise<{ cases: ArbitrationCase[]; total: number }> {
    const { data } = await apiClient.get<ApiResponse<PageResponse<ArbitrationCase>>>("/arbitration", {
      params: { page, size },
    });
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Tahkim dosyaları alınamadı");
    }
    return {
      cases: data.data.content,
      total: data.data.totalElements,
    };
  },

  async getById(id: string): Promise<ArbitrationCase> {
    const { data } = await apiClient.get<ApiResponse<ArbitrationCase>>(`/arbitration/${id}`);
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Tahkim dosyası bulunamadı");
    }
    return data.data;
  },

  async create(payload: CreateArbitrationCasePayload): Promise<ArbitrationCase> {
    const { data } = await apiClient.post<ApiResponse<ArbitrationCase>>("/arbitration", payload);
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Tahkim dosyası oluşturulamadı");
    }
    return data.data;
  },

  async update(id: string, payload: UpdateArbitrationCasePayload): Promise<ArbitrationCase> {
    const { data } = await apiClient.put<ApiResponse<ArbitrationCase>>(`/arbitration/${id}`, payload);
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Tahkim dosyası güncellenemedi");
    }
    return data.data;
  },

  async delete(id: string): Promise<void> {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/arbitration/${id}`);
    if (!data.success) {
      throw new Error(data.message ?? "Tahkim dosyası silinemedi");
    }
  },

  async getDocuments(id: string): Promise<ArbitrationDocumentsResponse> {
    const { data } = await apiClient.get<ApiResponse<ArbitrationDocumentsResponse>>(
      `/arbitration/${id}/documents`,
    );
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Tahkim belgeleri alınamadı");
    }
    return data.data;
  },

  async uploadDocument(
    id: string,
    file: File,
    category: ArbitrationDocumentCategory,
  ): Promise<ArbitrationDocument> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    const { data } = await apiClient.post<ApiResponse<ArbitrationDocument>>(
      `/arbitration/${id}/documents`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Belge yüklenemedi");
    }
    return data.data;
  },

  async deleteDocument(id: string, documentId: string): Promise<void> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
      `/arbitration/${id}/documents/${documentId}`,
    );
    if (!data.success) {
      throw new Error(data.message ?? "Belge silinemedi");
    }
  },
};
