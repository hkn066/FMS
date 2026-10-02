"use client";

import {
  Activity,
  Briefcase,
  Calendar,
  CheckSquare,
  DollarSign,
  FileText,
  MessageSquare,
} from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import type { Activity as ActivityItem } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ViewAllLink } from "@/components/dashboard/view-all-link";
import { useActivities } from "@/hooks/use-api";

const ACTIVITY_LIMIT = 5;

const activityIcons: Record<ActivityItem["type"], React.ElementType> = {
  case: Briefcase,
  document: FileText,
  task: CheckSquare,
  hearing: Calendar,
  message: MessageSquare,
  finance: DollarSign,
};

const activityColors: Record<ActivityItem["type"], string> = {
  case: "bg-amber-50 text-amber-800 border border-amber-100",
  document: "bg-slate-50 text-slate-600 border border-slate-100",
  task: "bg-emerald-50 text-emerald-800 border border-emerald-100",
  hearing: "bg-rose-50 text-rose-800 border border-rose-100",
  message: "bg-slate-50 text-slate-600 border border-slate-100",
  finance: "bg-amber-50 text-amber-800 border border-amber-100",
};

interface ActivityTimelineProps {
  limit?: number;
  showViewAll?: boolean;
}

function ActivityTimelineSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex gap-4">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full bg-slate-100" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 bg-slate-100" />
            <Skeleton className="h-3 w-full bg-slate-100" />
            <Skeleton className="h-3 w-1/2 bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Activity className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-slate-900">Henüz aktivite yok</p>
      <p className="mt-1 max-w-[220px] text-xs text-slate-500">
        Sistemde gerçekleşen işlemler burada kronolojik olarak listelenecek.
      </p>
    </div>
  );
}

export function ActivityTimeline({ limit = ACTIVITY_LIMIT, showViewAll = true }: ActivityTimelineProps) {
  const { data: activities = [], isLoading, isError } = useActivities(limit);

  return (
    <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle>Son Aktiviteler</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ActivityTimelineSkeleton />
        ) : isError ? (
          <p className="text-sm text-slate-500">Aktiviteler yüklenemedi.</p>
        ) : activities.length === 0 ? (
          <ActivityEmptyState />
        ) : (
          <ScrollArea className="h-[280px] pr-4">
            <div className="relative space-y-0">
              <div className="absolute bottom-2 left-[15px] top-2 w-px bg-slate-100" />
              {activities.map((activity) => {
                const Icon = activityIcons[activity.type];
                return (
                  <div key={activity.id} className="relative flex gap-4 pb-6 last:pb-0">
                    <div
                      className={cn(
                        "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        activityColors[activity.type],
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{activity.description}</p>
                      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-500">
                        <span>{activity.user}</span>
                        <span>•</span>
                        <span>{formatDateTime(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      {showViewAll && !isLoading && activities.length > 0 && (
        <CardFooter className="pt-0">
          <ViewAllLink href="/reports" label="Tüm Aktiviteler" />
        </CardFooter>
      )}
    </Card>
  );
}
