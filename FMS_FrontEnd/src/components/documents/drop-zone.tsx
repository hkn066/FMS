"use client";

import { useCallback, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudUpload, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { DOCUMENT_DRAG_TYPE, FOLDER_DRAG_TYPE } from "@/components/documents/folder-tree";

interface DropZoneProps {
  onFilesDrop?: (files: File[]) => void;
  className?: string;
  children?: ReactNode;
}

function isInternalDmsDrag(e: React.DragEvent): boolean {
  return (
    e.dataTransfer.types.includes(FOLDER_DRAG_TYPE) ||
    e.dataTransfer.types.includes(DOCUMENT_DRAG_TYPE)
  );
}

function isFileDrag(e: React.DragEvent): boolean {
  return e.dataTransfer.types.includes("Files");
}

export function DropZone({ onFilesDrop, className, children }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent, dragging: boolean) => {
    if (isInternalDmsDrag(e)) return;
    if (!isFileDrag(e)) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (isInternalDmsDrag(e)) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      onFilesDrop?.(files);
    },
    [onFilesDrop],
  );

  return (
    <div
      onDragEnter={(e) => handleDrag(e, true)}
      onDragLeave={(e) => handleDrag(e, false)}
      onDragOver={(e) => {
        if (isInternalDmsDrag(e)) return;
        if (isFileDrag(e)) e.preventDefault();
      }}
      onDrop={handleDrop}
      className={cn("relative", className)}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl border-2 border-dashed border-accent bg-accent/5 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-3 text-accent">
              <CloudUpload className="h-12 w-12" />
              <p className="text-sm font-medium">Belgeleri buraya bırakın</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}

export function UploadArea({ onFilesDrop }: { onFilesDrop?: (files: File[]) => void }) {
  return (
    <Card
      className="flex cursor-pointer flex-col items-center justify-center gap-3 border-dashed p-8 transition-colors hover:border-accent hover:bg-accent/5"
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.onchange = (e) => {
          const files = Array.from((e.target as HTMLInputElement).files ?? []);
          onFilesDrop?.(files);
        };
        input.click();
      }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
        <FileUp className="h-6 w-6 text-accent" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">Belge yüklemek için tıklayın veya sürükleyin</p>
        <p className="mt-1 text-xs text-muted-foreground">PDF, DOCX, XLSX, JPG — Maks. 50MB</p>
      </div>
    </Card>
  );
}
