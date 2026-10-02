import apiClient from "@/lib/api-client";
import { mapHearing } from "@/lib/mappers";
import type {
  ApiResponse,
  DashboardApiResponse,
  HearingApiResponse,
  LawyerPerformanceApiResponse,
} from "@/types/api";
import type { DashboardStats, Hearing, LawyerPerformance } from "@/types";

export const reportService = {
  async getDashboard(): Promise<DashboardStats> {
    const { data } = await apiClient.get<ApiResponse<DashboardApiResponse>>("/reports/dashboard");
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Dashboard verileri alınamadı");
    }
    const d = data.data;
    return {
      activeCases: d.activeCases,
      activeCasesChange: 0,
      pendingTasks: d.pendingTasks,
      pendingTasksChange: 0,
      upcomingHearings: d.upcomingHearings,
      upcomingHearingsChange: 0,
      monthlyRevenue: 0,
      monthlyRevenueChange: 0,
      totalClients: d.totalClients,
      totalDocuments: d.totalDocuments,
    };
  },

  async getLawyerPerformance(): Promise<LawyerPerformance[]> {
    const { data } = await apiClient.get<ApiResponse<LawyerPerformanceApiResponse[]>>(
      "/reports/lawyer-performance",
    );
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Avukat performans verileri alınamadı");
    }
    return data.data.map((item) => ({
      name: item.name,
      cases: item.cases,
      winRate: item.winRate,
      tasksCompleted: item.tasksCompleted,
    }));
  },
};

export const hearingService = {
  async getUpcoming(days = 30): Promise<Hearing[]> {
    const { data } = await apiClient.get<ApiResponse<HearingApiResponse[]>>("/hearings", {
      params: { days },
    });
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Duruşmalar alınamadı");
    }
    return data.data.map(mapHearing);
  },
};
