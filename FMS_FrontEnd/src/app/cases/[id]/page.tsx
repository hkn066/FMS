"use client";

import { notFound } from "next/navigation";
import { use, useState } from "react";
import { Edit, FilePlus, MessageSquare, MoreHorizontal, Share2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { CaseSidebar } from "@/components/case/case-sidebar";
import { CaseTimeline } from "@/components/case/case-timeline";
import { DmsExplorer } from "@/components/documents/dms-explorer";
import { PendingTasks } from "@/components/dashboard/pending-tasks";
import { ErrorState, PageLoader } from "@/components/shared/page-loader";
import { useCase, useTasks } from "@/hooks/use-api";
import { mockTimeline } from "@/lib/mock-data";
import { CASE_STATUSES } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Client } from "@/types";

interface CaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("overview");
  const { data: caseData, isLoading, error, refetch } = useCase(id);
  const { data: tasksData } = useTasks();

  if (isLoading) {
    return (
      <AppShell>
        <PageLoader />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <ErrorState message="Dava detayı yüklenemedi" onRetry={() => refetch()} />
      </AppShell>
    );
  }

  if (!caseData) {
    notFound();
  }

  const statusConfig = CASE_STATUSES[caseData.status];
  const caseTasks = (tasksData ?? []).filter((t) => t.caseId === id);

  const client: Client = {
    id: caseData.clientId,
    name: caseData.clientName,
    email: "",
    phone: "",
    type: "corporate",
    status: "active",
    createdAt: "",
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-slate-500">{caseData.caseNumber}</span>
              <span
                className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium ${statusConfig.color}`}
              >
                {statusConfig.label}
              </span>
            </div>
            <h1 className="text-2xl font-medium tracking-tight text-slate-900 lg:text-3xl">{caseData.title}</h1>
            {caseData.description && (
              <p className="max-w-2xl text-sm text-slate-500">{caseData.description}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
              Paylaş
            </Button>
            <Button variant="outline" size="sm">
              <FilePlus className="h-4 w-4" />
              Belge Ekle
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4" />
              Mesaj
            </Button>
            <Button variant="accent" size="sm">
              <Edit className="h-4 w-4" />
              Düzenle
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {activeTab === "overview" && (
            <div className="lg:col-span-3">
              <CaseSidebar caseData={caseData} client={client} />
            </div>
          )}

          <div className={activeTab === "overview" ? "lg:col-span-9" : "lg:col-span-12"}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
                <TabsTrigger value="documents">Dosyalar</TabsTrigger>
                <TabsTrigger value="hearings">Duruşmalar</TabsTrigger>
                <TabsTrigger value="tasks">Görevler</TabsTrigger>
                <TabsTrigger value="finance">Finans</TabsTrigger>
                <TabsTrigger value="notes">Notlar</TabsTrigger>
                <TabsTrigger value="history">Geçmiş</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <CaseTimeline events={mockTimeline} />
              </TabsContent>

              <TabsContent value="documents">
                <DmsExplorer caseId={id} mode="manage" allFoldersLabel="Tüm Dosyalar" />
              </TabsContent>

              <TabsContent value="hearings">
                <Card className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle>Duruşma Takvimi</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-sm text-slate-500">
                      Sonraki duruşma: {caseData.nextHearing ?? "Planlanmamış"}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks">
                <PendingTasks tasks={caseTasks} showViewAll={false} limit={50} />
              </TabsContent>

              <TabsContent value="finance">
                <div className="grid gap-6 sm:grid-cols-3">
                  <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <CardContent className="p-6">
                      <p className="text-xs text-slate-500">Toplam Ücret</p>
                      <p className="mt-1 text-2xl font-medium text-slate-900">{formatCurrency(125000)}</p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <CardContent className="p-6">
                      <p className="text-xs text-slate-500">Tahsil Edilen</p>
                      <p className="mt-1 text-2xl font-medium text-emerald-600">{formatCurrency(85000)}</p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <CardContent className="p-6">
                      <p className="text-xs text-slate-500">Bekleyen</p>
                      <p className="mt-1 text-2xl font-medium text-amber-600">{formatCurrency(40000)}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="notes">
                <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <CardContent className="p-6">
                    <p className="text-sm text-slate-500">Henüz not eklenmemiş.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <CaseTimeline events={mockTimeline} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
