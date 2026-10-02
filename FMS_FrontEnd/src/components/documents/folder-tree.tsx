"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FolderPlus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FolderNode, MoveItemType } from "@/types/document";
import { MOVE_ITEM_TYPE } from "@/types/document";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const FOLDER_DRAG_TYPE = "application/x-fms-folder";
export const DOCUMENT_DRAG_TYPE = "application/x-fms-document";

const DEPTH_PADDING_PX = 16;
const SUB_ITEM_INDENT_PX = 8;

interface FolderTreeProps {
  folders: FolderNode[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  onCreateFolder?: (parentId?: string) => void;
  onRenameFolder?: (folder: FolderNode) => void;
  onDeleteFolder?: (folder: FolderNode) => void;
  onMoveItem?: (id: string, targetParentId: string | null, type: MoveItemType) => void;
  isInvalidDropTarget?: (draggedFolderId: string, targetFolderId: string) => boolean;
  onInvalidFolderDrop?: () => void;
  manageFolders?: boolean;
  allowFolderDrag?: boolean;
  showRootDropZone?: boolean;
  rootDropParentId?: string;
  rootDropLabel?: string;
}

function FolderItem({
  folder,
  depth = 0,
  selectedId,
  draggedFolderIdRef,
  onSelect,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveItem,
  isInvalidDropTarget,
  onInvalidFolderDrop,
  manageFolders = true,
  allowFolderDrag = true,
}: {
  folder: FolderNode;
  depth?: number;
  selectedId?: string;
  draggedFolderIdRef: MutableRefObject<string | null>;
  onSelect?: (id: string) => void;
  onCreateFolder?: (parentId?: string) => void;
  onRenameFolder?: (folder: FolderNode) => void;
  onDeleteFolder?: (folder: FolderNode) => void;
  onMoveItem?: (id: string, targetParentId: string | null, type: MoveItemType) => void;
  isInvalidDropTarget?: (draggedFolderId: string, targetFolderId: string) => boolean;
  onInvalidFolderDrop?: () => void;
  manageFolders?: boolean;
  allowFolderDrag?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(depth === 0);
  const isDragOverRef = useRef(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const textRef = useRef<HTMLSpanElement>(null);

  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = selectedId === folder.id;

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const check = () => {
      const parentWidth = el.parentElement?.clientWidth ?? el.clientWidth;
      const isOver = el.scrollWidth > parentWidth + 2 || folder.name.length > 25;
      setIsOverflowing(isOver);
    };

    check();

    const parent = el.parentElement;
    if (!parent) return;

    const observer = new ResizeObserver(check);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [folder.name]);

  useEffect(() => {
    if (selectedId && folder.children?.some((child) => child.id === selectedId)) {
      setIsOpen(true);
    }
  }, [selectedId, folder.children]);

  const resolveDraggedFolderId = () => draggedFolderIdRef.current;

  const isFolderDropBlocked = (draggedFolderId: string) =>
    isInvalidDropTarget?.(draggedFolderId, folder.id) ?? false;

  const handleDragStart = (e: React.DragEvent) => {
    if (folder.isSystem || !allowFolderDrag) return;
    e.stopPropagation();
    draggedFolderIdRef.current = folder.id;
    e.dataTransfer.setData(FOLDER_DRAG_TYPE, folder.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    draggedFolderIdRef.current = null;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isFolderDrag = e.dataTransfer.types.includes(FOLDER_DRAG_TYPE);
    const isDocumentDrag = e.dataTransfer.types.includes(DOCUMENT_DRAG_TYPE);
    if (!isFolderDrag && !isDocumentDrag) return;

    if (isFolderDrag && allowFolderDrag) {
      const draggedFolderId = resolveDraggedFolderId();
      if (draggedFolderId && isFolderDropBlocked(draggedFolderId)) {
        e.dataTransfer.dropEffect = "none";
        return;
      }
      if (!isOpen) setIsOpen(true);
    }

    e.dataTransfer.dropEffect = "move";
    if (!isDragOverRef.current) {
      isDragOverRef.current = true;
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    isDragOverRef.current = false;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragOverRef.current = false;
    setIsDragOver(false);
    draggedFolderIdRef.current = null;

    const draggedFolderId = e.dataTransfer.getData(FOLDER_DRAG_TYPE);
    const draggedDocumentId = e.dataTransfer.getData(DOCUMENT_DRAG_TYPE);

    if (draggedFolderId && draggedFolderId !== folder.id) {
      if (!allowFolderDrag) return;
      if (isFolderDropBlocked(draggedFolderId)) {
        onInvalidFolderDrop?.();
        return;
      }
      onMoveItem?.(draggedFolderId, folder.id, MOVE_ITEM_TYPE.FOLDER);
    } else if (draggedDocumentId) {
      onMoveItem?.(draggedDocumentId, folder.id, MOVE_ITEM_TYPE.DOCUMENT);
    }
  };

  const handleRowClick = () => {
    onSelect?.(folder.id);
    if (hasChildren) setIsOpen(!isOpen);
  };

  return (
    <div>
      <div
        draggable={!folder.isSystem && allowFolderDrag}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "group flex w-full max-w-full items-center rounded-xl border border-transparent transition-colors",
          isDragOver && "border-primary border-dashed bg-slate-50/50",
          !folder.isSystem && allowFolderDrag && "cursor-grab active:cursor-grabbing",
        )}
        style={{ paddingLeft: `${depth * DEPTH_PADDING_PX + SUB_ITEM_INDENT_PX}px` }}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={handleRowClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleRowClick();
            }
          }}
          onContextMenu={(e) => {
            if (manageFolders) {
              e.preventDefault();
              setMenuOpen(true);
            }
          }}
          title={folder.name}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors cursor-pointer select-none overflow-hidden",
            isSelected
              ? "bg-accent/10 font-medium text-accent is-active"
              : "text-muted-foreground hover:bg-hover hover:text-foreground",
            isOverflowing && "animate-marquee-hover animate-marquee-active",
          )}
        >
          {hasChildren ? (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="p-0.5 rounded hover:bg-slate-200/50 shrink-0"
            >
              {isOpen ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              )}
            </span>
          ) : (
            <span className="w-3.5 shrink-0" />
          )}

          {manageFolders && (
            <div
              onClick={(e) => e.stopPropagation()}
              onDragStart={(e) => e.stopPropagation()}
              className="shrink-0"
            >
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-5 w-5 rounded p-0 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-opacity",
                      menuOpen || isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                    )}
                    title="Klasör İşlemleri"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 rounded-2xl border-slate-100 shadow-sm z-50">
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setTimeout(() => {
                        document.body.style.pointerEvents = "";
                        onCreateFolder?.(folder.id);
                      }, 0);
                    }}
                  >
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Yeni Klasör Oluştur
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={folder.isSystem}
                    onSelect={(e) => {
                      e.preventDefault();
                      setTimeout(() => {
                        document.body.style.pointerEvents = "";
                        onRenameFolder?.(folder);
                      }, 0);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Adını Değiştir
                  </DropdownMenuItem>
                  {!folder.isSystem && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={(e) => {
                          e.preventDefault();
                          setTimeout(() => {
                            document.body.style.pointerEvents = "";
                            onDeleteFolder?.(folder);
                          }, 0);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Sil
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {isOpen && hasChildren ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-accent" />
          ) : (
            <Folder className="h-4 w-4 shrink-0" />
          )}

          <span className="min-w-0 flex-1 overflow-hidden text-left">
            <span
              ref={textRef}
              className="marquee-content block truncate max-w-full"
            >
              {folder.name}
            </span>
          </span>

          {(folder.documentCount ?? 0) > 0 && (
            <span className="shrink-0 text-xs opacity-60">
              ({folder.documentCount})
            </span>
          )}
        </div>
      </div>

      {hasChildren && isOpen && (
        <div>
          {folder.children!.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              depth={depth + 1}
              selectedId={selectedId}
              draggedFolderIdRef={draggedFolderIdRef}
              onSelect={onSelect}
              onCreateFolder={onCreateFolder}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
              onMoveItem={onMoveItem}
              isInvalidDropTarget={isInvalidDropTarget}
              onInvalidFolderDrop={onInvalidFolderDrop}
              manageFolders={manageFolders}
              allowFolderDrag={allowFolderDrag}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RootDropZone({
  draggedFolderIdRef,
  onMoveItem,
  rootDropParentId,
  rootDropLabel,
}: {
  draggedFolderIdRef: MutableRefObject<string | null>;
  onMoveItem?: (id: string, targetParentId: string | null, type: MoveItemType) => void;
  rootDropParentId?: string;
  rootDropLabel?: string;
}) {
  const isDragOverRef = useRef(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes(FOLDER_DRAG_TYPE)) return;
    e.preventDefault();
    e.stopPropagation();

    e.dataTransfer.dropEffect = "move";
    if (!isDragOverRef.current) {
      isDragOverRef.current = true;
      setIsDragOver(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragOverRef.current = false;
    setIsDragOver(false);

    const draggedFolderId = e.dataTransfer.getData(FOLDER_DRAG_TYPE);
    draggedFolderIdRef.current = null;
    if (!draggedFolderId) return;

    onMoveItem?.(draggedFolderId, rootDropParentId ?? null, MOVE_ITEM_TYPE.FOLDER);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={() => {
        isDragOverRef.current = false;
        setIsDragOver(false);
      }}
      onDrop={handleDrop}
      className={cn(
        "mx-2 mb-2 rounded-lg border border-dashed px-2 py-2 text-center text-xs text-muted-foreground transition-colors",
        isDragOver
          ? "border-primary bg-slate-50/50 text-foreground"
          : "border-slate-200 bg-slate-50/30",
      )}
    >
      {rootDropLabel ?? (rootDropParentId ? "Kök dizine taşımak için buraya bırakın" : "Kök dizine taşımak için buraya bırakın")}
    </div>
  );
}

export function FolderTree({
  folders,
  selectedId,
  onSelect,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveItem,
  isInvalidDropTarget,
  onInvalidFolderDrop,
  manageFolders = true,
  allowFolderDrag = true,
  showRootDropZone = false,
  rootDropParentId,
  rootDropLabel,
}: FolderTreeProps) {
  const draggedFolderIdRef = useRef<string | null>(null);

  return (
    <ScrollArea orientation="both" className="h-full w-full">
      <div className="space-y-0.5 p-2 min-w-full">
        {showRootDropZone && allowFolderDrag && (
          <RootDropZone
            draggedFolderIdRef={draggedFolderIdRef}
            onMoveItem={onMoveItem}
            rootDropParentId={rootDropParentId}
            rootDropLabel={rootDropLabel}
          />
        )}
        {folders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            selectedId={selectedId}
            draggedFolderIdRef={draggedFolderIdRef}
            onSelect={onSelect}
            onCreateFolder={onCreateFolder}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
            onMoveItem={onMoveItem}
            isInvalidDropTarget={isInvalidDropTarget}
            onInvalidFolderDrop={onInvalidFolderDrop}
            manageFolders={manageFolders}
            allowFolderDrag={allowFolderDrag}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
