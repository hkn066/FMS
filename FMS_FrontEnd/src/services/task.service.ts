import apiClient from "@/lib/api-client";
import { mapTask } from "@/lib/mappers";
import type { ApiResponse, PageResponse, TaskApiResponse } from "@/types/api";
import type { Task } from "@/types";

export const taskService = {
  async getAll(page = 0, size = 20): Promise<Task[]> {
    const { data } = await apiClient.get<ApiResponse<PageResponse<TaskApiResponse>>>("/tasks", {
      params: { page, size },
    });
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Görevler alınamadı");
    }
    return data.data.content.map(mapTask);
  },
};
