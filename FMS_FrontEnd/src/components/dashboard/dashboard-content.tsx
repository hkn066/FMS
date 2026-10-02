"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { HearingList } from "@/components/dashboard/hearing-list";
import { PendingTasks } from "@/components/dashboard/pending-tasks";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ErrorState, PageLoader } from "@/components/shared/page-loader";
import { useDashboard, useDocuments, useHearings, useTasks } from "@/hooks/use-api";
import { useAuthStore } from "@/store/auth-store";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { LawyerPerformance } from "@/components/dashboard/lawyer-performance";
import { Briefcase, Calendar, CheckSquare, FileText } from "lucide-react";

export function DashboardContent() {
  const user = useAuthStore((s) => s.user);
  const { data: stats, isLoading, refetch, isError } = useDashboard();
  const { data: hearingsData } = useHearings();
  const { data: tasksData } = useTasks();
  const { data: documentsData } = useDocuments();

  if (isLoading) return <PageLoader />;

  const hearings = hearingsData ?? [];
  const tasks = tasksData ?? [];
  const documents = documentsData?.documents ?? [];
  const today = new Date().toISOString().split("T")[0];
  const todayHearings = hearings.filter((h) => h.date === today).length;
  const pendingTasks = tasks.filter((t) => t.status !== "completed").length;
  const firstName = user?.fullName?.split(" ").slice(1).join(" ") || user?.fullName || "Kullanıcı";

  return (
    <div className="space-y-8">
      {isError && (
        <ErrorState message="KPI verileri yüklenemedi" onRetry={() => refetch()} />
      )}
      <div>
        <h2 className="text-2xl font-medium tracking-tight text-slate-900">Günaydın, {firstName}</h2>
        <p className="mt-2 text-sm text-slate-500">
          Bugün {todayHearings} duruşmanız ve {pendingTasks} bekleyen göreviniz var.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Aktif Davalar" value={stats?.activeCases ?? 0} icon={Briefcase} index={0} />
        <StatCard title="Bekleyen Görevler" value={stats?.pendingTasks ?? 0} icon={CheckSquare} index={1} />
        <StatCard title="Yaklaşan Duruşmalar" value={stats?.upcomingHearings ?? 0} icon={Calendar} index={2} />
        <StatCard title="Toplam Belge" value={stats?.totalDocuments ?? 0} icon={FileText} index={3} />
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <RevenueChart />
          <div className="grid gap-8 md:grid-cols-2">
            <HearingList hearings={hearings} />
            <PendingTasks tasks={tasks} />
          </div>
          <RecentDocuments documents={documents} />
        </div>
        <div className="space-y-8 lg:col-span-4">
          <QuickActions />
          <ActivityTimeline />
          <LawyerPerformance />
        </div>
      </div>
    </div>
  );
}
