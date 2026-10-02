"use client";

import { useState } from "react";
import {
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Grid3X3,
  List,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { Document } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/lib/utils";
import { DOCUMENT_DRAG_TYPE } from "@/components/documents/folder-tree";

const fileIcons: Record<Document["type"], React.ElementType> = {
  pdf: FileText,
  docx: File,
  xlsx: FileSpreadsheet,
  image: FileImage,
  other: File,
};

const ocrBadgeVariant: Record<Document["ocrStatus"], "success" | "warning" | "destructive" | "secondary"> = {
  completed: "success",
  processing: "warning",
  failed: "destructive",
  pending: "secondary",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface DocumentListProps {
  documents: Document[];
}

function DraggableDocumentRow({
  doc,
  children,
  className,
}: {
  doc: Document;
  children: React.ReactNode;
  className?: string;
}) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(DOCUMENT_DRAG_TYPE, doc.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div draggable onDragStart={handleDragStart} className={className}>
      {children}
    </div>
  );
}

export function DocumentList({ documents }: DocumentListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [search, setSearch] = useState("");

  const filtered = documents.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Belge ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="h-4 w-4" />
            Filtreler
          </Button>
          <div className="flex rounded-xl border border-border p-0.5">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === "list" ? (
        <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b border-border bg-muted/30 px-4 py-2.5 text-xs font-medium text-muted-foreground">
            <span>Belge Adı</span>
            <span className="hidden sm:block">Yükleyen</span>
            <span className="hidden md:block">Tarih</span>
            <span className="hidden lg:block">Boyut</span>
            <span>Durum</span>
          </div>
          {filtered.map((doc) => {
            const Icon = fileIcons[doc.type];
            return (
              <DraggableDocumentRow
                key={doc.id}
                doc={doc}
                className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-border px-4 py-3 last:border-0 transition-colors hover:bg-hover cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{doc.name}</p>
                    <div className="mt-0.5 flex flex-wrap gap-1">
                      {doc.tags.map((tag) => (
                        <span key={tag} className="text-[10px] text-muted-foreground">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="hidden text-sm text-muted-foreground sm:block">{doc.uploadedBy}</span>
                <span className="hidden text-sm text-muted-foreground md:block">
                  {formatDateTime(doc.uploadedAt)}
                </span>
                <span className="hidden text-sm text-muted-foreground lg:block">
                  {formatFileSize(doc.size)}
                </span>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px]">
                    v{doc.version}
                  </Badge>
                  <Badge variant={ocrBadgeVariant[doc.ocrStatus]} className="text-[10px]">
                    {doc.ocrStatus}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </DraggableDocumentRow>
            );
          })}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((doc) => {
            const Icon = fileIcons[doc.type];
            return (
              <DraggableDocumentRow
                key={doc.id}
                doc={doc}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 transition-all hover:border-accent/30 hover:shadow-card cursor-grab active:cursor-grabbing"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted transition-colors group-hover:bg-accent/10">
                  <Icon className="h-7 w-7 text-muted-foreground group-hover:text-accent" />
                </div>
                <p className="w-full truncate text-center text-xs font-medium">{doc.name}</p>
                <p className="text-[10px] text-muted-foreground">{formatFileSize(doc.size)}</p>
              </DraggableDocumentRow>
            );
          })}
        </div>
      )}
    </div>
  );
}
