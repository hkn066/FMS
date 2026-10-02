"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ArbitrationTable } from "@/components/arbitration/arbitration-table";
import { ArbitrationStatusBadge } from "@/components/arbitration/arbitration-badges";
import { CreateArbitrationDialog } from "@/components/arbitration/create-arbitration-dialog";
import { DmsExplorer } from "@/components/documents/dms-explorer";
import { ErrorState, TableLoader } from "@/components/shared/page-loader";
import { Button } from "@/components/ui/button";
import { ALL_FOLDERS_ID, useArbitrationCases, useFolders } from "@/hooks/use-api";
import {
  ARBITRATION_STATUS_FOLDER_IDS,
  findFolderByArbitrationStatus,
  getArbitrationStatusFromFolder,
} from "@/lib/folder-tree-utils";
import type { ArbitrationStatus } from "@/types/arbitration";
import type { FolderNode } from "@/types/document";

function ArbitrationListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") as ArbitrationStatus | null;

  const { data, isLoading, error, refetch } = useArbitrationCases();
  const { data: folderData } = useFolders();

  const initialFolderId = useMemo(() => {
    if (!statusParam) return ALL_FOLDERS_ID;
    if (folderData) {
      const match = findFolderByArbitrationStatus(folderData, statusParam);
      if (match) return match.id;
    }
    return ARBITRATION_STATUS_FOLDER_IDS[statusParam] ?? ALL_FOLDERS_ID;
  }, [statusParam, folderData]);

  const handleFolderSelect = (_folderId: string, folder: FolderNode | null) => {
    if (!folder) {
      router.push("/arbitration");
      return;
    }
    if (folder.arbitrationCaseId) {
      router.push(`/arbitration/${folder.arbitrationCaseId}`);
      return;
    }
    const status = getArbitrationStatusFromFolder(folder);
    if (status) {
      router.push(`/arbitration?status=${status}`);
      return;
    }
    router.push("/arbitration");
  };

  const filteredCases = useMemo(() => {
    if (!data?.cases) return [];
    if (!statusParam) return data.cases;
    return data.cases.filter((item) => item.status === statusParam);
  }, [data?.cases, statusParam]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-slate-900">Sigorta Tahkim</h2>
          <p className="mt-1 text-sm text-slate-500">
            Tahkim dosyalarınızı ve evraklarınızı yönetin
            {data?.total !== undefined && ` · ${data.total} kayıt`}
          </p>
        </div>
        <CreateArbitrationDialog />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <DmsExplorer
            mode="manage"
            forceArbitrationTree
            showDocumentPanel={false}
            showUpload={false}
            initialFolderId={initialFolderId}
            onFolderSelect={handleFolderSelect}
          />
        </div>

        <div className="space-y-4 lg:col-span-9">
          {statusParam && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Durum Filtresi:</span>
                <ArbitrationStatusBadge status={statusParam} />
                <span className="text-xs text-slate-400">
                  ({filteredCases.length} dosya gösteriliyor)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/arbitration")}
                className="h-7 text-xs text-slate-600 hover:text-slate-900"
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Filtreyi Temizle
              </Button>
            </div>
          )}

          {isLoading && <TableLoader />}
          {error && (
            <ErrorState message="Tahkim dosyaları yüklenemedi" onRetry={() => refetch()} />
          )}
          {data && <ArbitrationTable cases={filteredCases} />}
        </div>
      </div>
    </div>
  );
}

export default function ArbitrationListPage() {
  return (
    <AppShell title="Tahkim Dosyaları">
      <Suspense fallback={<TableLoader />}>
        <ArbitrationListContent />
      </Suspense>
    </AppShell>
  );
}
