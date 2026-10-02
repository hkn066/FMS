"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { auditService } from "@/services/audit.service";
import { arbitrationService } from "@/services/arbitration-service";
import { caseService } from "@/services/case.service";
import { clientService } from "@/services/client.service";
import { documentService, type DmsScope } from "@/services/document.service";
import { type CreateFolderPayload } from "@/services/folder.service";
import { hearingService, reportService } from "@/services/report.service";
import { taskService } from "@/services/task.service";
import {
  addFolderToTree,
  findFolderNode,
  moveFolderInTree,
  removeFolderFromTree,
  renameFolderInTree,
  replaceFolderInTree,
} from "@/lib/folder-tree-utils";
import type { FolderNode, MoveItemType } from "@/types/document";
import type { Document } from "@/types";

export const ALL_FOLDERS_ID = "__all__";

export type { DmsScope };

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  activities: (limit: number) => ["activities", limit] as const,
  lawyerPerformance: ["lawyer-performance"] as const,
  cases: ["cases"] as const,
  case: (id: string) => ["cases", id] as const,
  clients: ["clients"] as const,
  documents: (folderId?: string, scope?: DmsScope) => {
    if (folderId) return ["documents", "folder", folderId] as const;
    if (scope?.arbitrationCaseId) return ["documents", "arbitration", scope.arbitrationCaseId] as const;
    if (scope?.caseId) return ["documents", "case", scope.caseId] as const;
    return ["documents"] as const;
  },
  folders: (scope?: DmsScope) => {
    if (scope?.arbitrationCaseId) return ["folders", "arbitration", scope.arbitrationCaseId] as const;
    if (scope?.caseId) return ["folders", "case", scope.caseId] as const;
    return ["folders"] as const;
  },
  tasks: ["tasks"] as const,
  hearings: ["hearings"] as const,
  arbitration: ["arbitration"] as const,
  arbitrationCase: (id: string) => ["arbitration", id] as const,
  arbitrationDocuments: (id: string) => ["arbitration", id, "documents"] as const,
};

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => reportService.getDashboard(),
  });
}

export function useActivities(limit = 5) {
  return useQuery({
    queryKey: queryKeys.activities(limit),
    queryFn: () => auditService.getRecent(limit),
  });
}

export function useLawyerPerformance() {
  return useQuery({
    queryKey: queryKeys.lawyerPerformance,
    queryFn: () => reportService.getLawyerPerformance(),
  });
}

export function useCases() {
  return useQuery({
    queryKey: queryKeys.cases,
    queryFn: () => caseService.getAll(),
  });
}

export function useCase(id: string) {
  return useQuery({
    queryKey: queryKeys.case(id),
    queryFn: () => caseService.getById(id),
    enabled: !!id,
  });
}

export function useNextCaseNumber(enabled = true) {
  return useQuery({
    queryKey: ["cases", "next-number"],
    queryFn: () => caseService.getNextNumber(),
    enabled,
    staleTime: 0,
  });
}

export function useClients() {
  return useQuery({
    queryKey: queryKeys.clients,
    queryFn: () => clientService.getAll(),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof clientService.create>[0]) =>
      clientService.create(payload),
    onSuccess: (newClient) => {
      queryClient.setQueryData(
        queryKeys.clients,
        (old: { clients: typeof newClient[]; total: number } | undefined) => {
          if (!old) return { clients: [newClient], total: 1 };
          return {
            clients: [newClient, ...old.clients],
            total: old.total + 1,
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.clients });
    },
  });
}

export function useDocuments(
  folderId?: string,
  scope?: DmsScope,
  options?: { enabled?: boolean },
) {
  const effectiveFolderId =
    folderId && folderId !== ALL_FOLDERS_ID ? folderId : undefined;

  return useQuery({
    queryKey: queryKeys.documents(effectiveFolderId, scope),
    queryFn: () =>
      documentService.getAll(0, 100, {
        folderId: effectiveFolderId,
        caseId: !effectiveFolderId ? scope?.caseId : undefined,
        arbitrationCaseId: !effectiveFolderId ? scope?.arbitrationCaseId : undefined,
      }),
    enabled: options?.enabled ?? true,
  });
}

