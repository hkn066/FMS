"use client";

import { File, FileImage, FileSpreadsheet, FileText } from "lucide-react";
import type { Document } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ViewAllLink } from "@/components/dashboard/view-all-link";
import { formatDateTime } from "@/lib/utils";

const DOCUMENT_LIMIT = 4;

const fileIcons: Record<Document["type"], React.ElementType> = {
  pdf: FileText,
  docx: File,
  xlsx: FileSpreadsheet,
  image: FileImage,
  other: File,
};

const ocrBadgeClasses: Record<Document["ocrStatus"], string> = {
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400",
  processing:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400",
  failed: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400",
  pending: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400",
};

const ocrLabels: Record<Document["ocrStatus"], string> = {
  completed: "OCR ✓",
  processing: "OCR...",
  failed: "OCR ✗",
  pending: "OCR Bekliyor",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface RecentDocumentsProps {
  documents: Document[];
  limit?: number;
  showViewAll?: boolean;
}

export function RecentDocuments({
  documents,
  limit = DOCUMENT_LIMIT,
  showViewAll = true,
}: RecentDocumentsProps) {
  const displayedDocuments = documents.slice(0, limit);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Son Yüklenen Belgeler</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedDocuments.length === 0 ? (
          <p className="text-sm text-slate-500">Henüz belge yüklenmemiş.</p>
        ) : (
          displayedDocuments.map((doc) => {
            const Icon = fileIcons[doc.type];
            return (
              <div
                key={doc.id}
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50 dark:border-border dark:hover:bg-muted/50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <Icon className="h-4 w-4 text-slate-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{doc.name}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                    <span>{doc.uploadedBy}</span>
                    <span>•</span>
                    <span>{formatDateTime(doc.uploadedAt)}</span>
                    <span>•</span>
                    <span>{formatFileSize(doc.size)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Badge variant="outline" className="border-slate-200 bg-slate-50 text-[10px] text-slate-600">
                    v{doc.version}
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] ${ocrBadgeClasses[doc.ocrStatus]}`}>
                    {ocrLabels[doc.ocrStatus]}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
      {showViewAll && (
        <CardFooter className="pt-0">
          <ViewAllLink href="/documents" />
        </CardFooter>
      )}
    </Card>
  );
}
