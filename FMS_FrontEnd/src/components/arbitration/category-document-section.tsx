"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Trash2 } from "lucide-react";
import { arbitrationService } from "@/services/arbitration-service";
import { queryKeys } from "@/hooks/use-api";
import type { ArbitrationDocument, ArbitrationDocumentCategory } from "@/types/arbitration";
import { DropZone } from "@/components/documents/drop-zone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

interface CategoryDocumentSectionProps {
  caseId: string;
  category: ArbitrationDocumentCategory;
  label: string;
  documents: ArbitrationDocument[];
}

function formatFileSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CategoryDocumentSection({
  caseId,
  category,
  label,
  documents,
}: CategoryDocumentSectionProps) {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => arbitrationService.uploadDocument(caseId, file, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.arbitrationDocuments(caseId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => arbitrationService.deleteDocument(caseId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.arbitrationDocuments(caseId) });
    },
  });

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (file) uploadMutation.mutate(file);
  };

  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{label}</CardTitle>
          <span className="text-xs text-slate-500">{documents.length} belge</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <DropZone onFilesDrop={handleFiles}>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 transition-colors hover:border-accent hover:bg-accent/5">
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length) handleFiles(files);
                e.target.value = "";
              }}
            />
            <p className="text-sm font-medium text-slate-900">Dosya seç veya sürükle</p>
            <p className="text-xs text-slate-500">PDF, JPG, PNG — Maks. 50MB</p>
          </label>
        </DropZone>
        {uploadMutation.isPending && (
          <p className="text-xs text-slate-500">Yükleniyor...</p>
        )}
        {uploadMutation.error && (
          <p className="text-xs text-destructive">{(uploadMutation.error as Error).message}</p>
        )}
        {documents.length > 0 && (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2 transition-colors hover:bg-slate-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <FileText className="h-4 w-4 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{doc.name}</p>
                    <p className="text-xs text-slate-500">
                      {[formatFileSize(doc.fileSize), doc.uploadedBy, doc.uploadedAt && formatDateTime(doc.uploadedAt)]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-slate-400 hover:text-destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(doc.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
