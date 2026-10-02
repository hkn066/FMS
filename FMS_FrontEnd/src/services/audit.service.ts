import apiClient from "@/lib/api-client";
import { mapAuditToActivity } from "@/lib/mappers";
import type { Activity } from "@/types";
import type { ApiResponse, AuditLogApiResponse, PageResponse } from "@/types/api";

export const auditService = {
  async getRecent(limit = 5): Promise<Activity[]> {
    const { data } = await apiClient.get<ApiResponse<PageResponse<AuditLogApiResponse>>>("/audit", {
      params: { page: 0, size: limit, sort: "createdAt,desc" },
    });
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Aktivite verileri alınamadı");
    }
    return data.data.content.map(mapAuditToActivity);
  },
};
