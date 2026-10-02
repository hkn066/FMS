"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Folder, FolderPlus, Upload } from "lucide-react";
import { FolderTree } from "@/components/documents/folder-tree";
import { DocumentList } from "@/components/documents/document-list";
import { DropZone, UploadArea } from "@/components/documents/drop-zone";
import { ErrorState, TableLoader } from "@/components/shared/page-loader";
import {
  ALL_FOLDERS_ID,
  useCreateFolder,
  useDeleteFolder,
  useDocuments,
  useFolders,
  useMoveFolderOrDocument,
  useRenameFolder,
  type DmsScope,
} from "@/hooks/use-api";
import { documentService } from "@/services/document.service";
import {
  findFolderNode,
  folderHasContent,
  isInvalidFolderMove,
  getBrowseFolderTree,
  getArbitrationFolderTree,
  getCaseFolderTree,
  getGeneralFolderTree,
  findArbitrationRoot,
  findGeneralRoot,
  DMS_SYSTEM_ROOTS,
} from "@/lib/folder-tree-utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FolderNode, MoveItemType } from "@/types/document";
import { MOVE_ITEM_TYPE } from "@/types/document";

const CYCLE_ERROR_MESSAGE = "Hata: Bir klasör kendi alt klasörünün içine taşınamaz!";

export type DmsExplorerMode = "browse" | "manage";

interface DmsExplorerProps {
  caseId?: string;
  arbitrationCaseId?: string;
  dmsRootFolderId?: string | null;
  mode?: DmsExplorerMode;
  allFoldersLabel?: string;
  initialFolderId?: string;
  showUpload?: boolean;
  showFolderTree?: boolean;
  showDocumentPanel?: boolean;
  forceArbitrationTree?: boolean;
  forceGeneralTree?: boolean;
  onFolderSelect?: (folderId: string, folder: FolderNode | null) => void;
  className?: string;
}

