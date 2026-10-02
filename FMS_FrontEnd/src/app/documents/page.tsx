"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { DmsExplorer } from "@/components/documents/dms-explorer";
import { useDocuments } from "@/hooks/use-api";

function DocumentsContent() {
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folder") ?? undefined;
  const { data } = useDocuments();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">DMS Evrak Havuzu</h2>
        <p className="mt-1 text-sm text-slate-500">
          Genel Dosyalar ve Sigorta Tahkim klasör ağacında belgeleri görüntüleyin ve sürükle-bırak ile taşıyın.
          {data?.total !== undefined && ` · ${data.total} belge`}
        </p>
      </div>

      <DmsExplorer mode="browse" initialFolderId={folderId} />
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <AppShell title="DMS Evrak Havuzu">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Yükleniyor...</p>}>
        <DocumentsContent />
      </Suspense>
    </AppShell>
  );
}
