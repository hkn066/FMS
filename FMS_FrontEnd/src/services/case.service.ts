import apiClient from "@/lib/api-client";
import { mapCase } from "@/lib/mappers";
import type { ApiResponse, CaseApiResponse, CreateCaseRequest, PageResponse } from "@/types/api";
import type { Case } from "@/types";

export const caseService = {
  async getAll(page = 0, size = 20): Promise<{ cases: Case[]; total: number }> {
    const { data } = await apiClient.get<ApiResponse<PageResponse<CaseApiResponse>>>("/cases", {
      params: { page, size },
    });
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Davalar alınamadı");
    }
    return {
      cases: data.data.content.map(mapCase),
      total: data.data.totalElements,
    };
  },

  async getById(id: string): Promise<Case> {
    const { data } = await apiClient.get<ApiResponse<CaseApiResponse>>(`/cases/${id}`);
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Dava bulunamadı");
    }
    return mapCase(data.data);
  },

  async create(payload: CreateCaseRequest): Promise<Case> {
    const { data } = await apiClient.post<ApiResponse<CaseApiResponse>>("/cases", payload);
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Dava oluşturulamadı");
    }
    return mapCase(data.data);
  },

  async getNextNumber(): Promise<string> {
    const { data } = await apiClient.get<ApiResponse<string>>("/cases/next-number");
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Dosya numarası alınamadı");
    }
    return data.data;
  },
};
