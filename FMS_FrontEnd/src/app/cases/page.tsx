"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Folder, GripVertical, X } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { CasesTable } from "@/components/case/cases-table";
import { CreateCaseDialog } from "@/components/case/create-case-dialog";
import { DmsExplorer } from "@/components/documents/dms-explorer";
import { ErrorState, TableLoader } from "@/components/shared/page-loader";
import { Button } from "@/components/ui/button";
import { ALL_FOLDERS_ID, useCases, useFolders } from "@/hooks/use-api";
import { findFolderNode, findGeneralRoot } from "@/lib/folder-tree-utils";
import type { FolderNode } from "@/types/document";

function CasesListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderParam = searchParams.get("folder");

  const { data, isLoading, error, refetch } = useCases();
  const { data: folderData } = useFolders();

  const generalRoot = useMemo(() => {
    if (!folderData) return null;
    return findGeneralRoot(folderData);
  }, [folderData]);

  const selectedFolderNode = useMemo(() => {
    if (!folderParam || !folderData) return null;
    return findFolderNode(folderData, folderParam);
  }, [folderParam, folderData]);

  const isRootFolderSelected = useMemo(() => {
    if (!generalRoot || !folderParam) return false;
    return folderParam === generalRoot.id;
  }, [generalRoot, folderParam]);

  const [panelWidth, setPanelWidth] = useState<number>(310);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(310);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cases_folder_panel_width");
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 240 && parsed <= 600) {
          setPanelWidth(parsed);
        }
      }
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = panelWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const delta = moveEvent.clientX - startXRef.current;
      const newWidth = Math.min(Math.max(startWidthRef.current + delta, 240), 600);
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      setPanelWidth((latest) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("cases_folder_panel_width", latest.toString());
        }
        return latest;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [panelWidth]);

  const handleResetWidth = () => {
    setPanelWidth(310);
    if (typeof window !== "undefined") {
      localStorage.setItem("cases_folder_panel_width", "310");
    }
  };

  const handleFolderSelect = (_folderId: string, folder: FolderNode | null) => {
    if (!folder || _folderId === ALL_FOLDERS_ID) {
      router.push("/cases");
      return;
    }
    if (generalRoot && folder.id === generalRoot.id) {
      router.push("/cases");
      return;
    }
    if (folder.caseId) {
      router.push(`/cases/${folder.caseId}`);
      return;
    }
    router.push(`/cases?folder=${folder.id}`);
  };

  const filteredCases = useMemo(() => {
    if (!data?.cases) return [];
    if (!folderParam || !selectedFolderNode || isRootFolderSelected) return data.cases;

    if (selectedFolderNode.caseId) {
      return data.cases.filter((item) => item.id === selectedFolderNode.caseId);
    }

    const descendantCaseIds = new Set<string>();
    const collectCaseIds = (node: FolderNode) => {
      if (node.caseId) descendantCaseIds.add(node.caseId);
      node.children?.forEach(collectCaseIds);
    };
    collectCaseIds(selectedFolderNode);

    if (descendantCaseIds.size > 0) {
      return data.cases.filter((item) => descendantCaseIds.has(item.id));
    }

    const normalizedName = selectedFolderNode.name.toLowerCase();
    const categoryMatches = data.cases.filter((item) =>
      item.category?.toLowerCase().includes(normalizedName),
    );
    if (categoryMatches.length > 0) {
      return categoryMatches;
    }

    return data.cases;
  }, [data?.cases, folderParam, selectedFolderNode, isRootFolderSelected]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Dava Yönetimi</h2>
          <p className="mt-1 text-sm text-slate-500">
            Tüm dava dosyalarınızı buradan yönetin
            {data?.total !== undefined && ` · ${data.total} kayıt`}
          </p>
        </div>
        <CreateCaseDialog />
      </div>

      {/* Esnek ve Ayarlanabilir Genişlikli Klasör & Dava Alanı */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-0">
        {/* Sol Klasör Paneli */}
        <div
          style={{ width: `${panelWidth}px` }}
          className="w-full shrink-0 transition-[width] duration-75 lg:w-[var(--panel-width)]"
        >
          <DmsExplorer
            mode="manage"
            forceGeneralTree
            allFoldersLabel="Tüm Davalar"
            showDocumentPanel={false}
            showUpload={false}
            initialFolderId={folderParam ?? ALL_FOLDERS_ID}
            onFolderSelect={handleFolderSelect}
          />
        </div>

        {/* Masaüstü Dikey Genişlik Ayarlama Tutamacı (Splitter Handle) */}
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={handleResetWidth}
          title="Genişliği ayarlamak için sürükleyin, sıfırlamak için çift tıklayın"
          className="group relative hidden lg:flex h-[560px] w-4 shrink-0 cursor-col-resize items-center justify-center select-none"
        >
          <div className="h-full w-1 rounded-full bg-slate-200 transition-colors group-hover:bg-accent group-active:bg-accent" />
          <div className="absolute flex h-7 w-3.5 items-center justify-center rounded-sm bg-white border border-slate-200 shadow-xs transition-colors group-hover:border-accent group-hover:text-accent">
            <GripVertical className="h-3.5 w-3.5 text-slate-400 group-hover:text-accent" />
          </div>
        </div>

        {/* Sağ Dava Listesi Alanı */}
        <div className="min-w-0 flex-1 space-y-4 lg:pl-3">
          {folderParam && selectedFolderNode && !isRootFolderSelected && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Klasör Filtresi:</span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800">
                  <Folder className="h-3.5 w-3.5 text-accent" />
                  {selectedFolderNode.name}
                </span>
                <span className="text-xs text-slate-400">
                  ({filteredCases.length} dava gösteriliyor)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/cases")}
                className="h-7 text-xs text-slate-600 hover:text-slate-900"
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Filtreyi Temizle
              </Button>
            </div>
          )}

          {isLoading && <TableLoader />}
          {error && <ErrorState message="Davalar yüklenemedi" onRetry={() => refetch()} />}
          {data && <CasesTable cases={filteredCases} />}
        </div>
      </div>
    </div>
  );
}

export default function CasesPage() {
  return (
    <AppShell title="Dosyalar & Davalar">
      <Suspense fallback={<TableLoader />}>
        <CasesListContent />
      </Suspense>
    </AppShell>
  );
}
