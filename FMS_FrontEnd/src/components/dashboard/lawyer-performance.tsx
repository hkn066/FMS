"use client";

import { Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ViewAllLink } from "@/components/dashboard/view-all-link";
import { useLawyerPerformance } from "@/hooks/use-api";

const PERFORMANCE_LIMIT = 4;

function LawyerPerformanceSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: PERFORMANCE_LIMIT }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32 bg-slate-100" />
            <Skeleton className="h-4 w-16 bg-slate-100" />
          </div>
          <Skeleton className="h-2 w-full rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function LawyerPerformanceEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-8 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Users className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-slate-900">Performans verisi yok</p>
      <p className="mt-1 text-xs text-slate-500">Avukatlara atanmış dava ve görevler oluştukça özet burada görünür.</p>
    </div>
  );
}

export function LawyerPerformance() {
  const { data = [], isLoading, isError } = useLawyerPerformance();
  const displayed = data.slice(0, PERFORMANCE_LIMIT);

  return (
    <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle>Avukat Performansı</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LawyerPerformanceSkeleton />
        ) : isError ? (
          <p className="text-sm text-slate-500">Performans verileri yüklenemedi.</p>
        ) : displayed.length === 0 ? (
          <LawyerPerformanceEmptyState />
        ) : (
          <div className="space-y-6">
            {displayed.map((lawyer) => (
              <div key={lawyer.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-900">{lawyer.name}</span>
                  <span className="text-slate-500">{lawyer.cases} dava</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                      <span>Tamamlanma Oranı</span>
                      <span className="font-medium text-slate-900">{lawyer.winRate}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-amber-200/80 transition-all duration-500"
                        style={{ width: `${lawyer.winRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Görev</p>
                    <p className="text-sm font-medium text-slate-900">{lawyer.tasksCompleted}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {!isLoading && displayed.length > 0 && (
        <CardFooter className="pt-0">
          <ViewAllLink href="/reports" label="Detaylı Rapor" />
        </CardFooter>
      )}
    </Card>
  );
}
