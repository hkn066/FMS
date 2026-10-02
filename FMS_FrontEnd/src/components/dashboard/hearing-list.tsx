"use client";

import { Calendar, Clock, MapPin } from "lucide-react";
import type { Hearing } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ViewAllLink } from "@/components/dashboard/view-all-link";
import { formatDate } from "@/lib/utils";

const HEARING_LIMIT = 3;

interface HearingListProps {
  hearings: Hearing[];
  limit?: number;
  showViewAll?: boolean;
}

export function HearingList({ hearings, limit = HEARING_LIMIT, showViewAll = true }: HearingListProps) {
  const today = new Date().toISOString().split("T")[0];
  const todayHearings = hearings.filter((h) => h.date === today);
  const upcomingHearings = hearings.filter((h) => h.date !== today);
  const displayedHearings = [...todayHearings, ...upcomingHearings].slice(0, limit);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Yaklaşan Duruşmalar</CardTitle>
          {todayHearings.length > 0 && (
            <Badge variant="warning">Bugün {todayHearings.length}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedHearings.length === 0 ? (
          <p className="text-sm text-slate-500">Yaklaşan duruşma bulunmuyor.</p>
        ) : (
          displayedHearings.map((hearing) => {
            const isToday = hearing.date === today;
            return (
              <div
                key={hearing.id}
                className="rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50 dark:border-border dark:hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{hearing.caseTitle}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{hearing.court}</p>
                  </div>
                  {isToday && <Badge variant="warning">Bugün</Badge>}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(hearing.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {hearing.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {hearing.location}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
      {showViewAll && (
        <CardFooter className="pt-0">
          <ViewAllLink href="/calendar" />
        </CardFooter>
      )}
    </Card>
  );
}
