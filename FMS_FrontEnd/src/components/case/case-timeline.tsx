"use client";

import {
  Calendar,
  FileText,
  Gavel,
  MessageSquare,
  StickyNote,
} from "lucide-react";
import type { TimelineEvent } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const eventIcons: Record<TimelineEvent["type"], React.ElementType> = {
  hearing: Gavel,
  document: FileText,
  note: StickyNote,
  task: Calendar,
  status: MessageSquare,
};

const eventColors: Record<TimelineEvent["type"], string> = {
  hearing: "border-amber-500 bg-amber-50 dark:bg-amber-900/20",
  document: "border-purple-500 bg-purple-50 dark:bg-purple-900/20",
  note: "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
  task: "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
  status: "border-slate-500 bg-slate-50 dark:bg-slate-800",
};

interface CaseTimelineProps {
  events: TimelineEvent[];
}

export function CaseTimeline({ events }: CaseTimelineProps) {
  return (
    <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle>Dava Geçmişi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-slate-100" />
          {events.map((event) => {
            const Icon = eventIcons[event.type];
            return (
              <div key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
                <div
                  className={cn(
                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white",
                    eventColors[event.type],
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">{event.title}</p>
                    <time className="shrink-0 text-xs text-slate-500">
                      {formatDate(event.date)}
                    </time>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{event.description}</p>
                  <p className="mt-1.5 text-xs text-slate-500">{event.user}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