export function useFolders(scope?: DmsScope) {
  return useQuery({
    queryKey: queryKeys.folders(scope),
    queryFn: () => documentService.getFolderTree(scope),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

type FolderCacheEntry = {
  queryKey: ReturnType<typeof queryKeys.folders>;
  data: FolderNode[] | undefined;
};

function getFolderCacheEntry(
  queryClient: ReturnType<typeof useQueryClient>,
  scope?: DmsScope,
): FolderCacheEntry {
  const queryKey = queryKeys.folders(scope);
  return { queryKey, data: queryClient.getQueryData<FolderNode[]>(queryKey) };
}

function setFolderCacheData(
  queryClient: ReturnType<typeof useQueryClient>,
  scope: DmsScope | undefined,
  updater: (current: FolderNode[] | undefined) => FolderNode[] | undefined,
) {
  const queryKey = queryKeys.folders(scope);
  queryClient.setQueryData<FolderNode[]>(queryKey, updater);
}

function updateGlobalFolderCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (current: FolderNode[] | undefined) => FolderNode[] | undefined,
) {
  setFolderCacheData(queryClient, undefined, updater);
}

export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFolderPayload) =>
      documentService.createFolder(payload.name, payload.parentId ?? null, {
        caseId: payload.caseId,
        arbitrationCaseId: payload.arbitrationCaseId,
      }),
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Klasör oluşturulamadı");
    },
    onSuccess: (createdFolder, payload) => {
      const parentId = createdFolder.parentId ?? payload.parentId ?? null;
      updateGlobalFolderCache(queryClient, (data) => {
        if (!data) return data;
        if (findFolderNode(data, createdFolder.id)) {
          return replaceFolderInTree(data, createdFolder.id, createdFolder);
        }
        return addFolderToTree(data, createdFolder, parentId);
      });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useRenameFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string } & DmsScope) =>
      documentService.renameFolder(id, name),
    onMutate: async ({ id, name }) => {
      const cacheEntry = getFolderCacheEntry(queryClient, undefined);
      await queryClient.cancelQueries({ queryKey: cacheEntry.queryKey });

      if (cacheEntry.data) {
        updateGlobalFolderCache(queryClient, (data) =>
          data ? renameFolderInTree(data, id, name) : data,
        );
      }

      return { previous: cacheEntry };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.previous.queryKey, context.previous.data);
      }
      toast.error(err instanceof Error ? err.message : "Klasör güncellenemedi");
    },
    onSuccess: (renamedFolder) => {
      updateGlobalFolderCache(queryClient, (data) =>
        data ? replaceFolderInTree(data, renamedFolder.id, renamedFolder) : data,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useMoveFolderOrDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      targetParentId,
      type,
    }: {
      id: string;
      targetParentId: string | null;
      type: MoveItemType;
    } & DmsScope) => documentService.moveFolderOrDocument(id, targetParentId, type),
    onMutate: async ({ id, targetParentId, type }) => {
      if (type === "FOLDER") {
        const cacheEntry = getFolderCacheEntry(queryClient, undefined);
        await queryClient.cancelQueries({ queryKey: cacheEntry.queryKey });

        if (cacheEntry.data) {
          updateGlobalFolderCache(queryClient, (data) =>
            data ? moveFolderInTree(data, id, targetParentId) : data,
          );
        }

        return { previous: cacheEntry, type };
      }

      await queryClient.cancelQueries({ queryKey: ["documents"] });
      const previous = queryClient.getQueriesData<{ documents: Document[]; total: number }>({
        queryKey: ["documents"],
      });

      previous.forEach(([key, data]) => {
        if (data) {
          queryClient.setQueryData(key, {
            ...data,
            documents: data.documents.filter((doc) => doc.id !== id),
            total: Math.max(0, data.total - 1),
          });
        }
      });

      return { previous, type };
    },
    onError: (err, _vars, context) => {
      if (!context?.previous) return;
      if (context.type === "FOLDER") {
        const folderPrevious = context.previous as FolderCacheEntry;
        queryClient.setQueryData(folderPrevious.queryKey, folderPrevious.data);
      } else {
        (context.previous as Array<[readonly unknown[], unknown]>).forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error(err instanceof Error ? err.message : "Taşıma işlemi başarısız");
    },
    onSuccess: (_data, variables) => {
      if (variables.type === "DOCUMENT") {
        queryClient.invalidateQueries({ queryKey: ["documents"] });
      }
    },
    onSettled: (_data, _error, variables) => {
      if (variables.type === "FOLDER") {
        queryClient.invalidateQueries({ queryKey: ["folders"] });
      }
    },
  });
}

export function useMoveFolder() {
  const moveMutation = useMoveFolderOrDocument();
  return {
    ...moveMutation,
    mutate: (vars: { id: string; targetParentId?: string | null }) =>
      moveMutation.mutate({
        id: vars.id,
        targetParentId: vars.targetParentId ?? null,
        type: "FOLDER",
      }),
    mutateAsync: (vars: { id: string; targetParentId?: string | null }) =>
      moveMutation.mutateAsync({
        id: vars.id,
        targetParentId: vars.targetParentId ?? null,
        type: "FOLDER",
      }),
  };
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string } & DmsScope) => documentService.deleteFolder(id),
    onMutate: async ({ id }) => {
      const cacheEntry = getFolderCacheEntry(queryClient, undefined);
      await queryClient.cancelQueries({ queryKey: cacheEntry.queryKey });

      if (cacheEntry.data) {
        updateGlobalFolderCache(queryClient, (data) =>
          data ? removeFolderFromTree(data, id) : data,
        );
      }

      return { previous: cacheEntry };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.previous.queryKey, context.previous.data);
      }
      toast.error(err instanceof Error ? err.message : "Klasör silinemedi");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useMoveDocument() {
  const moveMutation = useMoveFolderOrDocument();
  return {
    ...moveMutation,
    mutate: (vars: { id: string; folderId?: string | null }) =>
      moveMutation.mutate({
        id: vars.id,
        targetParentId: vars.folderId ?? null,
        type: "DOCUMENT",
      }),
    mutateAsync: (vars: { id: string; folderId?: string | null }) =>
      moveMutation.mutateAsync({
        id: vars.id,
        targetParentId: vars.folderId ?? null,
        type: "DOCUMENT",
      }),
  };
}

export function useTasks() {
  return useQuery({
    queryKey: queryKeys.tasks,
    queryFn: () => taskService.getAll(),
  });
}

export function useHearings() {
  return useQuery({
    queryKey: queryKeys.hearings,
    queryFn: () => hearingService.getUpcoming(30),
  });
}

export function useArbitrationCases() {
  return useQuery({
    queryKey: queryKeys.arbitration,
    queryFn: () => arbitrationService.getAll(),
  });
}

export function useArbitrationCase(id: string) {
  return useQuery({
    queryKey: queryKeys.arbitrationCase(id),
    queryFn: () => arbitrationService.getById(id),
    enabled: !!id,
  });
}

export function useArbitrationDocuments(id: string) {
  return useQuery({
    queryKey: queryKeys.arbitrationDocuments(id),
    queryFn: () => arbitrationService.getDocuments(id),
    enabled: !!id,
  });
}
