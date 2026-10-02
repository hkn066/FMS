import apiClient from "@/lib/api-client";
import type { ApiResponse, GlobalSearchResponse } from "@/types/api";

export const searchService = {
  async search(q: string): Promise<GlobalSearchResponse> {
    const { data } = await apiClient.get<ApiResponse<GlobalSearchResponse>>("/search", {
      params: { q },
    });
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Arama yapılamadı");
    }
    return data.data;
  },
};
