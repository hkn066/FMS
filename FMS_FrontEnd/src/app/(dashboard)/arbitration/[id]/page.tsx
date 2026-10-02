"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { DmsExplorer } from "@/components/documents/dms-explorer";
import { UpdateCourtBasisButton } from "@/components/arbitration/update-court-basis-dialog";
import {
  ArbitrationStatusBadge,
  PendingEsasAlert,
} from "@/components/arbitration/arbitration-badges";
import { ErrorState, PageLoader } from "@/components/shared/page-loader";
import { useArbitrationCase } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ArbitrationDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const {
    data: caseData,
    isLoading: caseLoading,
    error: caseError,
    refetch: refetchCase,
  } = useArbitrationCase(id);

  const needsCourtBasis = !caseData?.courtBasisNumber?.trim();

  return (
    <AppShell title="Tahkim Detay">
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href="/arbitration">
            <ChevronLeft className="h-4 w-4" />
            Sigorta Tahkim
          </Link>
        </Button>

        {caseLoading && <PageLoader />}
        {caseError && (
          <ErrorState message="Tahkim dosyası yüklenemedi" onRetry={() => refetchCase()} />
        )}

        {caseData && needsCourtBasis && (
          <PendingEsasAlert action={<UpdateCourtBasisButton caseId={id} />} />
        )}

        {caseData && (
          <Tabs defaultValue="files">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="files">Dosyalar</TabsTrigger>
              <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            </TabsList>

            <TabsContent value="files" className="mt-6">
              <DmsExplorer
                arbitrationCaseId={id}
                dmsRootFolderId={caseData.dmsRootFolderId}
                mode="manage"
                showFolderTree={false}
              />
            </TabsContent>

            <TabsContent value="overview" className="mt-6">
              <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                <CardContent className="space-y-4 p-6 text-sm text-slate-500">
                  <p>
                    <span className="font-medium text-slate-900">Klasör:</span>{" "}
                    {caseData.folderName}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Müvekkil:</span>{" "}
                    {caseData.clientNameSurname}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Plaka:</span>{" "}
                    {caseData.licensePlate}
                  </p>
                  {caseData.arbitrationFileNumber && (
                    <p>
                      <span className="font-medium text-slate-900">Tahkim No:</span>{" "}
                      {caseData.arbitrationFileNumber}
                    </p>
                  )}
                  <p>
                    <span className="font-medium text-slate-900">Durum:</span>{" "}
                    <ArbitrationStatusBadge status={caseData.status} />
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppShell>
  );
}
