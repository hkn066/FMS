import apiClient from "@/lib/api-client";
import { mapClient } from "@/lib/mappers";
import type { ApiResponse, ClientApiResponse, CreateClientRequest, PageResponse } from "@/types/api";
import type { Client } from "@/types";

export const clientService = {
  async getAll(page = 0, size = 20): Promise<{ clients: Client[]; total: number }> {
    const { data } = await apiClient.get<ApiResponse<PageResponse<ClientApiResponse>>>("/clients", {
      params: { page, size },
    });
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Müvekkiller alınamadı");
    }
    return {
      clients: data.data.content.map(mapClient),
      total: data.data.totalElements,
    };
  },

  async create(payload: CreateClientRequest): Promise<Client> {
    const { data } = await apiClient.post<ApiResponse<ClientApiResponse>>("/clients", payload);
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Müvekkil oluşturulamadı");
    }
    return mapClient(data.data);
  },
};