export function DmsExplorer({
  caseId,
  arbitrationCaseId,
  dmsRootFolderId,
  mode = "browse",
  allFoldersLabel = "Tüm Belgeler",
  initialFolderId,
  showUpload = true,
  showFolderTree = true,
  showDocumentPanel = true,
  forceArbitrationTree = false,
  forceGeneralTree = false,
  onFolderSelect,
  className,
}: DmsExplorerProps) {
  const manageFolders = mode === "manage";
  const scope = useMemo<DmsScope>(
    () => ({ caseId, arbitrationCaseId }),
    [caseId, arbitrationCaseId],
  );
  const isScoped = Boolean(caseId || arbitrationCaseId);
  const isArbitrationScope = Boolean(arbitrationCaseId);
  const isArbitrationTree = isArbitrationScope || forceArbitrationTree;

  const [selectedFolder, setSelectedFolder] = useState(ALL_FOLDERS_ID);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [parentFolderId, setParentFolderId] = useState<string | undefined>();
  const [editingFolder, setEditingFolder] = useState<FolderNode | null>(null);
  const [folderName, setFolderName] = useState("");
  const [deleteHasContent, setDeleteHasContent] = useState(false);

  const queryClient = useQueryClient();

  const { data: folderData, isLoading: foldersLoading, error: foldersError, refetch: refetchFolders } =
    useFolders();
  const arbitrationRoot = useMemo(
    () => (folderData ? findArbitrationRoot(folderData) : null),
    [folderData],
  );
  const generalRoot = useMemo(
    () => (folderData ? findGeneralRoot(folderData) : null),
    [folderData],
  );
  const displayFolders = useMemo(() => {
    if (!folderData) return [];
    if (arbitrationCaseId || forceArbitrationTree) return getArbitrationFolderTree(folderData);
    if (forceGeneralTree) return getGeneralFolderTree(folderData);
    if (caseId) return getCaseFolderTree(folderData);
    return getBrowseFolderTree(folderData);
  }, [folderData, arbitrationCaseId, caseId, forceArbitrationTree, forceGeneralTree]);

  const rootFolderLabel = isArbitrationTree
      ? DMS_SYSTEM_ROOTS.ARBITRATION
      : forceGeneralTree
        ? allFoldersLabel
        : caseId
          ? DMS_SYSTEM_ROOTS.GENERAL
          : allFoldersLabel;

  const showAllFoldersButton =
    showFolderTree &&
    !(!isArbitrationScope && !caseId && !forceArbitrationTree && !forceGeneralTree && displayFolders.length > 0) &&
    !forceGeneralTree;

  useEffect(() => {
    if (dmsRootFolderId) {
      setSelectedFolder(dmsRootFolderId);
    } else if (initialFolderId) {
      setSelectedFolder(initialFolderId);
    } else {
      setSelectedFolder(ALL_FOLDERS_ID);
    }
  }, [dmsRootFolderId, initialFolderId]);

  const { data, isLoading, error, refetch } = useDocuments(
    selectedFolder,
    isScoped ? scope : undefined,
    { enabled: showDocumentPanel },
  );

  const createFolderMutation = useCreateFolder();
  const renameFolderMutation = useRenameFolder();
  const deleteFolderMutation = useDeleteFolder();
  const moveMutation = useMoveFolderOrDocument();

  const documents = data?.documents ?? [];
  const documentTotal = data?.total ?? 0;

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) =>
      Promise.all(
        files.map((file) =>
          documentService.upload(
            file,
            isScoped ? scope : {},
            selectedFolder !== ALL_FOLDERS_ID ? selectedFolder : undefined,
          ),
        ),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setUploadVisible(false);
      setUploadError(null);
      toast.success("Belgeler yüklendi");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Yükleme başarısız";
      setUploadError(message);
      toast.error(message);
    },
  });

  const handleUpload = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      uploadMutation.mutate(files);
    },
    [uploadMutation],
  );

  const openCreateDialog = useCallback(
    (parentId?: string) => {
      const effectiveParent =
        parentId ??
        (selectedFolder !== ALL_FOLDERS_ID ? selectedFolder : undefined) ??
        (isArbitrationTree
          ? arbitrationRoot?.id
          : forceGeneralTree
            ? generalRoot?.id
            : undefined);
      setParentFolderId(effectiveParent);
      setFolderName("");
      setCreateDialogOpen(true);
    },
    [isArbitrationTree, arbitrationRoot?.id, forceGeneralTree, generalRoot?.id, selectedFolder],
  );

  const openRenameDialog = useCallback((folder: FolderNode) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setRenameDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((folder: FolderNode) => {
    setEditingFolder(folder);
    setDeleteHasContent(folderHasContent(folder));
    setDeleteAlertOpen(true);
  }, []);

  useEffect(() => {
    if (!createDialogOpen && !renameDialogOpen && !deleteAlertOpen) {
      document.body.style.pointerEvents = "";
    }
  }, [createDialogOpen, renameDialogOpen, deleteAlertOpen]);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    const parentId =
      parentFolderId ??
      (isArbitrationTree
        ? arbitrationRoot?.id
        : forceGeneralTree
          ? generalRoot?.id
          : undefined);
    try {
      const created = await createFolderMutation.mutateAsync({
        name: folderName.trim(),
        parentId,
        ...scope,
      });
      setCreateDialogOpen(false);
      setFolderName("");
      if (created?.id) {
        handleFolderSelect(created.id);
      }
      toast.success("Klasör oluşturuldu");
    } catch {
      // Hata toast'ı useCreateFolder onError tarafından gösterilir
    }
  };

  const handleRenameFolder = async () => {
    if (!editingFolder || !folderName.trim()) return;
    try {
      await renameFolderMutation.mutateAsync({
        id: editingFolder.id,
        name: folderName.trim(),
        ...scope,
      });
      setRenameDialogOpen(false);
      setEditingFolder(null);
      toast.success("Klasör adı güncellendi");
    } catch {
      // Hata toast'ı useRenameFolder onError tarafından gösterilir
    }
  };

  const handleDeleteFolder = async () => {
    if (!editingFolder) return;
    if (folderHasContent(editingFolder)) {
      toast.error("Dolu klasör silinemez. Lütfen önce içindeki belgeleri ve alt klasörleri boşaltın.");
      return;
    }
    try {
      await deleteFolderMutation.mutateAsync({ id: editingFolder.id, ...scope });
      if (selectedFolder === editingFolder.id) {
        setSelectedFolder(ALL_FOLDERS_ID);
      }
      setDeleteAlertOpen(false);
      setEditingFolder(null);
      toast.success("Klasör silindi");
    } catch {
      // Hata toast'ı useDeleteFolder onError tarafından gösterilir
    }
  };

  const handleMoveItem = useCallback(
    async (id: string, targetParentId: string | null, type: MoveItemType) => {
      if (type === MOVE_ITEM_TYPE.FOLDER && folderData && targetParentId) {
        if (isInvalidFolderMove(displayFolders, id, targetParentId)) {
          toast.error(CYCLE_ERROR_MESSAGE);
          return;
        }
      }

      try {
        await moveMutation.mutateAsync({ id, targetParentId, type, ...scope });
        toast.success(type === MOVE_ITEM_TYPE.FOLDER ? "Klasör taşındı" : "Belge taşındı");
      } catch {
        // Hata toast'ı useMoveFolderOrDocument onError tarafından gösterilir
      }
    },
    [scope, folderData, displayFolders, moveMutation],
  );

  const isInvalidDropTarget = useCallback(
    (draggedFolderId: string, targetFolderId: string) => {
      if (!displayFolders.length) return false;
      return isInvalidFolderMove(displayFolders, draggedFolderId, targetFolderId);
    },
    [displayFolders],
  );

  const handleInvalidFolderDrop = useCallback(() => {
    toast.error(CYCLE_ERROR_MESSAGE);
  }, []);

  const handleFolderSelect = useCallback(
    (folderId: string) => {
      setSelectedFolder(folderId);
      if (onFolderSelect) {
        const folder = findFolderNode(displayFolders, folderId);
        onFolderSelect(folderId, folder);
      }
    },
    [displayFolders, onFolderSelect],
  );

  const allFoldersEntry = {
    id: ALL_FOLDERS_ID,
    name: rootFolderLabel,
    documentCount: documentTotal,
  };

  const showUploadControls = showUpload && showDocumentPanel;

  return (
    <DropZone onFilesDrop={showUploadControls ? handleUpload : undefined}>
      <div className={cn("space-y-6", className)}>
        {showUploadControls && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {manageFolders && (
              <Button variant="outline" size="sm" onClick={() => openCreateDialog()}>
                <FolderPlus className="h-4 w-4" />
                Klasör Oluştur
              </Button>
            )}
            <Button variant="accent" size="sm" onClick={() => setUploadVisible(!uploadVisible)}>
              <Upload className="h-4 w-4" />
              Belge Yükle
            </Button>
          </div>
        )}

        {uploadError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {uploadError}
          </div>
        )}

        {showUploadControls && uploadVisible && <UploadArea onFilesDrop={handleUpload} />}

        {uploadMutation.isPending && (
          <p className="text-sm text-muted-foreground">Belgeler yükleniyor...</p>
        )}

        <div
          className={cn(
            "grid gap-6",
            showFolderTree && showDocumentPanel && "lg:grid-cols-12",
          )}
        >
          {showFolderTree && (
            <Card
              className={cn(
                "overflow-hidden rounded-2xl border-slate-100 bg-white shadow-sm",
                showDocumentPanel ? "lg:col-span-3" : "lg:col-span-12",
              )}
            >
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">Klasörler</p>
              </div>
              <div className="h-[500px]">
                {showAllFoldersButton && (
                  <button
                    type="button"
                    onClick={() => handleFolderSelect(ALL_FOLDERS_ID)}
                    className={cn(
                      "mx-2 mt-2 flex w-[calc(100%-1rem)] items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                      selectedFolder === ALL_FOLDERS_ID
                        ? "bg-accent/10 font-medium text-accent"
                        : "text-muted-foreground hover:bg-hover hover:text-foreground",
                    )}
                  >
                    <Folder className="h-4 w-4 shrink-0" />
                    <span className="truncate">{allFoldersEntry.name}</span>
                    {showDocumentPanel && (
                      <span className="ml-auto text-xs opacity-60">{allFoldersEntry.documentCount}</span>
                    )}
                  </button>
                )}

                {foldersLoading && !folderData && (
                  <p className="p-4 text-sm text-muted-foreground">Klasörler yükleniyor...</p>
                )}
                {foldersError && (
                  <ErrorState message="Klasörler yüklenemedi" onRetry={() => refetchFolders()} />
                )}
                {displayFolders.length > 0 && (
                  <FolderTree
                    folders={displayFolders}
                    selectedId={selectedFolder}
                    onSelect={handleFolderSelect}
                    onCreateFolder={manageFolders ? openCreateDialog : undefined}
                    onRenameFolder={manageFolders ? openRenameDialog : undefined}
                    onDeleteFolder={manageFolders ? openDeleteDialog : undefined}
                    onMoveItem={handleMoveItem}
                    isInvalidDropTarget={isInvalidDropTarget}
                    onInvalidFolderDrop={handleInvalidFolderDrop}
                    manageFolders={manageFolders}
                    allowFolderDrag={manageFolders}
                    showRootDropZone={
                      manageFolders &&
                      (forceGeneralTree || (!isArbitrationScope && !forceArbitrationTree))
                    }
                    rootDropParentId={
                      forceGeneralTree
                        ? generalRoot?.id
                        : isArbitrationScope || forceArbitrationTree
                          ? arbitrationRoot?.id
                          : undefined
                    }
                    rootDropLabel="Kök dizine taşımak için buraya bırakın"
                  />
                )}
              </div>
            </Card>
          )}

          {showDocumentPanel && (
            <div className={showFolderTree ? "lg:col-span-9" : "lg:col-span-12"}>
              {isLoading && <TableLoader />}
              {error && <ErrorState message="Belgeler yüklenemedi" onRetry={() => refetch()} />}
              {data && <DocumentList documents={documents} />}
            </div>
          )}
        </div>
      </div>

      {manageFolders && (
        <>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent className="rounded-2xl border-slate-100 bg-white shadow-sm">
              <DialogHeader>
                <DialogTitle>Yeni Klasör</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="folder-name">Klasör adı</Label>
                <Input
                  id="folder-name"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Klasör adını girin"
                  onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  İptal
                </Button>
                <Button
                  variant="accent"
                  onClick={handleCreateFolder}
                  disabled={createFolderMutation.isPending || !folderName.trim()}
                >
                  Oluştur
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
            <DialogContent className="rounded-2xl border-slate-100 bg-white shadow-sm">
              <DialogHeader>
                <DialogTitle>Klasör Adını Değiştir</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="rename-folder">Yeni ad</Label>
                <Input
                  id="rename-folder"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRenameFolder()}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
                  İptal
                </Button>
                <Button
                  variant="accent"
                  onClick={handleRenameFolder}
                  disabled={renameFolderMutation.isPending || !folderName.trim()}
                >
                  Kaydet
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
            <AlertDialogContent className="rounded-2xl border-slate-100 bg-white shadow-sm">
              <AlertDialogHeader>
                <AlertDialogTitle className={cn(deleteHasContent && "flex items-center gap-2 text-amber-600")}>
                  {deleteHasContent ? (
                    <>
                      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
                      Klasör Silinemez (Dolu Klasör)
                    </>
                  ) : (
                    "Klasörü Sil"
                  )}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-600">
                  {deleteHasContent ? (
                    <>
                      <strong>{editingFolder?.name}</strong> klasörünün içinde belgeler veya alt klasörler
                      bulunmaktadır. Dolu klasörler silinemez. Lütfen önce içindeki tüm alt klasörleri veya
                      belgeleri taşıyın ya da silin.
                    </>
                  ) : (
                    <>
                      <strong>{editingFolder?.name}</strong> klasörünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                    </>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                {deleteHasContent ? (
                  <AlertDialogCancel className="bg-slate-100 text-slate-800 hover:bg-slate-200">
                    Anladım
                  </AlertDialogCancel>
                ) : (
                  <>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <Button
                      variant="destructive"
                      onClick={() => void handleDeleteFolder()}
                      disabled={deleteFolderMutation.isPending}
                    >
                      Sil
                    </Button>
                  </>
                )}
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </DropZone>
  );
}
